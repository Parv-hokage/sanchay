import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  IdentityProviderType,
  UserStatus,
  LoginResponseData,
  AuthSessionData,
  AuditActionType,
} from '@sanchay/types';

interface LoginChallenge {
  challengeId: string;
  provider: IdentityProviderType;
  identifier: string;
  expectedOtp: string;
  expiresAt: number;
}

// In-memory fallback stores for local resilience
const inMemoryUsers = new Map<string, any>();
const inMemorySessions = new Map<string, any>();

// Default demo citizen
const DEFAULT_CITIZEN_USER = {
  id: 'user-default-001',
  sanchayUid: '00000000-0000-4000-8000-000000000001',
  status: 'ACTIVE' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
  profile: {
    id: 'prof-default-001',
    userId: 'user-default-001',
    fullName: 'Parv Mittal',
    dateOfBirth: new Date('2006-08-15'),
    gender: 'Male',
    category: 'OBC_NCL',
    preferredLanguage: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};
inMemoryUsers.set('user-default-001', DEFAULT_CITIZEN_USER);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly activeChallenges = new Map<string, LoginChallenge>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Initiates a passwordless / OTP login challenge
   */
  async startLogin(
    provider: IdentityProviderType,
    identifier: string,
    requestId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseData> {
    if (!identifier || identifier.trim().length === 0) {
      throw new BadRequestException('Identifier (phone number, email, or mock ID) is required.');
    }

    const challengeId = uuidv4();
    const expectedOtp = '123456'; // Deterministic test OTP for development/testing
    const expiresInSeconds = 300; // 5 minutes

    this.activeChallenges.set(challengeId, {
      challengeId,
      provider,
      identifier: identifier.trim(),
      expectedOtp,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    });

    await this.auditService.recordEvent({
      actorId: null,
      actorType: 'USER',
      action: AuditActionType.AUTH_LOGIN,
      resourceType: 'AUTH_CHALLENGE',
      resourceId: challengeId,
      requestId,
      ipAddress,
      userAgent,
      metadata: { provider, identifierMasked: this.maskIdentifier(identifier) },
    });

    return {
      sessionChallengeId: challengeId,
      provider,
      message: `Authentication challenge initiated. Enter OTP (Use 123456 in dev/test mode).`,
      expiresInSeconds,
    };
  }

  async initiateLogin(
    provider: IdentityProviderType,
    identifier: string,
    requestId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseData> {
    return this.startLogin(provider, identifier, requestId, ipAddress, userAgent);
  }

  /**
   * Verifies challenge OTP, resolves or creates Sanchay account + Sanchay UID, and establishes session
   */
  async verifyLogin(
    sessionChallengeId: string,
    otp: string,
    requestId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthSessionData> {
    const challenge = this.activeChallenges.get(sessionChallengeId);

    if (!challenge) {
      throw new UnauthorizedException('Authentication challenge not found or expired.');
    }

    if (Date.now() > challenge.expiresAt) {
      this.activeChallenges.delete(sessionChallengeId);
      throw new UnauthorizedException('Authentication challenge has expired. Please request a new login.');
    }

    if (challenge.expectedOtp !== otp.trim()) {
      await this.auditService.recordEvent({
        actorId: null,
        actorType: 'USER',
        action: AuditActionType.AUTH_LOGIN_FAILED,
        resourceType: 'AUTH_CHALLENGE',
        resourceId: sessionChallengeId,
        requestId,
        ipAddress,
        userAgent,
        metadata: { reason: 'INVALID_OTP' },
      });
      throw new UnauthorizedException('Invalid verification code provided.');
    }

    // Challenge verified, consume it
    this.activeChallenges.delete(sessionChallengeId);

    // Resolve or create user based on Identity Provider + Identifier
    let user: any = null;
    try {
      user = await this.findUserByIdentity(challenge.provider, challenge.identifier);
      if (!user) {
        user = await this.createCitizenUser(challenge.provider, challenge.identifier);
      }
    } catch {
      // In-memory fallback
      user = DEFAULT_CITIZEN_USER;
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('This Sanchay citizen account is currently suspended.');
    }

    // Create session token with 7 days expiration
    const sessionToken = uuidv4() + '.' + uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      await this.prisma.authSession.create({
        data: {
          userId: user.id,
          sessionToken,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          expiresAt,
        },
      });
    } catch {
      inMemorySessions.set(sessionToken, {
        id: `sess-${Date.now()}`,
        userId: user.id,
        sessionToken,
        expiresAt,
        user,
      });
    }

    await this.auditService.recordEvent({
      actorId: user.id,
      actorType: 'USER',
      action: AuditActionType.AUTH_LOGIN,
      resourceType: 'SESSION',
      resourceId: sessionToken.substring(0, 8),
      requestId,
      ipAddress,
      userAgent,
      metadata: { sanchayUid: user.sanchayUid },
    });

    return {
      token: sessionToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        sanchayUid: user.sanchayUid,
        status: user.status as UserStatus,
      },
      profile: user.profile
        ? {
            id: user.profile.id,
            userId: user.profile.userId,
            fullName: user.profile.fullName,
            dateOfBirth: user.profile.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : null,
            gender: user.profile.gender,
            preferredLanguage: user.profile.preferredLanguage,
            createdAt: user.profile.createdAt,
            updatedAt: user.profile.updatedAt,
          }
        : null,
    };
  }

  /**
   * Validates active session token and returns authenticated user and profile
   */
  async validateSession(token: string) {
    if (!token || token.trim().length === 0) {
      return null;
    }

    try {
      const session = await this.prisma.authSession.findUnique({
        where: { sessionToken: token },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (session) {
        if (new Date() > session.expiresAt) {
          await this.prisma.authSession.delete({ where: { id: session.id } }).catch(() => {});
          return null;
        }

        return {
          session,
          user: session.user,
          profile: session.user.profile,
        };
      }
    } catch {
      // Fallback
    }

    const fallbackSession = inMemorySessions.get(token);
    if (fallbackSession) {
      if (new Date() > fallbackSession.expiresAt) {
        inMemorySessions.delete(token);
        return null;
      }
      return {
        session: fallbackSession,
        user: fallbackSession.user,
        profile: fallbackSession.user.profile,
      };
    }

    return null;
  }

  /**
   * Terminates and revokes a session
   */
  async logout(sessionToken: string, userId: string, requestId: string, ipAddress?: string, userAgent?: string) {
    try {
      const session = await this.prisma.authSession.findUnique({
        where: { sessionToken },
      });
      if (session) {
        await this.prisma.authSession.delete({
          where: { id: session.id },
        });
      }
    } catch {
      inMemorySessions.delete(sessionToken);
    }

    await this.auditService.recordEvent({
      actorId: userId,
      actorType: 'USER',
      action: AuditActionType.AUTH_LOGOUT,
      resourceType: 'SESSION',
      resourceId: sessionToken.substring(0, 8),
      requestId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Generates a stable, opaque, unique Sanchay UID decoupled from personal data per ADR-007
   */
  async generateSanchayUid(): Promise<string> {
    return uuidv4();
  }

  private async findUserByIdentity(provider: IdentityProviderType, identifier: string) {
    const link = await this.prisma.identityLink.findFirst({
      where: {
        provider: provider as unknown as import('@prisma/client').IdentityProvider,
        externalSubjectReference: identifier,
      },
      include: {
        user: { include: { profile: true } },
      },
    });

    return link?.user || null;
  }

  private async createCitizenUser(provider: IdentityProviderType, identifier: string) {
    const sanchayUid = await this.generateSanchayUid();

    const user = await this.prisma.user.create({
      data: {
        sanchayUid,
        status: 'ACTIVE',
        profile: {
          create: {
            fullName: provider === IdentityProviderType.MOCK_IDP ? 'Citizen ' + identifier : 'Rahul Sharma',
            preferredLanguage: 'en',
          },
        },
        identityLinks: {
          create: {
            provider: provider as unknown as import('@prisma/client').IdentityProvider,
            externalSubjectReference: identifier,
            isVerified: true,
            verifiedAt: new Date(),
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return user;
  }

  private maskIdentifier(id: string): string {
    if (id.length <= 4) return '***';
    return id.substring(0, 2) + '****' + id.substring(id.length - 2);
  }
}
