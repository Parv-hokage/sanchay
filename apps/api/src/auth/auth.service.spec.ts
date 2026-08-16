import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { IdentityProviderType, UserStatus } from '@sanchay/types';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      identityLink: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      authSession: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      profile: {
        findUnique: vi.fn(),
      },
    };

    mockAudit = {
      recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    authService = new AuthService(mockPrisma as PrismaService, mockAudit as AuditService);
  });

  describe('startLogin', () => {
    it('should generate a session challenge and record audit event', async () => {
      const result = await authService.startLogin(
        IdentityProviderType.MOCK_IDP,
        'citizen1',
        'req-1',
        '127.0.0.1',
        'test-agent',
      );

      expect(result.sessionChallengeId).toBeDefined();
      expect(result.provider).toBe(IdentityProviderType.MOCK_IDP);
      expect(result.expiresInSeconds).toBe(300);
      expect(mockAudit.recordEvent).toHaveBeenCalled();
    });
  });

  describe('verifyLogin', () => {
    it('should verify challenge, create Sanchay UID and user if not exists, and return session token', async () => {
      const challenge = await authService.startLogin(
        IdentityProviderType.MOCK_IDP,
        'citizen1',
        'req-1',
      );

      mockPrisma.identityLink.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null); // UID collision check
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-uuid-1',
        sanchayUid: 'sanchay-uid-1',
        status: 'ACTIVE',
        profile: {
          id: 'prof-1',
          userId: 'user-uuid-1',
          fullName: 'Citizen citizen1',
          preferredLanguage: 'en',
        },
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.authSession.create.mockResolvedValue({
        id: 'session-1',
        userId: 'user-uuid-1',
        sessionToken: 'token.123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'prof-1',
        userId: 'user-uuid-1',
        fullName: 'Citizen citizen1',
        preferredLanguage: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const sessionData = await authService.verifyLogin(
        challenge.sessionChallengeId,
        '123456',
        'req-2',
      );

      expect(sessionData.token).toBeDefined();
      expect(sessionData.user.sanchayUid).toBe('sanchay-uid-1');
      expect(sessionData.user.status).toBe(UserStatus.ACTIVE);
      expect(mockAudit.recordEvent).toHaveBeenCalled();
    });

    it('should reject invalid OTP', async () => {
      const challenge = await authService.startLogin(
        IdentityProviderType.MOCK_IDP,
        'citizen1',
        'req-1',
      );

      await expect(
        authService.verifyLogin(challenge.sessionChallengeId, '000000', 'req-3'),
      ).rejects.toThrow('Invalid verification code provided.');
    });

    it('should reject unknown or expired challengeId', async () => {
      await expect(
        authService.verifyLogin('00000000-0000-0000-0000-000000000000', '123456', 'req-4'),
      ).rejects.toThrow('Authentication challenge not found or expired.');
    });
  });

  describe('validateSession', () => {
    it('should return session and user context for valid token', async () => {
      const validSession = {
        id: 'session-1',
        sessionToken: 'valid-token',
        expiresAt: new Date(Date.now() + 100000),
        user: {
          id: 'user-1',
          sanchayUid: 'sanchay-uid-1',
          status: 'ACTIVE',
          profile: { id: 'prof-1', fullName: 'Verified Citizen' },
        },
      };

      mockPrisma.authSession.findUnique.mockResolvedValue(validSession);

      const result = await authService.validateSession('valid-token');
      expect(result).toBeDefined();
      expect(result?.user.id).toBe('user-1');
      expect(result?.user.sanchayUid).toBe('sanchay-uid-1');
    });

    it('should return null and delete expired session', async () => {
      const expiredSession = {
        id: 'session-expired',
        sessionToken: 'expired-token',
        expiresAt: new Date(Date.now() - 1000),
        user: { id: 'user-1' },
      };

      mockPrisma.authSession.findUnique.mockResolvedValue(expiredSession);
      mockPrisma.authSession.delete.mockResolvedValue({});

      const result = await authService.validateSession('expired-token');
      expect(result).toBeNull();
      expect(mockPrisma.authSession.delete).toHaveBeenCalledWith({ where: { id: 'session-expired' } });
    });
  });

  describe('logout', () => {
    it('should delete session and record audit event', async () => {
      mockPrisma.authSession.findUnique.mockResolvedValue({
        id: 'session-1',
        sessionToken: 'token-logout',
      });
      mockPrisma.authSession.delete.mockResolvedValue({});

      await authService.logout('token-logout', 'user-1', 'req-logout');
      expect(mockPrisma.authSession.delete).toHaveBeenCalledWith({ where: { id: 'session-1' } });
      expect(mockAudit.recordEvent).toHaveBeenCalled();
    });
  });
});
