import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AiService } from './ai.service';
import { Qwen3Adapter } from './provider/qwen3.adapter';
import { IntentDetectionService } from './services/intent-detection.service';
import { ContextBuilderService } from './services/context-builder.service';
import { CapabilityResolverService } from './services/capability-resolver.service';
import { ToolRegistryService } from './tools/tool-registry.service';
import { IntentType, RiskLevel } from '@sanchay/types';

describe('Phase 7: JEE Service Recreation & AI Integration Tests', () => {
  let aiService: AiService;
  let toolRegistry: ToolRegistryService;
  let contextBuilder: ContextBuilderService;
  let intentService: IntentDetectionService;
  let mockKnowledge: any;
  let mockApplication: any;
  let mockDocument: any;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      aiConversation: {
        upsert: vi.fn().mockResolvedValue({ id: 'conv-jee-1' }),
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      aiMessage: {
        create: vi.fn().mockResolvedValue({ id: 'msg-jee-1' }),
      },
    };

    mockAudit = {
      recordEvent: vi.fn().mockResolvedValue({}),
    };

    mockKnowledge = {
      searchKnowledge: vi.fn().mockResolvedValue({
        query: 'What is the syllabus for JEE Main Physics?',
        count: 1,
        evidence: [
          {
            chunkId: 'chk-syl-1',
            title: 'JEE (Main) 2026 Official Syllabus',
            snippet: 'Physics Section Syllabus: Units & Measurements, Kinematics, Laws of Motion, Thermodynamics, Optics...',
            url: 'https://jeemain.nta.nic.in/syllabus',
            section: 'Physics Syllabus Breakdown',
            page: 1,
            score: 0.92,
            authorityLevel: 'TIER_1_OFFICIAL_GOV',
            citation: {
              sourceId: 'src-jee-main',
              sourceTitle: 'JEE (Main) 2026 Official Syllabus',
              url: 'https://jeemain.nta.nic.in/syllabus',
              section: 'Physics Syllabus Breakdown',
              page: 1,
              authorityLevel: 'TIER_1_OFFICIAL_GOV',
            },
          },
        ],
      }),
    };

    mockApplication = {
      autofillApplication: vi.fn().mockResolvedValue({ success: true }),
      getApplicationReview: vi.fn().mockResolvedValue({ status: 'READY_FOR_REVIEW' }),
      submitApplication: vi.fn().mockResolvedValue({ referenceCode: 'JEE2026-NTA-SIM-001' }),
    };

    mockDocument = {
      listDocuments: vi.fn().mockResolvedValue([]),
    };

    const qwenAdapter = new Qwen3Adapter();
    intentService = new IntentDetectionService();
    contextBuilder = new ContextBuilderService();
    const capabilityResolver = new CapabilityResolverService();
    toolRegistry = new ToolRegistryService(
      mockKnowledge as any,
      mockApplication as any,
      mockDocument as any,
    );

    aiService = new AiService(
      mockPrisma as any,
      mockAudit as any,
      mockKnowledge as any,
      qwenAdapter,
      intentService,
      contextBuilder,
      capabilityResolver,
      toolRegistry,
    );
  });

  it('detects NAVIGATE_SERVICE intent for JEE section queries (e.g. "open the syllabus")', async () => {
    const detected = intentService.detectIntent('Open the JEE Main syllabus', 'jee-main');
    expect(detected.intent).toBe(IntentType.NAVIGATE_SERVICE);
    expect(detected.extractedParameters.section).toBe('syllabus');
    expect(detected.extractedServiceSlug).toBe('jee-main');
  });

  it('detects KNOWLEDGE_QUERY for official answer key and public notice queries', async () => {
    const detected = intentService.detectIntent('Has the final answer key been released for Session 1?', 'jee-main');
    expect(detected.intent).toBe(IntentType.KNOWLEDGE_QUERY);
    expect(detected.extractedParameters.section).toBe('papers');
  });

  it('assembles screen-aware context without leaking unrelated citizen profile or vault data', () => {
    const messages = contextBuilder.buildPromptContext(
      'Explain this section for me',
      {
        serviceId: 'jee-main',
        section: 'notices',
        activeItem: 'Display of Final Answer Keys for JEE (Main) 2026 Session 1',
        route: '/services/jee-main?section=notices',
      },
      [],
    );

    const systemPrompt = messages.find((m) => m.role === 'system')?.content || '';
    expect(systemPrompt).toContain('Active Service: jee-main');
    expect(systemPrompt).toContain('Active Section: notices');
    expect(systemPrompt).toContain('Display of Final Answer Keys');
    expect(systemPrompt).toContain('Current Route: /services/jee-main?section=notices');
    expect(systemPrompt).not.toContain('Aadhaar');
    expect(systemPrompt).not.toContain('Citizen Vault Documents');
  });

  it('executes jee.check_eligibility tool deterministically', async () => {
    const eligibleResult = await toolRegistry.executeTool('jee.check_eligibility', { passingYear: 2025 });
    expect(eligibleResult.result.eligible).toBe(true);
    expect(eligibleResult.result.criteria.mandatorySubjects).toContain('Physics');
    expect(eligibleResult.result.criteria.mandatorySubjects).toContain('Mathematics');

    const ineligibleResult = await toolRegistry.executeTool('jee.check_eligibility', { passingYear: 2020 });
    expect(ineligibleResult.result.eligible).toBe(false);
  });

  it('executes jee.open_section navigation tool and returns valid service route', async () => {
    const navResult = await toolRegistry.executeTool('jee.open_section', { section: 'syllabus' });
    expect(navResult.result.serviceSlug).toBe('jee-main');
    expect(navResult.result.section).toBe('syllabus');
    expect(navResult.result.route).toBe('/services/jee-main?section=syllabus');
  });

  it('does NOT trigger RAG or return citations for casual greetings ("hi")', async () => {
    const response = await aiService.processChatMessage({
      message: 'hi',
      context: { serviceId: 'jee-main' },
    });

    expect(response.intent).toBe(IntentType.GENERAL_HELP);
    expect(response.citations).toHaveLength(0);
    expect(mockKnowledge.searchKnowledge).not.toHaveBeenCalled();
    expect(response.content).toContain('Namaste!');
  });

  it('does NOT trigger RAG or return citations for capability questions ("what all can you do?")', async () => {
    const response = await aiService.processChatMessage({
      message: 'what all can you do?',
      context: { serviceId: 'jee-main' },
    });

    expect(response.intent).toBe(IntentType.GENERAL_HELP);
    expect(response.citations).toHaveLength(0);
    expect(mockKnowledge.searchKnowledge).not.toHaveBeenCalled();
    expect(response.content).toContain('Find and explain official government information');
    expect(response.content).toContain('Navigate government services');
  });

  it('triggers RAG and returns verified citations for factual syllabus queries', async () => {
    const response = await aiService.processChatMessage({
      message: 'What is the syllabus for JEE Main Physics?',
      context: { serviceId: 'jee-main' },
    });

    expect(response.intent).toBe(IntentType.KNOWLEDGE_QUERY);
    expect(mockKnowledge.searchKnowledge).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'What is the syllabus for JEE Main Physics?',
        serviceId: 'jee-main',
      }),
    );
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.citations[0].sourceTitle).toBe('JEE (Main) 2026 Official Syllabus');
  });

  it('maintains conversation history across multiple turns with stable conversationId', async () => {
    // 1st Turn: User asks about JEE Main eligibility
    mockPrisma.aiConversation.findUnique.mockResolvedValueOnce(null);

    const turn1 = await aiService.processChatMessage(
      {
        message: 'What is the eligibility for JEE Main 2026?',
        context: { serviceId: 'jee-main' },
      },
      { id: 'user-citizen-1' },
    );

    expect(turn1.conversationId).toBeDefined();
    expect(turn1.intent).toBe(IntentType.ELIGIBILITY_CHECK);

    // Mock existing conversation in DB for 2nd Turn
    mockPrisma.aiConversation.findUnique.mockResolvedValueOnce({
      id: turn1.conversationId,
      userId: 'user-citizen-1',
      serviceId: 'jee-main',
      messages: [
        { id: 'm1', sender: 'USER', content: 'What is the eligibility for JEE Main 2026?' },
        { id: 'm2', sender: 'AI', content: 'Candidates who passed Class 12 in 2024, 2025, or 2026 are eligible.' },
      ],
    });

    // 2nd Turn: Follow-up question "I am qualified?"
    const turn2 = await aiService.processChatMessage(
      {
        conversationId: turn1.conversationId,
        message: 'I am qualified?',
      },
      { id: 'user-citizen-1' },
    );

    expect(turn2.conversationId).toBe(turn1.conversationId);
    expect(turn2.intent).toBe(IntentType.ELIGIBILITY_CHECK);
    expect(turn2.content).not.toContain('Which government service');
  });

  it('resolves contextual follow-up queries ("what about age?", "what documents do I need?") to JEE context', async () => {
    const history = [
      { role: 'user' as const, content: 'What is JEE Main eligibility?' },
      { role: 'assistant' as const, content: 'Candidates must have passed Class 12.' },
    ];

    // Contextual age query
    const detectedAge = intentService.detectIntent('what about age?', undefined, history);
    expect(detectedAge.intent).toBe(IntentType.ELIGIBILITY_CHECK);
    expect(detectedAge.extractedServiceSlug).toBe('jee-main');

    // Contextual documents query
    const detectedDocs = intentService.detectIntent('what documents do I need?', undefined, history);
    expect(detectedDocs.intent).toBe(IntentType.FIND_DOCUMENT);
    expect(detectedDocs.extractedServiceSlug).toBe('jee-main');
  });

  it('detects START_APPLICATION intent and returns action card linking to /services/jee-main/apply', async () => {
    const detected = intentService.detectIntent('I want to apply for JEE Main.', 'jee-main');
    expect(detected.intent).toBe(IntentType.START_APPLICATION);

    const response = await aiService.processChatMessage({
      message: 'I want to apply for JEE Main.',
      context: { serviceId: 'jee-main' },
    });

    expect(response.intent).toBe(IntentType.START_APPLICATION);
    expect(response.actionCard).toBeDefined();
    expect(response.actionCard?.actionType).toBe('START_APPLICATION');
    expect((response.actionCard?.payload as any)?.route).toBe('/services/jee-main/apply');
  });

  it('enforces cross-user isolation and rejects unauthorized conversation access', async () => {
    // User B tries to access User A's conversation
    mockPrisma.aiConversation.findUnique.mockResolvedValueOnce({
      id: 'conv-user-a',
      userId: 'user-a',
      serviceId: 'jee-main',
      messages: [],
    });

    await expect(
      aiService.processChatMessage(
        {
          conversationId: 'conv-user-a',
          message: 'Show me my previous queries',
        },
        { id: 'user-b' },
      ),
    ).rejects.toThrow('Access denied to this conversation.');
  });
});
