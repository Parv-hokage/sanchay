import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MeService } from './me.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('MeService — IDOR & Ownership Authorization Security', () => {
  let meService: MeService;
  let mockPrisma: any;
  let mockAudit: any;

  const USER_A = 'user-a-1111-1111';
  const USER_B = 'user-b-2222-2222';

  beforeEach(() => {
    mockPrisma = {
      address: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      identityLink: {
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      consent: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    mockAudit = {
      recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    meService = new MeService(mockPrisma as PrismaService, mockAudit as AuditService);
  });

  describe('Address IDOR Protection', () => {
    it('should reject User A modifying User B address with 403 Forbidden', async () => {
      // Address belongs to USER_B
      mockPrisma.address.findUnique.mockResolvedValue({
        id: 'addr-b-999',
        userId: USER_B,
        city: 'Mumbai',
      });

      await expect(
        meService.updateAddress(USER_A, 'addr-b-999', { city: 'Pune' }, 'req-idor-1'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.address.update).not.toHaveBeenCalled();
    });

    it('should reject User A deleting User B address with 403 Forbidden', async () => {
      mockPrisma.address.findUnique.mockResolvedValue({
        id: 'addr-b-999',
        userId: USER_B,
      });

      await expect(
        meService.deleteAddress(USER_A, 'addr-b-999', 'req-idor-2'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.address.delete).not.toHaveBeenCalled();
    });
  });

  describe('Identity Link IDOR Protection', () => {
    it('should reject User A unlinking User B identity link with 403 Forbidden', async () => {
      mockPrisma.identityLink.findUnique.mockResolvedValue({
        id: 'link-b-888',
        userId: USER_B,
      });

      await expect(
        meService.deleteIdentityLink(USER_A, 'link-b-888', 'req-idor-3'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.identityLink.delete).not.toHaveBeenCalled();
    });
  });

  describe('Consent IDOR Protection', () => {
    it('should reject User A revoking User B consent with 403 Forbidden', async () => {
      mockPrisma.consent.findUnique.mockResolvedValue({
        id: 'consent-b-777',
        userId: USER_B,
      });

      await expect(
        meService.revokeConsent(USER_A, 'consent-b-777', 'req-idor-4'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.consent.update).not.toHaveBeenCalled();
    });
  });
});
