import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { JeeMainAdapter } from './adapters/jee-main.adapter';
import { NationalScholarshipAdapter } from './adapters/national-scholarship.adapter';
import { ServiceRegistryService } from './service-registry.service';
import { ProfileResolverService, FieldState } from '../me/profile-resolver.service';
import { ToolRegistryService } from '../ai/tools/tool-registry.service';

describe('Phase 8: Universal Service Ecosystem & Multi-Service Platform Integration', () => {
  let jeeAdapter: JeeMainAdapter;
  let nspAdapter: NationalScholarshipAdapter;
  let serviceRegistry: ServiceRegistryService;
  let profileResolver: ProfileResolverService;
  let toolRegistry: ToolRegistryService;

  const mockMeService: any = {
    getProfile: vi.fn().mockImplementation((userId: string) => {
      if (userId === 'citizen-aarav') {
        return {
          id: 'prof-aarav',
          userId: 'citizen-aarav',
          fullName: 'Aarav Gupta',
          dateOfBirth: new Date('2005-03-21'),
          gender: 'Male',
          category: 'OBC_NCL',
        };
      }
      return {
        id: `prof-${userId}`,
        userId,
        fullName: '',
      };
    }),
    getAccountOverview: vi.fn().mockImplementation((userId: string) => {
      if (userId === 'citizen-aarav') {
        return {
          sanchayUid: '00000000-0000-4000-8000-00000000000a',
          primaryAddress: {
            line1: 'Flat 101, Residency Towers',
            line2: 'MG Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
          },
          primaryContacts: [{ valueReference: '+91 99999 11111' }],
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
    listDocuments: vi.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    jeeAdapter = new JeeMainAdapter();
    nspAdapter = new NationalScholarshipAdapter();
    serviceRegistry = new ServiceRegistryService(jeeAdapter, nspAdapter);
    profileResolver = new ProfileResolverService(mockMeService);
    toolRegistry = new ToolRegistryService(
      mockKnowledge,
      mockApplication,
      mockDocument,
      serviceRegistry,
      profileResolver,
    );
  });

  describe('1. Service Registry & Adapter Contracts', () => {
    it('registers both JEE Main and National Scholarship adapters', () => {
      const services = serviceRegistry.listRegisteredServices();
      expect(services).toHaveLength(2);
      expect(services.map((s) => s.slug)).toContain('jee-main');
      expect(services.map((s) => s.slug)).toContain('national-scholarship');
    });

    it('retrieves JEE Main requirements and universal form schema', async () => {
      const reqs = await serviceRegistry.getServiceRequirements('jee-main');
      expect(reqs.length).toBeGreaterThan(5);
      expect(reqs.map((r) => r.fieldKey)).toContain('fullName');
      expect(reqs.map((r) => r.fieldKey)).toContain('twelfthPassingYear');

      const schema = await serviceRegistry.getUniversalFormSchema('jee-main');
      expect(schema?.serviceId).toBe('srv-jee-001');
      expect(schema?.sections.length).toBe(4);
      expect(schema?.fields.find((f) => f.fieldKey === 'examPaper')).toBeDefined();
    });

    it('retrieves National Scholarship requirements and universal form schema', async () => {
      const reqs = await serviceRegistry.getServiceRequirements('national-scholarship');
      expect(reqs.length).toBeGreaterThan(5);
      expect(reqs.map((r) => r.fieldKey)).toContain('annualFamilyIncome');
      expect(reqs.map((r) => r.fieldKey)).toContain('class12Percentage');

      const schema = await serviceRegistry.getUniversalFormSchema('national-scholarship');
      expect(schema?.serviceId).toBe('srv-nsp-001');
      expect(schema?.sections.length).toBe(3);
      expect(schema?.fields.find((f) => f.fieldKey === 'annualFamilyIncome')).toBeDefined();
    });
  });

  describe('2. Deterministic Form Validation & Service Actions', () => {
    it('validates JEE Main application correctly', async () => {
      const invalidRes = await serviceRegistry.validateServiceForm('jee-main', {
        fullName: 'Aarav Gupta',
        twelfthPassingYear: '2020', // Ineligible year
      });
      expect(invalidRes.isValid).toBe(false);
      expect(invalidRes.errors.twelfthPassingYear).toBeDefined();

      const validRes = await serviceRegistry.validateServiceForm('jee-main', {
        fullName: 'Aarav Gupta',
        dateOfBirth: '2005-03-21',
        examPaper: 'B.E./B.Tech',
        examSession: 'SESSION_1',
        examCity1: 'Bengaluru',
        twelfthPassingYear: '2025',
      });
      expect(validRes.isValid).toBe(true);
      expect(Object.keys(validRes.errors)).toHaveLength(0);
    });

    it('validates National Scholarship application correctly', async () => {
      const invalidRes = await serviceRegistry.validateServiceForm('national-scholarship', {
        fullName: 'Aarav Gupta',
        annualFamilyIncome: '1200000', // Exceeds 8 Lakh
        class12Percentage: '55', // Below 60%
        currentInstitutionName: '',
      });
      expect(invalidRes.isValid).toBe(false);
      expect(invalidRes.errors.annualFamilyIncome).toBeDefined();
      expect(invalidRes.errors.class12Percentage).toBeDefined();

      const validRes = await serviceRegistry.validateServiceForm('national-scholarship', {
        fullName: 'Aarav Gupta',
        annualFamilyIncome: '350000',
        class12Percentage: '88.5',
        currentInstitutionName: 'IIT Bombay',
      });
      expect(validRes.isValid).toBe(true);
      expect(Object.keys(validRes.errors)).toHaveLength(0);
    });

    it('executes service actions deterministically', async () => {
      const jeeAction = await serviceRegistry.executeServiceAction('jee-main', 'check_eligibility', { passingYear: 2025 });
      expect(jeeAction.eligible).toBe(true);

      const nspAction = await serviceRegistry.executeServiceAction('national-scholarship', 'check_eligibility', {
        annualFamilyIncome: 400000,
        class12Percentage: 82,
      });
      expect(nspAction.eligible).toBe(true);

      const nspIneligible = await serviceRegistry.executeServiceAction('national-scholarship', 'check_eligibility', {
        annualFamilyIncome: 950000,
        class12Percentage: 82,
      });
      expect(nspIneligible.eligible).toBe(false);
    });
  });

  describe('3. Canonical Profile Resolver & Field State Machine', () => {
    it('resolves verified citizen profile fields with PROFILE_VERIFIED state', async () => {
      const reqs = await serviceRegistry.getServiceRequirements('national-scholarship');
      const report = await profileResolver.resolveRequirements('citizen-aarav', reqs, {
        annualFamilyIncome: '300000',
        currentInstitutionName: 'IIT Delhi',
        courseDegree: 'B.Tech',
        class12Percentage: '92',
      });

      expect(report.userId).toBe('citizen-aarav');
      expect(report.isComplete).toBe(true);
      expect(report.missingRequired).toHaveLength(0);

      const nameField = report.fields.find((f) => f.fieldKey === 'fullName');
      expect(nameField?.value).toBe('Aarav Gupta');
      expect(nameField?.state).toBe(FieldState.PROFILE_VERIFIED);
      expect(nameField?.editable).toBe(false);

      const incomeField = report.fields.find((f) => f.fieldKey === 'annualFamilyIncome');
      expect(incomeField?.value).toBe('300000');
      expect(incomeField?.state).toBe(FieldState.USER_PROVIDED);
      expect(incomeField?.editable).toBe(true);
    });

    it('accurately identifies missing fields when user input is missing', async () => {
      const reqs = await serviceRegistry.getServiceRequirements('national-scholarship');
      const report = await profileResolver.resolveRequirements('citizen-aarav', reqs, {});

      expect(report.isComplete).toBe(false);
      expect(report.missingRequired).toContain('annualFamilyIncome');
      expect(report.missingRequired).toContain('currentInstitutionName');
      expect(report.missingRequired).toContain('class12Percentage');
    });
  });

  describe('4. Universal AI Action Registry Execution', () => {
    const testUser = { id: 'citizen-aarav', sanchayUid: '00000000-0000-4000-8000-00000000000a', status: 'ACTIVE' };

    it('executes service.get_requirements through tool registry', async () => {
      const res = await toolRegistry.executeTool('service.get_requirements', { serviceSlug: 'national-scholarship' });
      expect(res.result.serviceSlug).toBe('national-scholarship');
      expect(res.result.requirements.length).toBeGreaterThan(0);
    });

    it('executes service.get_form_schema through tool registry', async () => {
      const res = await toolRegistry.executeTool('service.get_form_schema', { serviceSlug: 'jee-main' });
      expect(res.result.schema.serviceId).toBe('srv-jee-001');
      expect(res.result.schema.sections).toHaveLength(4);
    });

    it('executes profile.resolve_requirements through tool registry with authenticated user', async () => {
      const res = await toolRegistry.executeTool(
        'profile.resolve_requirements',
        { serviceSlug: 'national-scholarship', fields: { annualFamilyIncome: '400000' } },
        testUser,
      );
      expect(res.result.userId).toBe('citizen-aarav');
      expect(res.result.fields.find((f: any) => f.fieldKey === 'fullName').value).toBe('Aarav Gupta');
    });

    it('executes scholarship.check_eligibility through tool registry', async () => {
      const res = await toolRegistry.executeTool('scholarship.check_eligibility', {
        annualFamilyIncome: 300000,
        class12Percentage: 85,
      });
      expect(res.result.eligible).toBe(true);
      expect(res.result.service).toBe('national-scholarship');
    });

    it('rejects authenticated tools when called without user session', async () => {
      await expect(
        toolRegistry.executeTool('profile.resolve_requirements', { serviceSlug: 'jee-main' }, undefined),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        toolRegistry.executeTool('application.autofill', { applicationId: 'app-1' }, undefined),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
