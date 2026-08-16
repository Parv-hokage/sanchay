import { describe, it, expect, vi } from 'vitest';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  it('should return health status payload', async () => {
    const mockPrisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    } as unknown as PrismaService;

    const controller = new HealthController(mockPrisma);
    const health = await controller.getHealth();

    expect(health.status).toBe('OK');
    expect(health.service).toBe('SANCHAY API');
    expect(health.version).toBe('0.1.0');
    expect(health.database).toBe('CONNECTED');
  });

  it('should report DISCONNECTED if database query fails', async () => {
    const mockPrisma = {
      $queryRaw: vi.fn().mockRejectedValue(new Error('DB unreachable')),
    } as unknown as PrismaService;

    const controller = new HealthController(mockPrisma);
    const health = await controller.getHealth();

    expect(health.status).toBe('OK');
    expect(health.database).toBe('DISCONNECTED');
  });
});
