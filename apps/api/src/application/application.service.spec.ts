import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationService } from './application.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ApplicationStatus, FieldSource } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('ApplicationService', () => {
  let applicationService: ApplicationService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      governmentService: { findFirst: vi.fn() },
      serviceCapability: { findFirst: vi.fn() },
      application: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      applicationField: {
        upsert: vi.fn(),
      },
      applicationEvent: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
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

  describe('Application Creation', () => {
    it('should create an application draft with initial fields derived from capability requirements', async () => {
      mockPrisma.governmentService.findFirst.mockResolvedValue({
        id: 'srv-1',
        name: 'JEE Main',
        slug: 'jee-main',
      });

      mockPrisma.serviceCapability.findFirst.mockResolvedValue({
        id: 'cap-1',
        name: 'Registration',
        slug: 'registration',
        requirements: [
          { fieldKey: 'fullName', label: 'Full Name', required: true },
          { fieldKey: 'category', label: 'Category', required: true },
        ],
      });

      mockPrisma.application.create.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        serviceId: 'srv-1',
        status: ApplicationStatus.DRAFT,
        currentStep: 'PERSONAL_INFO',
        fields: [
          { fieldKey: 'fullName', fieldValue: '', source: FieldSource.USER, verified: false },
          { fieldKey: 'category', fieldValue: '', source: FieldSource.USER, verified: false },
        ],
        events: [],
      });

      const result = await applicationService.createApplication('user-1', {
        serviceId: 'jee-main',
        capabilityId: 'registration',
      });

      expect(result.id).toBe('app-1');
      expect(result.status).toBe(ApplicationStatus.DRAFT);
      expect(result.fields).toHaveLength(2);
      expect(mockAudit.recordEvent).toHaveBeenCalled();
    });
  });

  describe('Deterministic Auto-Fill', () => {
    it('should auto-fill application fields from verified citizen profile and contacts', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        status: ApplicationStatus.DRAFT,
        fields: [
          { fieldKey: 'fullName', fieldValue: '', source: FieldSource.USER, verified: false },
          { fieldKey: 'category', fieldValue: '', source: FieldSource.USER, verified: false },
        ],
      });

      mockPrisma.profile.findUnique.mockResolvedValue({
        fullName: 'Rahul Sharma',
        gender: 'Male',
        dateOfBirth: new Date('2002-05-14'),
      });

      const result = await applicationService.autofillApplication('user-1', 'app-1');

      expect(result.autoFilledKeys).toContain('fullName');
      expect(result.fields[0].fieldValue).toBe('Rahul Sharma');
      expect(result.fields[0].source).toBe(FieldSource.PROFILE);
      expect(result.fields[0].verified).toBe(true);
    });

    it('should throw BadRequestException when trying to auto-fill a submitted application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        status: ApplicationStatus.SUBMITTED,
      });

      await expect(applicationService.autofillApplication('user-1', 'app-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Review & Confirmation', () => {
    it('should generate structured review sections distinguishing auto-filled from manual fields', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        status: ApplicationStatus.IN_PROGRESS,
        fields: [
          { fieldKey: 'fullName', fieldValue: 'Rahul Sharma', source: FieldSource.PROFILE, verified: true },
          { fieldKey: 'category', fieldValue: 'GEN', source: FieldSource.USER, verified: false },
        ],
      });

      const review = await applicationService.getApplicationReview('user-1', 'app-1');

      expect(review.isComplete).toBe(true);
      expect(review.missingRequiredCount).toBe(0);
      expect(review.sections.length).toBeGreaterThan(0);
    });

    it('should submit confirmed application through mock adapter and generate reference number', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        status: ApplicationStatus.READY_FOR_REVIEW,
        service: { slug: 'jee-main', name: 'JEE Main' },
        fields: [
          { fieldKey: 'fullName', fieldValue: 'Rahul Sharma', source: FieldSource.PROFILE, verified: true },
        ],
      });

      const result = await applicationService.submitApplication('user-1', 'app-1');

      expect(result.status).toBe(ApplicationStatus.SUBMITTED);
      expect(result.referenceNumber).toMatch(/^JEE2026-NTA-\d+$/);
      expect(mockAudit.recordEvent).toHaveBeenCalled();
    });
  });
});
