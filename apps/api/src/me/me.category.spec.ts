import { describe, it, expect, beforeEach } from 'vitest';
import { MeService } from './me.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CitizenCategory, Gender } from '@sanchay/types';
import { UpdateProfileSchema } from '@sanchay/validation';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { ApplicationService } from '../application/application.service';

describe('MeService - Category, Gender & Profile Data Flow', () => {
  let meService: MeService;
  let prismaService: PrismaService;
  let auditService: AuditService;

  beforeEach(() => {
    prismaService = {
      user: { findUnique: () => null },
      profile: {
        findUnique: () => null,
        create: (args: any) => ({ id: 'prof-test-001', ...args.data }),
        update: (args: any) => ({ id: args.where.id, ...args.data }),
      },
      address: { findMany: () => [], create: (args: any) => args.data, updateMany: () => {} },
      contactMethod: { findMany: () => [], create: (args: any) => args.data, updateMany: () => {} },
      identityLink: { findMany: () => [], create: (args: any) => args.data },
      consent: { findMany: () => [], create: (args: any) => args.data },
    } as unknown as PrismaService;

    auditService = {
      recordEvent: async () => {},
    } as unknown as AuditService;

    meService = new MeService(prismaService, auditService);
  });

  it('1. Valid gender profile update: successfully updates gender with canonical and case-normalized enums', async () => {
    const userId = 'user-test-gender-001';
    await meService.getProfile(userId);

    // MALE
    const resMale = await meService.updateProfile(
      userId,
      UpdateProfileSchema.parse({ gender: 'MALE' }),
      'req-gender-1',
    );
    expect(resMale.gender).toBe(Gender.MALE);

    // FEMALE
    const resFemale = await meService.updateProfile(
      userId,
      UpdateProfileSchema.parse({ gender: 'FEMALE' }),
      'req-gender-2',
    );
    expect(resFemale.gender).toBe(Gender.FEMALE);

    // Case-insensitive "Male" normalized to "MALE"
    const resNormalized = await meService.updateProfile(
      userId,
      UpdateProfileSchema.parse({ gender: 'Male' }),
      'req-gender-3',
    );
    expect(resNormalized.gender).toBe(Gender.MALE);
  });

  it('2. Valid category profile update: successfully updates and persists all valid categories', async () => {
    const userId = 'user-test-cat-002';
    await meService.getProfile(userId);

    const categories: CitizenCategory[] = [
      CitizenCategory.GENERAL,
      CitizenCategory.OBC_NCL,
      CitizenCategory.SC,
      CitizenCategory.ST,
      CitizenCategory.EWS,
    ];

    for (const cat of categories) {
      const validated = UpdateProfileSchema.parse({ category: cat });
      const res = await meService.updateProfile(userId, validated, 'req-cat-test');
      expect(res.category).toBe(cat);
      const read = await meService.getProfile(userId);
      expect(read.category).toBe(cat);
    }
  });

  it('3. Category-only PATCH: minimal payload updates only category without requiring other fields', async () => {
    const userId = 'user-test-cat-only';
    const profile = await meService.getProfile(userId);
    const initialName = profile.fullName;

    const validated = UpdateProfileSchema.parse({ category: 'OBC_NCL' });
    expect(validated).toEqual({ category: CitizenCategory.OBC_NCL });
    expect(validated.gender).toBeUndefined();

    const updated = await meService.updateProfile(userId, validated, 'req-cat-only');
    expect(updated.category).toBe('OBC_NCL');
    expect(updated.fullName).toBe(initialName);
  });

  it('4. Invalid gender returns validation error (rejected before backend handler)', () => {
    const res = UpdateProfileSchema.safeParse({ gender: 'InvalidGender' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain('Gender value is invalid');
    }
  });

  it('5. Invalid category returns validation error (rejected before backend handler)', () => {
    const res = UpdateProfileSchema.safeParse({ category: 'InvalidCategory' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain('Category value is invalid');
    }
  });

  it('6. Unauthorized profile update remains rejected: AuthGuard rejects requests without valid token', async () => {
    const authService = {
      validateSessionToken: async () => null,
    } as any;
    const guard = new AuthGuard(authService);

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as any;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('7. JEE application reads category and gender from Profile as single source of truth', async () => {
    const appPrisma = {
      user: { findUnique: () => null },
      profile: {
        findUnique: async () => ({
          id: 'prof-jee-001',
          userId: 'user-jee-001',
          fullName: 'Parv Mittal',
          dateOfBirth: new Date('2006-08-15'),
          gender: 'MALE',
          category: 'OBC_NCL',
        }),
      },
      address: { findFirst: () => null },
      contactMethod: { findFirst: () => null },
      application: {
        findUnique: async () => ({
          id: 'app-jee-001',
          userId: 'user-jee-001',
          serviceId: 'srv-jee-001',
          service: { id: 'srv-jee-001', name: 'JEE Main', slug: 'jee-main' },
          status: 'DRAFT',
          currentStep: 'PERSONAL_INFO',
          fields: [
            { fieldKey: 'gender', fieldValue: '', source: 'USER' },
            { fieldKey: 'category', fieldValue: '', source: 'USER' },
          ],
        }),
        update: async (args: any) => ({
          id: 'app-jee-001',
          userId: 'user-jee-001',
          ...args.data,
        }),
      },
      applicationField: {
        upsert: async (args: any) => ({ id: 'field-1', ...args.create }),
        deleteMany: async () => {},
      },
      applicationEvent: { create: async () => {} },
    } as any;

    const appService = new ApplicationService(appPrisma, auditService);
    const result = await appService.autofillApplication('user-jee-001', 'app-jee-001');

    expect(result).toBeDefined();
    expect(result.fields).toBeDefined();

    const genderField = result.fields.find((f: any) => f.fieldKey === 'gender');
    const categoryField = result.fields.find((f: any) => f.fieldKey === 'category');

    expect(genderField).toBeDefined();
    expect(genderField?.source).toBe('PROFILE');

    expect(categoryField).toBeDefined();
    expect(categoryField?.fieldValue).toBe('OBC_NCL');
    expect(categoryField?.source).toBe('PROFILE');
  });
});
