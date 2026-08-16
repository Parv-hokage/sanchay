import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditActionType, AuditEvent } from '@sanchay/types';

export interface RecordAuditParams {
  actorId?: string | null;
  actorType?: 'USER' | 'SYSTEM' | 'ADMIN' | 'AI_AGENT';
  action: AuditActionType;
  resourceType: string;
  resourceId?: string | null;
  requestId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(params: RecordAuditParams): Promise<AuditEvent | null> {
    const sanitizedMetadata = this.sanitizeMetadata(params.metadata);

    try {
      const event = await this.prisma.auditEvent.create({
        data: {
          actorId: params.actorId || null,
          actorType: params.actorType || 'USER',
          action: params.action,
          resourceType: params.resourceType,
          resourceId: params.resourceId || null,
          requestId: params.requestId,
          metadata: (sanitizedMetadata as unknown as import('@prisma/client').Prisma.InputJsonValue) || undefined,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });

      this.logger.log(
        `[AUDIT] Action: ${params.action} | Resource: ${params.resourceType}:${params.resourceId || '-'} | Actor: ${params.actorId || 'anon'} | ReqID: ${params.requestId}`,
      );

      return {
        id: event.id,
        actorId: event.actorId,
        actorType: event.actorType as 'USER' | 'SYSTEM' | 'ADMIN' | 'AI_AGENT',
        action: event.action as AuditActionType,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        requestId: event.requestId,
        metadata: (event.metadata as Record<string, unknown>) || undefined,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        createdAt: event.createdAt,
      };
    } catch (error) {
      this.logger.warn(`Failed to persist audit event to database: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Sanitizes audit metadata to prevent secrets, tokens, or PII leakage per 11_SECURITY.md
   */
  private sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!metadata) return undefined;

    const sensitiveKeys = ['password', 'token', 'secret', 'sessiontoken', 'otp', 'jwt', 'authorization'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMetadata(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
