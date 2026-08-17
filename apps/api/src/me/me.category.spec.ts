import { describe, it, expect, beforeEach } from 'vitest';
import { MeService } from './me.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CitizenCategory } from '@sanchay/types';

describe('MeService - Category & Profile Data Flow', () => {
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

  it('1. Profile category read: reads default/existing category from profile', async () => {
    const profile = await meService.getProfile('user-test-cat-001');
    expect(profile).toBeDefined();
    expect(profile.category).toBe('OBC_NCL');
  });

  it('2. Profile category update: successfully updates and persists category', async () => {
    const userId = 'user-test-cat-002';
    await meService.getProfile(userId);

    const updated = await meService.updateProfile(
      userId,
      { category: CitizenCategory.GENERAL, fullName: 'Parv Mittal' },
      'req-cat-1',
    );

    expect(updated.category).toBe('GENERAL');

    // Verify persistence across subsequent reads
    const reloaded = await meService.getProfile(userId);
    expect(reloaded.category).toBe('GENERAL');
  });

  it('3. Category values: supports all official reservation categories (GENERAL, OBC_NCL, SC, ST, EWS)', async () => {
    const userId = 'user-test-cat-003';
    const categories: CitizenCategory[] = [
      CitizenCategory.GENERAL,
      CitizenCategory.OBC_NCL,
      CitizenCategory.SC,
      CitizenCategory.ST,
      CitizenCategory.EWS,
    ];

    for (const cat of categories) {
      const res = await meService.updateProfile(userId, { category: cat }, 'req-test');
      expect(res.category).toBe(cat);
      const read = await meService.getProfile(userId);
      expect(read.category).toBe(cat);
    }
  });

  it('4. Zero-trust profile isolation: user A category updates do not affect user B', async () => {
    const userA = 'user-isolation-a';
    const userB = 'user-isolation-b';

    await meService.updateProfile(userA, { category: CitizenCategory.SC }, 'req-a');
    await meService.updateProfile(userB, { category: CitizenCategory.ST }, 'req-b');

    const profA = await meService.getProfile(userA);
    const profB = await meService.getProfile(userB);

    expect(profA.category).toBe('SC');
    expect(profB.category).toBe('ST');
  });
});
