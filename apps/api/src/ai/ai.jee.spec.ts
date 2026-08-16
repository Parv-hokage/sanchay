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
});
