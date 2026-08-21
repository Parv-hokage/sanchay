import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { MeService } from '../me/me.service';
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
} from '../types';

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
    private readonly meService: MeService,
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
    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication token required to access Sanchay AI.');
    }

    const rawMessage = dto.message.trim();
    const context = dto.context || {};
    const userId = user.id;
    const conversationId = dto.conversationId || uuidv4();

    // 0. Authoritatively load the user's verified Sanchay profile
    const userProfile = await this.meService.getProfile(userId);

    // 1. Retrieve Conversation History (Last 10 messages) & Enforce User Isolation
    let historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];

    if (dto.conversationId) {
      let existingConv: any = null;
      try {
        if (user?.id) {
          existingConv = await this.prisma.aiConversation.findUnique({
            where: { id: dto.conversationId },
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
                take: 10,
              },
            },
          });
        }
      } catch (err: any) {
        if (err instanceof ForbiddenException) throw err;
      }

      if (existingConv) {
        if (existingConv.userId !== user.id) {
          throw new ForbiddenException('Access denied to this conversation.');
        }
        historyMessages = existingConv.messages.map((m: any) => ({
          role: (m.sender === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        }));
      } else {
        const inMemConv = inMemoryConversations.get(dto.conversationId);
        if (inMemConv) {
          if (user?.id && inMemConv.userId !== user.id) {
            throw new ForbiddenException('Access denied to this conversation.');
          }
          const inMemMsgs = inMemoryMessages.get(dto.conversationId) || [];
          historyMessages = inMemMsgs.slice(-10).map((m: any) => ({
            role: (m.sender === MessageSender.USER ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content,
          }));
        }
      }
    }

    // Client history fallback (stateless / serverless resilience)
    if (historyMessages.length === 0 && dto.history && dto.history.length > 0) {
      historyMessages = dto.history.slice(-10).map((h) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content,
      }));
    }

    // 2. Intent Detection with Conversation History Context
    const detected = this.intentService.detectIntent(
      rawMessage,
      context.serviceId,
      historyMessages,
    );
    this.logger.log(
      `[AI Orchestrator] Intent detected: ${detected.intent} (Service: ${detected.extractedServiceSlug || context.serviceId}, Confidence: ${detected.confidence})`,
    );

    // 3. Resolve Service Capability & Action Cards
    const targetServiceSlug = detected.extractedServiceSlug || context.serviceId;
    const resolvedCap = this.capabilityResolver.resolveCapability(
      detected.intent,
      targetServiceSlug,
      detected.extractedParameters,
    );

    // 4. Grounded Knowledge Retrieval (RAG) — Strictly conditional on informational and document queries
    let citations: Citation[] = [];
    let retrievedEvidence: any[] = [];

    const isInformationalQuery =
      detected.intent === IntentType.KNOWLEDGE_QUERY ||
      detected.intent === IntentType.ELIGIBILITY_CHECK ||
      detected.intent === IntentType.FIND_DOCUMENT;

    if (isInformationalQuery) {
      let searchQuery = rawMessage;
      if (rawMessage.length < 25) {
        if (detected.intent === IntentType.ELIGIBILITY_CHECK) {
          searchQuery = `${targetServiceSlug || 'jee-main'} eligibility criteria qualification`;
        } else if (detected.intent === IntentType.FIND_DOCUMENT) {
          searchQuery = `${targetServiceSlug || 'jee-main'} required documents certificates upload`;
        }
      }

      const searchRes = await this.knowledgeService.searchKnowledge({
        query: searchQuery,
        serviceId: targetServiceSlug,
        limit: 3,
      });

      if (searchRes.evidence && searchRes.evidence.length > 0) {
        retrievedEvidence = searchRes.evidence;
        citations = searchRes.evidence.map((e) => e.citation);
      }
    }

    // 5. Assemble Task-Scoped Least-Privilege Prompt Context with History
    const effectiveContext = {
      ...context,
      serviceId: targetServiceSlug || context.serviceId,
    };

    const promptMessages = this.contextBuilder.buildPromptContext(
      rawMessage,
      effectiveContext,
      retrievedEvidence,
      resolvedCap ? { capability: resolvedCap.name, description: resolvedCap.description } : undefined,
      historyMessages as any,
      userProfile,
    );

    // 6. Generate Grounded AI Response via Qwen3 Adapter
    const aiAnswer = await this.qwen3Adapter.generateText(promptMessages);

    // 7. Action Card Attachment
    const actionCard: ActionCard | undefined = resolvedCap?.actionCard;

    // 8. Conversation & Message Persistence
    const messageId = uuidv4();

    try {
      if (user?.id) {
        inMemoryConversations.set(conversationId, {
          id: conversationId,
          userId: user.id,
          serviceId: targetServiceSlug,
          title: rawMessage.substring(0, 40),
          updatedAt: new Date(),
        });

        await this.prisma.aiConversation.upsert({
          where: { id: conversationId },
          create: {
            id: conversationId,
            userId: user.id,
            serviceId: targetServiceSlug,
            title: rawMessage.substring(0, 40),
            contextMetadata: effectiveContext as any,
          },
          update: {
            updatedAt: new Date(),
            contextMetadata: effectiveContext as any,
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

    // 9. Record AI Audit Event
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
