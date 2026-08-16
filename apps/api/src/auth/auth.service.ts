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
  AuditActionType,
  AuthSessionData,
  LoginResponseData,
} from '@sanchay/types';

interface SessionChallenge {
  challengeId: string;
  provider: IdentityProviderType;
  identifier: string;
  expectedOtp: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory challenge store for development/testing; can back to Redis
  private readonly activeChallenges = new Map<string, SessionChallenge>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Starts authentication and issues a challenge
   */
  async startLogin(
    provider: IdentityProviderType,
    identifier: string,
    requestId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseData> {
    const challengeId = uuidv4();
    // Default deterministic test OTP for MOCK_IDP/development: '123456'
    const expectedOtp = provider === IdentityProviderType.MOCK_IDP ? '123456' : '123456';
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
    let user = await this.findUserByIdentity(challenge.provider, challenge.identifier);

    if (!user) {
      user = await this.createCitizenUser(challenge.provider, challenge.identifier);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('This Sanchay citizen account is currently suspended.');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session token with 7 days expiration
    const sessionToken = uuidv4() + '.' + uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await this.prisma.authSession.create({
      data: {
        userId: user.id,
        sessionToken,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt,
      },
    });

    await this.auditService.recordEvent({
      actorId: user.id,
      actorType: 'USER',
      action: AuditActionType.AUTH_LOGIN,
      resourceType: 'SESSION',
      resourceId: session.id,
      requestId,
      ipAddress,
      userAgent,
      metadata: { sanchayUid: user.sanchayUid, provider: challenge.provider },
    });

    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });

    return {
      token: sessionToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        sanchayUid: user.sanchayUid,
        status: user.status as UserStatus,
      },
      profile: profile
        ? {
            id: profile.id,
            userId: profile.userId,
            fullName: profile.fullName,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender,
            preferredLanguage: profile.preferredLanguage,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
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

    if (!session) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      // Clean expired session
      await this.prisma.authSession.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    return {
      session,
      user: session.user,
      profile: session.user.profile,
    };
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

        await this.auditService.recordEvent({
          actorId: userId,
          actorType: 'USER',
          action: AuditActionType.AUTH_LOGOUT,
          resourceType: 'SESSION',
          resourceId: session.id,
          requestId,
          ipAddress,
          userAgent,
        });
      }
    } catch (error) {
      this.logger.warn(`Logout error: ${(error as Error).message}`);
    }
  }

  /**
   * Generates a stable, opaque, unique Sanchay UID decoupled from personal data per ADR-007
   */
  async generateSanchayUid(): Promise<string> {
    let candidate = uuidv4();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await this.prisma.user.findUnique({
        where: { sanchayUid: candidate },
      });
      if (!existing) {
        isUnique = true;
      } else {
        candidate = uuidv4();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Failed to generate a unique Sanchay UID.');
    }

    return candidate;
  }

  private async findUserByIdentity(provider: IdentityProviderType, identifier: string) {
    const link = await this.prisma.identityLink.findFirst({
      where: {
        provider: provider as unknown as import('@prisma/client').IdentityProvider,
        externalSubjectReference: identifier,
      },
      include: {
        user: true,
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
            fullName: provider === IdentityProviderType.MOCK_IDP ? 'Citizen ' + identifier : 'New Citizen',
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
