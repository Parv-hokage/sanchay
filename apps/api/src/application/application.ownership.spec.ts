import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationService } from './application.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

describe('ApplicationService — Ownership & IDOR Security', () => {
  let applicationService: ApplicationService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      application: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      applicationField: { upsert: vi.fn() },
      applicationEvent: { create: vi.fn(), findMany: vi.fn() },
      profile: { findUnique: vi.fn() },
      address: { findFirst: vi.fn() },
      contactMethod: { findFirst: vi.fn() },
    };

    mockAudit = {
      recordEvent: vi.fn().mockResolvedValue(undefined),
    };

    applicationService = new ApplicationService(
      mockPrisma as PrismaService,
      mockAudit as AuditService,
    );
  });

  it('should allow User A to access User A application', async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      id: 'app-user-a',
      userId: 'user-a',
      status: ApplicationStatus.DRAFT,
      fields: [],
    });

    const app = await applicationService.getApplicationById('user-a', 'app-user-a');
    expect(app.id).toBe('app-user-a');
  });

  it('should REJECT User B when attempting to view User A application (IDOR)', async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      id: 'app-user-a',
      userId: 'user-a',
      status: ApplicationStatus.DRAFT,
      fields: [],
    });

    await expect(
      applicationService.getApplicationById('user-b', 'app-user-a'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should REJECT User B when attempting to auto-fill User A application', async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      id: 'app-user-a',
      userId: 'user-a',
      status: ApplicationStatus.DRAFT,
      fields: [],
    });

    await expect(
      applicationService.autofillApplication('user-b', 'app-user-a'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should REJECT User B when attempting to submit User A application', async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      id: 'app-user-a',
      userId: 'user-a',
      status: ApplicationStatus.READY_FOR_REVIEW,
      fields: [],
    });

    await expect(
      applicationService.submitApplication('user-b', 'app-user-a'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if application does not exist', async () => {
    mockPrisma.application.findUnique.mockResolvedValue(null);

    await expect(
      applicationService.getApplicationById('user-a', 'non-existent-app'),
    ).rejects.toThrow(NotFoundException);
  });
});
