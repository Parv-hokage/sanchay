import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AiService } from './ai.service';
import { Qwen3Adapter } from './provider/qwen3.adapter';
import { IntentDetectionService } from './services/intent-detection.service';
import { ContextBuilderService } from './services/context-builder.service';
import { CapabilityResolverService } from './services/capability-resolver.service';
import { ToolRegistryService } from './tools/tool-registry.service';
import { IntentType, RiskLevel } from '../types';

describe('AI Orchestrator & Tool Authorization Tests', () => {
  let aiService: AiService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockKnowledge: any;
  let mockApplication: any;
  let mockDocument: any;

  beforeEach(() => {
    mockPrisma = {
      aiConversation: {
        upsert: vi.fn().mockResolvedValue({ id: 'conv-1' }),
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      aiMessage: {
        create: vi.fn().mockResolvedValue({ id: 'msg-1' }),
      },
    };

    mockAudit = {
      recordEvent: vi.fn().mockResolvedValue({}),
    };

    mockKnowledge = {
      searchKnowledge: vi.fn().mockResolvedValue({
        query: 'What is JEE eligibility?',
        count: 1,
        evidence: [
          {
            chunkId: 'chk-1',
            title: 'JEE Main Information Bulletin',
            snippet: 'Candidates who passed Class 12 in 2024 or 2025 are eligible with no age limit.',
            url: 'https://jeemain.nta.nic.in/information-bulletin',
            section: 'Eligibility Criteria',
            page: 12,
            score: 0.88,
            authorityLevel: 'TIER_1_OFFICIAL_GOV',
            citation: {
              sourceId: 'src-jee',
              sourceTitle: 'JEE Main Information Bulletin',
              url: 'https://jeemain.nta.nic.in/information-bulletin',
              section: 'Eligibility Criteria',
              page: 12,
              authorityLevel: 'TIER_1_OFFICIAL_GOV',
            },
          },
        ],
      }),
    };

    mockApplication = {
      autofillApplication: vi.fn().mockResolvedValue({ success: true }),
      getApplicationReview: vi.fn().mockResolvedValue({ status: 'READY_FOR_REVIEW' }),
      submitApplication: vi.fn().mockResolvedValue({ referenceCode: 'JEE2026-NTA-12345' }),
    };

    mockDocument = {
      listDocuments: vi.fn().mockResolvedValue([]),
    };

    const qwenAdapter = new Qwen3Adapter();
    const intentService = new IntentDetectionService();
    const contextBuilder = new ContextBuilderService();
    const capabilityResolver = new CapabilityResolverService();
    const toolRegistry = new ToolRegistryService(
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

  it('detects ELIGIBILITY_CHECK intent and returns grounded response with official citations', async () => {
    const response = await aiService.processChatMessage({
      message: 'What is the eligibility for JEE Main 2026?',
      context: { serviceId: 'jee-main' },
    });

    expect(response.intent).toBe(IntentType.ELIGIBILITY_CHECK);
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.citations[0].url).toBe('https://jeemain.nta.nic.in/information-bulletin');
    expect(response.content).toContain('Class 12');
    expect(mockKnowledge.searchKnowledge).toHaveBeenCalled();
  });

  it('detects START_APPLICATION intent and resolves application preparation action card', async () => {
    const response = await aiService.processChatMessage({
      message: 'I want to start my application for JEE Main',
      context: { serviceId: 'jee-main' },
    });

    expect(
      response.intent === IntentType.APPLICATION_ACTION ||
        response.intent === IntentType.START_APPLICATION,
    ).toBe(true);
    expect(response.actionCard).toBeDefined();
    expect(response.actionCard?.title).toContain('Start JEE (Main) 2026 Application');
    expect(response.actionCard?.riskLevel).toBe(RiskLevel.MEDIUM);
  });

  it('enforces least-privilege context building without sending entire database or whole user profiles', () => {
    const contextBuilder = new ContextBuilderService();
    const messages = contextBuilder.buildPromptContext(
      'What are the requirements for JEE?',
      { serviceId: 'jee-main', workflow: 'application' },
      [],
    );

    const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
    expect(systemMessage).toContain('Active Service: jee-main');
    expect(systemMessage).not.toContain('Aadhaar');
    expect(systemMessage).not.toContain('entire_user_profile');
  });
});
