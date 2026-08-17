import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MeService } from './me.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AddressType, ConsentStatus, IdentityProviderType } from '../types';

describe('MeService', () => {
  let meService: MeService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
      profile: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      address: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      contactMethod: {
        findMany: vi.fn(),
        create: vi.fn(),
        updateMany: vi.fn(),
      },
      identityLink: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      consent: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    mockAudit = {
      recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    meService = new MeService(mockPrisma as PrismaService, mockAudit as AuditService);
  });

  describe('Profile Operations', () => {
    it('should retrieve existing profile', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'prof-1',
        userId: 'user-1',
        fullName: 'Test Citizen',
      });

      const profile = await meService.getProfile('user-1');
      expect(profile.fullName).toBe('Test Citizen');
    });

    it('should update profile and record audit event', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'prof-1',
        userId: 'user-1',
        fullName: 'Old Name',
      });
      mockPrisma.profile.update.mockResolvedValue({
        id: 'prof-1',
        userId: 'user-1',
        fullName: 'New Name',
      });

      const updated = await meService.updateProfile('user-1', { fullName: 'New Name' }, 'req-1');
      expect(updated.fullName).toBe('New Name');
      expect(mockAudit.recordEvent).toHaveBeenCalled();
    });
  });

  describe('Address Operations', () => {
    it('should create address scoped to authenticated user', async () => {
      mockPrisma.address.create.mockResolvedValue({
        id: 'addr-1',
        userId: 'user-1',
        addressLine1: '123 Main St',
        city: 'New Delhi',
        postalCode: '110001',
      });

      const addr = await meService.createAddress(
        'user-1',
        {
          addressType: AddressType.PERMANENT,
          addressLine1: '123 Main St',
          city: 'New Delhi',
          district: 'Central Delhi',
          state: 'Delhi',
          postalCode: '110001',
          isPrimary: true,
        },
        'req-addr',
      );

      expect(addr.id).toBe('addr-1');
      expect(mockPrisma.address.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user-1' }),
        }),
      );
    });
  });

  describe('Consent Operations', () => {
    it('should grant purpose-specific consent', async () => {
      mockPrisma.consent.create.mockResolvedValue({
        id: 'consent-1',
        userId: 'user-1',
        serviceId: 'service-jee',
        purpose: 'JEE Main Application',
        status: ConsentStatus.GRANTED,
      });

      const consent = await meService.grantConsent(
        'user-1',
        {
          serviceId: 'service-jee',
          purpose: 'JEE Main Application',
          scope: ['profile', 'education_documents'],
        },
        'req-consent',
      );

      expect(consent.id).toBe('consent-1');
      expect(mockAudit.recordEvent).toHaveBeenCalled();
    });

    it('should revoke consent and record audit event', async () => {
      mockPrisma.consent.findUnique.mockResolvedValue({
        id: 'consent-1',
        userId: 'user-1',
        serviceId: 'service-jee',
        status: ConsentStatus.GRANTED,
      });
      mockPrisma.consent.update.mockResolvedValue({
        id: 'consent-1',
        status: ConsentStatus.REVOKED,
      });

      const revoked = await meService.revokeConsent('user-1', 'consent-1', 'req-rev');
      expect(revoked.status).toBe(ConsentStatus.REVOKED);
      expect(mockAudit.recordEvent).toHaveBeenCalled();
    });
  });
});
