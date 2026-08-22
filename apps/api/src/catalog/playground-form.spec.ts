import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { PlaygroundAdapter } from './adapters/playground.adapter';
import { JeeMainAdapter } from './adapters/jee-main.adapter';
import { NationalScholarshipAdapter } from './adapters/national-scholarship.adapter';
import { ServiceRegistryService } from './service-registry.service';
import { ProfileResolverService, FieldState } from '../me/profile-resolver.service';
import { ToolRegistryService } from '../ai/tools/tool-registry.service';
import { RiskLevel } from '../types';

describe('Phase 8.1: Universal Form Playground — Automated Verification Suite', () => {
  let playgroundAdapter: PlaygroundAdapter;
  let jeeAdapter: JeeMainAdapter;
  let nspAdapter: NationalScholarshipAdapter;
  let serviceRegistry: ServiceRegistryService;
  let profileResolver: ProfileResolverService;
  let toolRegistry: ToolRegistryService;

  const mockMeService: any = {
    getProfile: vi.fn().mockImplementation((userId: string) => {
      if (userId === 'citizen-parv') {
        return {
          id: 'prof-parv',
          userId: 'citizen-parv',
          fullName: 'Parv Garg',
          dateOfBirth: new Date('2006-08-15'),
          gender: 'Female',
          category: 'OBC_NCL',
          class10Board: 'CBSE',
          class10PassingYear: 2022,
          class10Percentage: 94.2,
          class12Board: 'CBSE',
          class12PassingYear: 2024,
          class12Percentage: 92.5,
          stream: 'Science (PCM)',
        };
      }
      return {
        id: `prof-${userId}`,
        userId,
        fullName: '',
      };
    }),
    getAccountOverview: vi.fn().mockImplementation((userId: string) => {
      if (userId === 'citizen-parv') {
        return {
          sanchayUid: '00000000-0000-4000-8000-000000000001',
          primaryAddress: {
            line1: '123 Civil Lines',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201301',
          },
          primaryContacts: [{ valueReference: '+91 98765 43210' }],
        };
      }
      return {
        sanchayUid: `uid-${userId}`,
        primaryAddress: null,
        primaryContacts: [],
      };
    }),
  };

  const mockKnowledge: any = {
    searchKnowledge: vi.fn().mockResolvedValue([]),
  };

  const mockApplication: any = {
    autofillApplication: vi.fn().mockResolvedValue({ success: true }),
    getApplicationReview: vi.fn().mockResolvedValue({ status: 'READY_FOR_REVIEW' }),
    submitApplication: vi.fn().mockResolvedValue({ referenceCode: 'APP-100' }),
  };

  const mockDocument: any = {
    listDocuments: vi.fn().mockImplementation((userId: string) => {
      if (userId === 'citizen-parv') {
        return [
          {
            id: 'doc-12th-marksheet',
            userId: 'citizen-parv',
            fileName: 'class12_marksheet.pdf',
            documentType: 'ACADEMIC_MARKSHEET',
            verificationStatus: 'VERIFIED',
          },
        ];
      }
      return [];
    }),
  };

  beforeEach(() => {
    playgroundAdapter = new PlaygroundAdapter();
    jeeAdapter = new JeeMainAdapter();
    nspAdapter = new NationalScholarshipAdapter();
    serviceRegistry = new ServiceRegistryService(jeeAdapter, nspAdapter, playgroundAdapter);
    profileResolver = new ProfileResolverService(mockMeService);
    toolRegistry = new ToolRegistryService(
      mockKnowledge,
      mockApplication,
      mockDocument,
      serviceRegistry,
      profileResolver,
    );
  });

  describe('1. Schema, Requirements & Machine-Readable Contract', () => {
    it('registers universal-form adapter under srv-playground-001', () => {
      const adapter = serviceRegistry.getAdapter('universal-form');
      expect(adapter).toBeDefined();
      expect(adapter?.serviceId).toBe('srv-playground-001');
      expect(adapter?.name).toBe('Universal Form Playground');
    });

    it('returns structured sections and field metadata with profile source tags', async () => {
      const schema = await serviceRegistry.getUniversalFormSchema('universal-form');
      expect(schema).toBeDefined();
      expect(schema?.sections).toHaveLength(4);
      expect(schema?.sections.map((s) => s.id)).toEqual([
        'sec-profile',
        'sec-academic',
        'sec-preferences',
        'sec-documents',
      ]);

      const fullNameField = schema?.fields.find((f) => f.fieldKey === 'fullName');
      expect(fullNameField?.source).toBe('SANCHAY_PROFILE');
      expect(fullNameField?.required).toBe(true);

      const cityField = schema?.fields.find((f) => f.fieldKey === 'preferredCity');
      expect(cityField?.source).toBe('USER_INPUT');
      expect(cityField?.section).toBe('sec-preferences');
    });
  });

  describe('2. Canonical Profile Auto-Fill & Missing-Field Intelligence', () => {
    it('auto-fills verified citizen profile data and flags missing application fields', async () => {
      const reqs = await serviceRegistry.getServiceRequirements('universal-form');
      const report = await profileResolver.resolveRequirements('citizen-parv', reqs, {});

      expect(report.userId).toBe('citizen-parv');
      expect(report.isComplete).toBe(false);

      // Verified Profile fields
      const nameField = report.fields.find((f) => f.fieldKey === 'fullName');
      expect(nameField?.value).toBe('Parv Garg');
      expect(nameField?.state).toBe(FieldState.PROFILE_VERIFIED);
      expect(nameField?.editable).toBe(false);

      const catField = report.fields.find((f) => f.fieldKey === 'category');
      expect(catField?.value).toBe('OBC_NCL');
      expect(catField?.state).toBe(FieldState.PROFILE_VERIFIED);

      // Missing application-owned fields
      expect(report.missingRequired).toContain('preferredCity');
      expect(report.missingRequired).toContain('preferredCourse');
      expect(report.missingRequired).toContain('preferredInstitution');
      expect(report.missingRequired).toContain('emergencyContact');
    });

    it('marks report complete once application fields are user-provided', async () => {
      const reqs = await serviceRegistry.getServiceRequirements('universal-form');
      const report = await profileResolver.resolveRequirements('citizen-parv', reqs, {
        preferredCity: 'Noida',
        preferredCourse: 'Computer Science',
        preferredInstitution: 'IIT Delhi',
        emergencyContact: '+91 98765 43210',
      });

      expect(report.isComplete).toBe(true);
      expect(report.missingRequired).toHaveLength(0);

      const cityField = report.fields.find((f) => f.fieldKey === 'preferredCity');
      expect(cityField?.value).toBe('Noida');
      expect(cityField?.state).toBe(FieldState.USER_PROVIDED);
      expect(cityField?.editable).toBe(true);
    });
  });

  describe('3. Deterministic Form Validation Rules', () => {
    it('rejects invalid percentage values and invalid emergency mobile numbers', async () => {
      const res = await serviceRegistry.validateServiceForm('universal-form', {
        fullName: 'Parv Garg',
        dateOfBirth: '2006-08-15',
        category: 'OBC_NCL',
        preferredCity: 'Noida',
        preferredCourse: 'Computer Science',
        preferredInstitution: 'IIT Delhi',
        class10Percentage: '105', // Invalid: > 100
        emergencyContact: '12345', // Invalid phone
      });

      expect(res.isValid).toBe(false);
      expect(res.errors.class10Percentage).toBeDefined();
      expect(res.errors.emergencyContact).toBeDefined();
    });

    it('accepts completely valid submission payloads', async () => {
      const res = await serviceRegistry.validateServiceForm('universal-form', {
        fullName: 'Parv Garg',
        dateOfBirth: '2006-08-15',
        category: 'OBC_NCL',
        preferredCity: 'Noida',
        preferredCourse: 'Computer Science',
        preferredInstitution: 'IIT Delhi',
        class10Percentage: '94.2',
        class12Percentage: '92.5',
        emergencyContact: '+91 98765 43210',
      });

      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors)).toHaveLength(0);
    });
  });

  describe('4. AI Action Execution, Document Vault & Safe Mock Submission', () => {
    const testUser = { id: 'citizen-parv', sanchayUid: '00000000-0000-4000-8000-000000000001', status: 'ACTIVE' };

    it('allows authenticated user to retrieve documents from vault', async () => {
      const res = await toolRegistry.executeTool('document.list', {}, testUser);
      expect(res.result).toHaveLength(1);
      expect(res.result[0].id).toBe('doc-12th-marksheet');
      expect(res.result[0].documentType).toBe('ACADEMIC_MARKSHEET');
    });

    it('requires explicit confirmation before executing mock submission', async () => {
      const pendingRes = await toolRegistry.executeTool(
        'application.submit_mock',
        { serviceSlug: 'universal-form', isPlayground: true },
        testUser,
        false, // Not confirmed yet
      );

      expect(pendingRes.result.status).toBe('PENDING_CONFIRMATION');
      expect(pendingRes.actionCard).toBeDefined();
      expect(pendingRes.actionCard?.riskLevel).toBe(RiskLevel.HIGH);
      expect(pendingRes.actionCard?.confirmationRequired).toBe(true);

      // Once confirmed
      const confirmedRes = await toolRegistry.executeTool(
        'application.submit_mock',
        { serviceSlug: 'universal-form', isPlayground: true },
        testUser,
        true, // Confirmed
      );

      expect(confirmedRes.result.status).toBe('SUCCESS');
      expect(confirmedRes.result.referenceCode).toMatch(/^TEST-[A-Z0-9]+$/);
      expect(confirmedRes.result.isPlayground).toBe(true);
    });

    it('enforces cross-user isolation: User B cannot access User A documents or state', async () => {
      const userB = { id: 'citizen-b', sanchayUid: '00000000-0000-4000-8000-000000000002', status: 'ACTIVE' };
      const resB = await toolRegistry.executeTool('document.list', {}, userB);
      expect(resB.result).toHaveLength(0); // User B has 0 documents in their vault
    });
  });
});
