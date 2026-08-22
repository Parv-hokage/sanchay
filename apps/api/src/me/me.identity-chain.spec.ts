import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { MeService } from './me.service';
import { ProfileResolverService } from './profile-resolver.service';
import { AiService } from '../ai/ai.service';
import { ApplicationService } from '../application/application.service';
import { IntentDetectionService } from '../ai/services/intent-detection.service';
import { ContextBuilderService } from '../ai/services/context-builder.service';
import { CapabilityResolverService } from '../ai/services/capability-resolver.service';
import { ToolRegistryService } from '../ai/tools/tool-registry.service';
import { Qwen3Adapter } from '../ai/provider/qwen3.adapter';

describe('Authoritative Identity Chain Verification: AUTH → PROFILE → AI → FORM → ADAPTER', () => {
  let authService: AuthService;
  let meService: MeService;
  let profileResolver: ProfileResolverService;
  let aiService: AiService;
  let applicationService: ApplicationService;

  const mockDbProfiles = new Map<string, any>();
  const mockDbUsers = new Map<string, any>();
  const mockDbApplications = new Map<string, any>();

  const mockPrisma: any = {
    user: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        return mockDbUsers.get(where.id || where.sanchayUid) || null;
      }),
      create: vi.fn().mockImplementation(({ data }: any) => {
        mockDbUsers.set(data.id, { ...data, profile: null });
        return mockDbUsers.get(data.id);
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        const u = mockDbUsers.get(where.id);
        if (u) Object.assign(u, data);
        return u;
      }),
    },
    authSession: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        for (const [userId, u] of mockDbUsers.entries()) {
          if (u.sessionToken === where.sessionToken) {
            return {
              id: `sess-${userId}`,
              userId,
              sessionToken: where.sessionToken,
              expiresAt: new Date(Date.now() + 86400000),
              user: u,
            };
          }
        }
        return null;
      }),
      create: vi.fn().mockResolvedValue({ id: 'sess-created' }),
      delete: vi.fn().mockResolvedValue({ id: 'sess-deleted' }),
    },
    profile: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        return mockDbProfiles.get(where.userId) || null;
      }),
      create: vi.fn().mockImplementation(({ data }: any) => {
        mockDbProfiles.set(data.userId, { id: `prof-${data.userId}`, ...data });
        return mockDbProfiles.get(data.userId);
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        let p: any = null;
        for (const val of mockDbProfiles.values()) {
          if (val.id === where.id) {
            p = val;
            break;
          }
        }
        if (p) Object.assign(p, data);
        return p;
      }),
    },
    address: {
      findFirst: vi.fn().mockImplementation(({ where }: any) => {
        if (where.userId === 'user-a') {
          return {
            line1: 'Flat 101, Residency Towers',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            isPrimary: true,
          };
        }
        if (where.userId === 'user-b') {
          return {
            line1: 'House 55, Green Park',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110016',
            isPrimary: true,
          };
        }
        return null;
      }),
    },
    contactMethod: {
      findFirst: vi.fn().mockImplementation(({ where }: any) => {
        if (where.userId === 'user-a') {
          return { valueReference: '+91 99999 11111', isPrimary: true };
        }
        if (where.userId === 'user-b') {
          return { valueReference: '+91 88888 22222', isPrimary: true };
        }
        return null;
      }),
    },
    application: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        return mockDbApplications.get(where.id) || null;
      }),
      create: vi.fn().mockImplementation(({ data }: any) => {
        const initialFields = (data.fields?.create || []).map((f: any) => ({ ...f }));
        const appObj = { id: data.id || `app-${Date.now()}`, ...data, fields: initialFields };
        mockDbApplications.set(appObj.id, appObj);
        return appObj;
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        const app = mockDbApplications.get(where.id);
        if (app) Object.assign(app, data);
        return app;
      }),
    },
    applicationField: {
      upsert: vi.fn().mockImplementation(({ create }: any) => {
        const app = mockDbApplications.get(create.applicationId);
        if (app) {
          app.fields = app.fields || [];
          const idx = app.fields.findIndex((f: any) => f.fieldKey === create.fieldKey);
          if (idx >= 0) app.fields[idx] = create;
          else app.fields.push(create);
        }
        return create;
      }),
    },
    governmentService: {
      findFirst: vi.fn().mockResolvedValue({
        id: 'srv-jee-001',
        name: 'Joint Entrance Examination (Main)',
        slug: 'jee-main',
        organization: { name: 'National Testing Agency (NTA)' },
      }),
    },
    serviceCapability: {
      findFirst: vi.fn().mockResolvedValue({
        id: 'cap-jee-001',
        name: 'Online Application',
        slug: 'registration',
        requirements: [
          { fieldKey: 'fullName', label: 'Full Name', required: true, source: 'PROFILE' },
          { fieldKey: 'dateOfBirth', label: 'Date of Birth', required: true, source: 'PROFILE' },
          { fieldKey: 'gender', label: 'Gender', required: true, source: 'PROFILE' },
          { fieldKey: 'category', label: 'Category', required: true, source: 'PROFILE' },
          { fieldKey: 'permanentAddress', label: 'Address', required: true, source: 'PROFILE' },
        ],
      }),
    },
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    },
    aiConversation: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 'conv-1' }),
    },
    aiMessage: {
      create: vi.fn().mockResolvedValue({ id: 'msg-1' }),
    },
  };

  const mockAudit: any = {
    recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }),
  };

  const mockKnowledge: any = {
    searchKnowledge: vi.fn().mockResolvedValue([]),
    getOfficialSources: vi.fn().mockResolvedValue([]),
  };

  const mockDocument: any = {
    listDocuments: vi.fn().mockResolvedValue([]),
    getDocumentMetadata: vi.fn().mockResolvedValue(null),
  };

  beforeEach(() => {
    mockDbProfiles.clear();
    mockDbUsers.clear();
    mockDbApplications.clear();

    // User A in database
    mockDbUsers.set('user-a', {
      id: 'user-a',
      sanchayUid: '00000000-0000-4000-8000-00000000000a',
      status: 'ACTIVE',
      sessionToken: 'token-user-a',
    });
    mockDbProfiles.set('user-a', {
      id: 'prof-user-a',
      userId: 'user-a',
      fullName: 'Aarav Gupta',
      dateOfBirth: new Date('2005-03-21'),
      gender: 'Male',
      category: 'General',
    });

    // User B in database
    mockDbUsers.set('user-b', {
      id: 'user-b',
      sanchayUid: '00000000-0000-4000-8000-00000000000b',
      status: 'ACTIVE',
      sessionToken: 'token-user-b',
    });
    mockDbProfiles.set('user-b', {
      id: 'prof-user-b',
      userId: 'user-b',
      fullName: 'Bhavna Sen',
      dateOfBirth: new Date('2004-11-10'),
      gender: 'Female',
      category: 'SC',
    });

    authService = new AuthService(mockPrisma, mockAudit);
    meService = new MeService(mockPrisma, mockAudit);
    profileResolver = new ProfileResolverService(meService);

    const intentService = new IntentDetectionService();
    const contextBuilder = new ContextBuilderService();
    const capabilityResolver = new CapabilityResolverService();
    const qwenAdapter = new Qwen3Adapter();

    applicationService = new ApplicationService(mockPrisma, mockAudit);
    const toolRegistry = new ToolRegistryService(mockKnowledge, applicationService, mockDocument);

    aiService = new AiService(
      mockPrisma,
      mockAudit,
      mockKnowledge,
      meService,
      qwenAdapter,
      intentService,
      contextBuilder,
      capabilityResolver,
      toolRegistry,
    );
  });

  it('1. Login as User A -> Authenticated session strictly binds to User A ID', async () => {
    const sessionRes = await authService.validateSession('token-user-a');
    expect(sessionRes).not.toBeNull();
    expect(sessionRes?.user.id).toBe('user-a');
    expect(sessionRes?.user.sanchayUid).toBe('00000000-0000-4000-8000-00000000000a');
  });

  it('2. Resolve profile through AI -> AI receives User A actual profile (Aarav Gupta)', async () => {
    const userA = { id: 'user-a', sanchayUid: '00000000-0000-4000-8000-00000000000a', status: 'ACTIVE' };
    const chatRes = await aiService.processChatMessage({ message: 'What is my name and category?' }, userA);

    expect(chatRes.content).toContain('Aarav Gupta');
    expect(chatRes.content).not.toContain('Parv Mittal');
    expect(chatRes.content).not.toContain('Bhavna Sen');
  });

  it('3. Form auto-fill uses User A profile -> fields populated with Aarav Gupta and General category', async () => {
    const userA = { id: 'user-a', sanchayUid: '00000000-0000-4000-8000-00000000000a', status: 'ACTIVE' };
    
    // Create draft application for User A
    const app = await applicationService.createApplication(
      userA.id,
      { serviceId: 'jee-main', capabilityId: 'registration' },
    );

    // Auto-fill application
    const autofillRes = await applicationService.autofillApplication(
      userA.id,
      app.id,
      {},
    );

    const nameField = autofillRes.fields.find((f: any) => f.fieldKey === 'fullName');
    const categoryField = autofillRes.fields.find((f: any) => f.fieldKey === 'category');

    expect(nameField?.fieldValue).toBe('Aarav Gupta');
    expect(categoryField?.fieldValue).toBe('General');
  });

  it('4. User A cannot access User B profile or applications', async () => {
    const userA = { id: 'user-a', sanchayUid: '00000000-0000-4000-8000-00000000000a', status: 'ACTIVE' };
    const userB = { id: 'user-b', sanchayUid: '00000000-0000-4000-8000-00000000000b', status: 'ACTIVE' };

    // Create application for User B
    const appB = await applicationService.createApplication(
      userB.id,
      { serviceId: 'jee-main', capabilityId: 'registration' },
    );

    // User A attempts to view or autofill User B's application -> ForbiddenException
    await expect(
      applicationService.getApplicationById(userA.id, appB.id),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      applicationService.autofillApplication(userA.id, appB.id, {}),
    ).rejects.toThrow(ForbiddenException);
  });

  it('5. Universal Profile Resolver deterministically classifies fields into verified vs missing without fallbacks', async () => {
    const reportA = await profileResolver.resolveRequirements('user-a', [
      { fieldKey: 'fullName', label: 'Full Name', required: true, source: 'PROFILE' },
      { fieldKey: 'category', label: 'Category', required: true, source: 'PROFILE' },
      { fieldKey: 'twelfthMarks', label: 'Class 12 Marks', required: true, source: 'USER' },
    ]);

    expect(reportA.userId).toBe('user-a');
    expect(reportA.isComplete).toBe(false); // twelfthMarks is missing
    expect(reportA.missingRequired).toContain('twelfthMarks');

    const fullNameField = reportA.fields.find((f) => f.fieldKey === 'fullName');
    expect(fullNameField?.value).toBe('Aarav Gupta');
    expect(fullNameField?.state).toBe('PROFILE_VERIFIED');
    expect(fullNameField?.verified).toBe(true);

    const marksField = reportA.fields.find((f) => f.fieldKey === 'twelfthMarks');
    expect(marksField?.value).toBeNull();
    expect(marksField?.state).toBe('MISSING');
  });

  it('6. No fallback user (user-default-001, Parv Mittal, Rahul Sharma) is ever silently substituted', async () => {
    // Unauthenticated AI call -> throws UnauthorizedException
    await expect(
      aiService.processChatMessage({ message: 'What is my name?' }, undefined),
    ).rejects.toThrow(UnauthorizedException);

    // Completely empty new user with no profile in DB
    const emptyUser = { id: 'user-new-empty', sanchayUid: 'uid-empty', status: 'ACTIVE' };
    const emptyProfile = await meService.getProfile(emptyUser.id);

    expect(emptyProfile.fullName).toBe('');
    expect(emptyProfile.fullName).not.toBe('Parv Mittal');
    expect(emptyProfile.fullName).not.toBe('Rahul Sharma');
    expect(emptyProfile.userId).toBe('user-new-empty');
  });
});
