import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CatalogService — Public Safety & Data Isolation', () => {
  let catalogService: CatalogService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      governmentService: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    };
    catalogService = new CatalogService(mockPrisma as PrismaService);
  });

  it('should only return public metadata and not include citizen private fields or credentials in public responses', async () => {
    mockPrisma.governmentService.findFirst.mockResolvedValue({
      id: 'srv-1',
      name: 'JEE Main',
      slug: 'jee-main',
      description: 'Public description',
      officialUrl: 'https://jeemain.nta.nic.in',
      version: '2026.1',
      status: 'ACTIVE',
      organization: {
        name: 'National Testing Agency',
        officialDomain: 'nta.ac.in',
        department: { name: 'Education', slug: 'education' },
      },
      capabilities: [
        {
          id: 'cap-1',
          name: 'Exam Information',
          slug: 'exam-info',
          type: 'KNOWLEDGE',
          requiresAuthentication: false,
          requiresConsent: false,
        },
      ],
      integrations: [
        {
          id: 'int-1',
          integrationType: 'MOCK',
          baseReference: 'JEEAdapter',
        },
      ],
    });

    const result = await catalogService.getServiceBySlugOrId('jee-main');

    expect(result.name).toBe('JEE Main');
    expect(result).not.toHaveProperty('userId');
    expect(result).not.toHaveProperty('token');
    expect(result).not.toHaveProperty('password');
    expect(result.integrations[0].integrationType).toBe('MOCK');
  });
});
