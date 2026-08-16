import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditActionType } from '@sanchay/types';

describe('AuditService', () => {
  let auditService: AuditService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      auditEvent: {
        create: vi.fn(),
      },
    };
    auditService = new AuditService(mockPrisma as PrismaService);
  });

  it('should record audit event and redact sensitive keys from metadata', async () => {
    mockPrisma.auditEvent.create.mockResolvedValue({
      id: 'audit-1',
      actorId: 'user-1',
      actorType: 'USER',
      action: AuditActionType.AUTH_LOGIN,
      resourceType: 'SESSION',
      resourceId: 'session-1',
      requestId: 'req-1',
      metadata: { safeField: 'ok', token: '[REDACTED]' },
      createdAt: new Date(),
    });

    const result = await auditService.recordEvent({
      actorId: 'user-1',
      actorType: 'USER',
      action: AuditActionType.AUTH_LOGIN,
      resourceType: 'SESSION',
      resourceId: 'session-1',
      requestId: 'req-1',
      metadata: {
        safeField: 'ok',
        token: 'sensitive-token-123',
        password: 'my-password',
        nested: {
          otp: '123456',
        },
      },
    });

    expect(result?.id).toBe('audit-1');
    expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: {
          safeField: 'ok',
          token: '[REDACTED]',
          password: '[REDACTED]',
          nested: {
            otp: '[REDACTED]',
          },
        },
      }),
    });
  });
});
