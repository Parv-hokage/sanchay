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
      profile: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
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

  describe('Profile Category & Field Updates', () => {
    it('should return profile with category and support category=null', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'prof-a-1',
        userId: USER_A,
        fullName: 'Citizen A',
        category: null,
      });

      const profile = await meService.getProfile(USER_A);
      expect(profile.category).toBeNull();
      expect(profile.fullName).toBe('Citizen A');
    });

    it('should update profile category when authenticated user explicitly changes it', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'prof-a-1',
        userId: USER_A,
        fullName: 'Citizen A',
        category: null,
      });

      mockPrisma.profile.update.mockResolvedValue({
        id: 'prof-a-1',
        userId: USER_A,
        fullName: 'Citizen A',
        category: 'OBC_NCL',
      });

      const updated = await meService.updateProfile(
        USER_A,
        { category: 'OBC_NCL' as any },
        'req-prof-1',
      );

      expect(updated.category).toBe('OBC_NCL');
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'prof-a-1' },
        data: expect.objectContaining({ category: 'OBC_NCL' }),
      });
    });
  });
});
