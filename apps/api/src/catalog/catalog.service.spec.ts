import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CatalogService', () => {
  let catalogService: CatalogService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      department: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      organization: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      governmentService: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      serviceCapability: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    };

    catalogService = new CatalogService(mockPrisma as PrismaService);
  });

  describe('Departments', () => {
    it('should return list of departments with service and organization counts', async () => {
      mockPrisma.department.findMany.mockResolvedValue([
        {
          id: 'dept-1',
          name: 'Education',
          slug: 'education',
          description: 'Higher education and entrance exams',
          iconName: 'AcademicCapIcon',
          status: 'ACTIVE',
          organizations: [
            {
              services: [{ id: 'srv-1', name: 'JEE Main', slug: 'jee-main' }],
            },
          ],
        },
      ]);

      const departments = await catalogService.getDepartments();
      expect(departments).toHaveLength(1);
      expect(departments[0].name).toBe('Education');
      expect(departments[0].organizationCount).toBe(1);
      expect(departments[0].serviceCount).toBe(1);
    });

    it('should throw NotFoundException if department not found', async () => {
      mockPrisma.department.findFirst.mockResolvedValue(null);

      await expect(catalogService.getDepartmentBySlugOrId('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Services & Capabilities', () => {
    it('should filter services by search term and department', async () => {
      mockPrisma.governmentService.findMany.mockResolvedValue([
        {
          id: 'srv-1',
          name: 'JEE Main',
          slug: 'jee-main',
          organization: { name: 'NTA', department: { name: 'Education', slug: 'education' } },
          capabilities: [{ id: 'cap-1', name: 'Exam Info', slug: 'exam-info' }],
        },
      ]);

      const services = await catalogService.getServices({ search: 'JEE', departmentSlug: 'education' });
      expect(services).toHaveLength(1);
      expect(services[0].name).toBe('JEE Main');
    });

    it('should retrieve complete service details with capabilities and requirements', async () => {
      mockPrisma.governmentService.findFirst.mockResolvedValue({
        id: 'srv-1',
        name: 'JEE Main',
        slug: 'jee-main',
        organization: { name: 'National Testing Agency', department: { name: 'Education' } },
        capabilities: [
          {
            id: 'cap-1',
            name: 'Registration',
            slug: 'registration',
            requirements: [{ fieldKey: 'fullName', label: 'Full Name', required: true }],
          },
        ],
      });

      const service = await catalogService.getServiceBySlugOrId('jee-main');
      expect(service.name).toBe('JEE Main');
      expect(service.capabilities[0].requirements).toHaveLength(1);
    });

    it('should return recommended featured services', async () => {
      mockPrisma.governmentService.findMany.mockResolvedValue([
        { id: 'srv-1', name: 'JEE Main', slug: 'jee-main' },
        { id: 'srv-2', name: 'Ayushman Bharat', slug: 'ayushman-bharat' },
      ]);

      const recommendations = await catalogService.getRecommendedServices();
      expect(recommendations).toHaveLength(2);
    });
  });
});
