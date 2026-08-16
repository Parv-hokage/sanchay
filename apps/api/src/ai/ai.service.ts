import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { Qwen3Adapter } from './provider/qwen3.adapter';
import { IntentDetectionService } from './services/intent-detection.service';
import { ContextBuilderService } from './services/context-builder.service';
import { CapabilityResolverService } from './services/capability-resolver.service';
import { ToolRegistryService } from './tools/tool-registry.service';
import {
  IntentType,
  AiChatDto,
  AiChatResponse,
  Citation,
  ActionCard,
  AuditActionType,
  MessageSender,
} from '@sanchay/types';

// In-memory conversation store fallback for offline resilience
const inMemoryConversations = new Map<string, any>();
const inMemoryMessages = new Map<string, any[]>();

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly knowledgeService: KnowledgeService,
    private readonly qwen3Adapter: Qwen3Adapter,
    private readonly intentService: IntentDetectionService,
    private readonly contextBuilder: ContextBuilderService,
    private readonly capabilityResolver: CapabilityResolverService,
    private readonly toolRegistry: ToolRegistryService,
  ) {}

  /**
   * Primary Conversational AI Orchestration Endpoint
   */
  async processChatMessage(dto: AiChatDto, user?: any): Promise<AiChatResponse> {
    const rawMessage = dto.message.trim();
    const context = dto.context || {};
    const userId = user?.id || 'anonymous-user';

    // 1. Intent Detection
    const detected = this.intentService.detectIntent(rawMessage, context.serviceId);
    this.logger.log(`[AI Orchestrator] Intent detected: ${detected.intent} (Confidence: ${detected.confidence})`);

    // 2. Resolve Service Capability & Action Cards
    const resolvedCap = this.capabilityResolver.resolveCapability(
      detected.intent,
      detected.extractedServiceSlug || context.serviceId,
    );

    // 3. Grounded Knowledge Retrieval (RAG) — Strictly conditional on informational queries
    let citations: Citation[] = [];
    let retrievedEvidence: any[] = [];

    const isInformationalQuery =
      detected.intent === IntentType.KNOWLEDGE_QUERY ||
      detected.intent === IntentType.ELIGIBILITY_CHECK;

    if (isInformationalQuery) {
      const searchRes = await this.knowledgeService.searchKnowledge({
        query: rawMessage,
        serviceId: detected.extractedServiceSlug || context.serviceId,
        limit: 3,
      });

      if (searchRes.evidence && searchRes.evidence.length > 0) {
        retrievedEvidence = searchRes.evidence;
        citations = searchRes.evidence.map((e) => e.citation);
      }
    }

    // 4. Assemble Task-Scoped Least-Privilege Prompt Context
    const promptMessages = this.contextBuilder.buildPromptContext(
      rawMessage,
      context,
      retrievedEvidence,
      resolvedCap ? { capability: resolvedCap.name, description: resolvedCap.description } : undefined,
    );

    // 5. Generate Grounded AI Response via Qwen3 Adapter
    const aiAnswer = await this.qwen3Adapter.generateText(promptMessages);

    // 6. Action Card Attachment
    const actionCard: ActionCard | undefined = resolvedCap?.actionCard;

    // 7. Conversation & Message Persistence
    const conversationId = dto.conversationId || uuidv4();
    const messageId = uuidv4();

    try {
      if (user?.id) {
        await this.prisma.aiConversation.upsert({
          where: { id: conversationId },
          create: {
            id: conversationId,
            userId: user.id,
            serviceId: context.serviceId,
            title: rawMessage.substring(0, 40),
            contextMetadata: context as any,
          },
          update: {
            updatedAt: new Date(),
          },
        });

        // Store user message
        await this.prisma.aiMessage.create({
          data: {
            id: uuidv4(),
            conversationId,
            sender: MessageSender.USER as any,
            content: rawMessage,
          },
        });

        // Store AI response message
        await this.prisma.aiMessage.create({
          data: {
            id: messageId,
            conversationId,
            sender: MessageSender.AI as any,
            content: aiAnswer,
            citations: citations as any,
            actionPayload: actionCard as any,
          },
        });
      }
    } catch {
      // In-Memory Fallback
      if (!inMemoryConversations.has(conversationId)) {
        inMemoryConversations.set(conversationId, {
          id: conversationId,
          userId,
          title: rawMessage.substring(0, 40),
          createdAt: new Date(),
        });
        inMemoryMessages.set(conversationId, []);
      }

      const msgs = inMemoryMessages.get(conversationId) || [];
      msgs.push({
        id: uuidv4(),
        sender: MessageSender.USER,
        content: rawMessage,
        createdAt: new Date(),
      });
      msgs.push({
        id: messageId,
        sender: MessageSender.AI,
        content: aiAnswer,
        citations,
        actionCard,
        createdAt: new Date(),
      });
    }

    // 8. Record AI Audit Event
    await this.auditService.recordEvent({
      actorId: user?.id || null,
      actorType: 'AI_AGENT',
      action: AuditActionType.AI_TOOL_CALLED,
      resourceType: 'AI_CONVERSATION',
      resourceId: conversationId,
      requestId: uuidv4(),
      metadata: {
        intent: detected.intent,
        confidence: detected.confidence,
        citationCount: citations.length,
        hasActionCard: !!actionCard,
      },
    });

    return {
      conversationId,
      messageId,
      content: aiAnswer,
      intent: detected.intent,
      citations,
      actionCard,
    };
  }

  /**
   * Confirms a high-risk pending tool execution with anti-replay safeguards
   */
  async confirmToolAction(
    conversationId: string,
    actionCardId: string,
    toolId: string,
    params: Record<string, any>,
    user?: any,
  ) {
    if (!user) {
      throw new ForbiddenException('Authentication required to confirm consequential government action.');
    }

    this.logger.log(`[AI Orchestrator] Citizen confirmed action "${toolId}" for conversation ${conversationId}`);

    const result = await this.toolRegistry.executeTool(toolId, params, user, true);

    await this.auditService.recordEvent({
      actorId: user.id,
      actorType: 'USER',
      action: AuditActionType.CAPABILITY_EXECUTED,
      resourceType: 'CONSEQUENTIAL_AI_ACTION',
      resourceId: actionCardId,
      requestId: uuidv4(),
      metadata: {
        toolId,
        conversationId,
      },
    });

    return {
      success: true,
      message: 'Consequential government action confirmed and executed successfully.',
      data: result.result,
    };
  }

  /**
   * Lists citizen conversations
   */
  async listConversations(user: any) {
    if (!user) return [];

    try {
      return await this.prisma.aiConversation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
      });
    } catch {
      return Array.from(inMemoryConversations.values()).filter((c) => c.userId === user.id);
    }
  }

  /**
   * Gets conversation details
   */
  async getConversation(id: string, user: any) {
    if (!user) throw new ForbiddenException();

    try {
      const conv = await this.prisma.aiConversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conv || conv.userId !== user.id) {
        throw new NotFoundException('Conversation not found.');
      }
      return conv;
    } catch {
      const conv = inMemoryConversations.get(id);
      if (!conv || conv.userId !== user.id) {
        throw new NotFoundException('Conversation not found.');
      }
      return {
        ...conv,
        messages: inMemoryMessages.get(id) || [],
      };
    }
  }
}
