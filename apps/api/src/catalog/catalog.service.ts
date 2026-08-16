import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ServiceFilterParams {
  search?: string;
  departmentId?: string;
  departmentSlug?: string;
  organizationId?: string;
  status?: string;
}

// Deterministic seed catalog for local resilience
const FALLBACK_DEPARTMENTS = [
  {
    id: 'dept-edu-001',
    name: 'Department of Higher Education',
    slug: 'education',
    description: 'Unified admissions, competitive entrance examinations, and academic scholarships across India.',
    iconName: 'AcademicCapIcon',
    status: 'ACTIVE',
    organizationCount: 1,
    serviceCount: 1,
    featuredServices: [{ id: 'srv-jee-001', name: 'Joint Entrance Examination (Main)', slug: 'jee-main' }],
    organizations: [
      {
        id: 'org-nta-001',
        name: 'National Testing Agency (NTA)',
        slug: 'national-testing-agency',
        officialDomain: 'nta.ac.in',
        description: 'Premier specialist autonomous testing organization conducting entrance examinations for higher educational institutions.',
        services: [
          {
            id: 'srv-jee-001',
            name: 'Joint Entrance Examination (Main)',
            slug: 'jee-main',
            description: 'National undergraduate engineering entrance exam for admission to NITs, IIITs, and eligibility for JEE (Advanced).',
            officialUrl: 'https://jeemain.nta.nic.in',
            status: 'ACTIVE',
            version: '2026.1',
            capabilities: [
              { id: 'cap-jee-1', name: 'Exam Information & Schedule', slug: 'exam-info', type: 'KNOWLEDGE', description: 'View examination dates, shifts, pattern of examination, syllabus, and test center cities.', requiresAuthentication: false, requiresConsent: false, requiresConfirmation: false, auditRequired: false },
              { id: 'cap-jee-2', name: 'Eligibility Verification', slug: 'check-eligibility', type: 'RETRIEVE', description: 'Verify qualifying examination percentage, age criteria, and subject combinations for B.E. / B.Tech / B.Arch.', requiresAuthentication: false, requiresConsent: false, requiresConfirmation: false, auditRequired: false },
              { id: 'cap-jee-3', name: 'Online Application & Registration', slug: 'registration', type: 'ACTION', description: 'Prepare, auto-fill, and submit official examination application form.', requiresAuthentication: true, requiresConsent: true, requiresConfirmation: true, auditRequired: true, requirements: [
                { id: 'req-1', fieldKey: 'fullName', label: 'Candidate Full Name', required: true, source: 'PROFILE' },
                { id: 'req-2', fieldKey: 'dateOfBirth', label: 'Date of Birth (YYYY-MM-DD)', required: true, source: 'PROFILE' },
                { id: 'req-3', fieldKey: 'gender', label: 'Gender', required: true, source: 'PROFILE' },
                { id: 'req-4', fieldKey: 'category', label: 'Category (GEN/OBC/SC/ST/EWS)', required: true, source: 'USER' },
                { id: 'req-5', fieldKey: 'twelfthMarks', label: 'Class 12 Passing Status / Percentage', required: true, source: 'USER' },
                { id: 'req-6', fieldKey: 'permanentAddress', label: 'Permanent Address', required: true, source: 'PROFILE' },
              ]},
              { id: 'cap-jee-4', name: 'Application Status Tracker', slug: 'application-status', type: 'STATUS', description: 'Check real-time application verification, payment confirmation, and scrutiny status.', requiresAuthentication: true, requiresConsent: true, requiresConfirmation: false, auditRequired: true },
              { id: 'cap-jee-5', name: 'Admit Card Download', slug: 'admit-card', type: 'DOCUMENT', description: 'Retrieve verified digital hall ticket with examination center allotment and QR code.', requiresAuthentication: true, requiresConsent: true, requiresConfirmation: false, auditRequired: true },
              { id: 'cap-jee-6', name: 'Scorecard & Results', slug: 'results', type: 'DOCUMENT', description: 'View official NTA percentile score, All India Rank (AIR), and qualification cutoff.', requiresAuthentication: true, requiresConsent: true, requiresConfirmation: false, auditRequired: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'dept-health-002',
    name: 'Ministry of Health and Family Welfare',
    slug: 'healthcare',
    description: 'Universal health assurance, digital health records (ABHA), and medical benefits for citizens.',
    iconName: 'HeartIcon',
    status: 'ACTIVE',
    organizationCount: 1,
    serviceCount: 1,
    featuredServices: [{ id: 'srv-ayush-002', name: 'Ayushman Bharat PM-JAY', slug: 'ayushman-bharat' }],
    organizations: [
      {
        id: 'org-nha-002',
        name: 'National Health Authority (NHA)',
        slug: 'national-health-authority',
        officialDomain: 'nha.gov.in',
        description: 'Apex statutory body responsible for implementing Ayushman Bharat Pradhan Mantri Jan Arogya Yojana and Ayushman Bharat Digital Mission.',
        services: [
          {
            id: 'srv-ayush-002',
            name: 'Ayushman Bharat PM-JAY',
            slug: 'ayushman-bharat',
            description: 'Flagship national health protection scheme providing ₹5 lakh health cover per family per year for secondary and tertiary care hospitalization.',
            officialUrl: 'https://pmjay.gov.in',
            status: 'ACTIVE',
            version: '3.0',
            capabilities: [
              { id: 'cap-ayush-1', name: 'Scheme Benefits & Guidelines', slug: 'scheme-info', type: 'KNOWLEDGE', description: 'Overview of ₹5 Lakh cashless hospitalization coverage, eligible treatments, and pre-existing disease terms.', requiresAuthentication: false, requiresConsent: false, requiresConfirmation: false, auditRequired: false },
              { id: 'cap-ayush-2', name: 'Beneficiary Eligibility Check', slug: 'check-eligibility', type: 'RETRIEVE', description: 'Verify SECC household inclusion, ration card mapping, or state eligibility list.', requiresAuthentication: true, requiresConsent: true, requiresConfirmation: false, auditRequired: true, requirements: [
                { id: 'req-7', fieldKey: 'rationCardNumber', label: 'Ration Card Number', required: false, source: 'USER' },
                { id: 'req-8', fieldKey: 'state', label: 'Residential State', required: true, source: 'PROFILE' },
              ]},
              { id: 'cap-ayush-3', name: 'Ayushman Card (Golden Card) Download', slug: 'ayushman-card', type: 'DOCUMENT', description: 'Download verified PVC Ayushman Golden Card with PM-JAY ID for cashless hospital admission.', requiresAuthentication: true, requiresConsent: true, requiresConfirmation: false, auditRequired: true },
              { id: 'cap-ayush-4', name: 'Empaneled Hospital Search', slug: 'hospital-search', type: 'KNOWLEDGE', description: 'Locate nearby government and private empaneled hospitals by specialty and district.', requiresAuthentication: false, requiresConsent: false, requiresConfirmation: false, auditRequired: false },
              { id: 'cap-ayush-5', name: 'Treatment & Pre-Auth Claim Status', slug: 'claim-status', type: 'STATUS', description: 'Track pre-authorization status and hospital discharge claim settlements.', requiresAuthentication: true, requiresConsent: true, requiresConfirmation: false, auditRequired: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'dept-fin-003',
    name: 'Department of Revenue & Financial Services',
    slug: 'finance',
    description: 'Taxation, national identity cards, pensions, and financial inclusion services.',
    iconName: 'BanknotesIcon',
    status: 'ACTIVE',
    organizationCount: 1,
    serviceCount: 1,
    featuredServices: [{ id: 'srv-pan-003', name: 'Permanent Account Number (PAN) Issuance', slug: 'pan-services' }],
    organizations: [
      {
        id: 'org-cbdt-003',
        name: 'Central Board of Direct Taxes (CBDT)',
        slug: 'central-board-direct-taxes',
        officialDomain: 'incometax.gov.in',
        description: 'Statutory authority functioning under the Central Board of Revenue Act administering direct taxes and Permanent Account Number (PAN).',
        services: [
          {
            id: 'srv-pan-003',
            name: 'Permanent Account Number (PAN) Issuance',
            slug: 'pan-services',
            description: 'Application, correction, and verification of 10-digit alphanumeric PAN for citizens and tax entities.',
            officialUrl: 'https://www.incometax.gov.in',
            status: 'ACTIVE',
            version: '2.0',
            capabilities: [
              { id: 'cap-pan-1', name: 'Apply for New PAN (Form 49A)', slug: 'pan-allotment', type: 'ACTION', description: 'Instant paperless PAN allotment for Indian citizens with digital e-Sign.', requiresAuthentication: true, requiresConsent: true, requiresConfirmation: true, auditRequired: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'dept-trans-004',
    name: 'Ministry of Road Transport and Highways',
    slug: 'transport',
    description: 'Driving license issuance, vehicle registration, and national transport permits.',
    iconName: 'TruckIcon',
    status: 'ACTIVE',
    organizationCount: 1,
    serviceCount: 1,
    featuredServices: [{ id: 'srv-dl-004', name: 'Driving License Services (Sarathi)', slug: 'driving-license' }],
    organizations: [
      {
        id: 'org-morth-004',
        name: 'Parivahan Sewa (MoRTH)',
        slug: 'parivahan-sewa',
        officialDomain: 'parivahan.gov.in',
        description: 'National portal facilitating citizen-centric transport services under the Ministry of Road Transport and Highways.',
        services: [
          {
            id: 'srv-dl-004',
            name: 'Driving License Services (Sarathi)',
            slug: 'driving-license',
            description: 'Learner license application, permanent license booking, renewal, and address change services.',
            officialUrl: 'https://parivahan.gov.in/parivahan',
            status: 'ACTIVE',
            version: '4.0',
            capabilities: [
              { id: 'cap-dl-1', name: 'Learner License Application', slug: 'learner-license', type: 'ACTION', description: 'Online application and contactless computer test for Learner License.', requiresAuthentication: true, requiresConsent: true, requiresConfirmation: true, auditRequired: true },
            ],
          },
        ],
      },
    ],
  },
];

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. Departments
  // ==========================================
  async getDepartments() {
    try {
      const departments = await this.prisma.department.findMany({
        where: { status: 'ACTIVE' },
        include: {
          organizations: {
            include: {
              services: {
                where: { status: 'ACTIVE' },
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      if (departments && departments.length > 0) {
        return departments.map((dept) => {
          const allServices = (dept.organizations || []).flatMap((org) => org.services || []);
          return {
            id: dept.id,
            name: dept.name,
            slug: dept.slug,
            description: dept.description,
            iconName: dept.iconName,
            status: dept.status,
            organizationCount: dept.organizations.length,
            serviceCount: allServices.length,
            featuredServices: allServices.slice(0, 3),
          };
        });
      }
    } catch {
      // Fallback if DB is unreachable
    }

    return FALLBACK_DEPARTMENTS.map((dept) => ({
      id: dept.id,
      name: dept.name,
      slug: dept.slug,
      description: dept.description,
      iconName: dept.iconName,
      status: dept.status,
      organizationCount: dept.organizationCount,
      serviceCount: dept.serviceCount,
      featuredServices: dept.featuredServices,
    }));
  }

  async getDepartmentBySlugOrId(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    try {
      const department = await this.prisma.department.findFirst({
        where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
        include: {
          organizations: {
            include: {
              services: {
                where: { status: 'ACTIVE' },
                include: {
                  capabilities: {
                    select: { id: true, name: true, slug: true, type: true },
                  },
                },
              },
            },
          },
        },
      });

      if (department) return department;
    } catch {
      // Fallback
    }

    const fallback = FALLBACK_DEPARTMENTS.find((d) => (isUuid ? d.id === idOrSlug : d.slug === idOrSlug));
    if (!fallback) {
      throw new NotFoundException(`Department '${idOrSlug}' not found.`);
    }

    return fallback;
  }

  // ==========================================
  // 2. Organizations
  // ==========================================
  async getOrganizations(departmentId?: string) {
    try {
      const orgs = await this.prisma.organization.findMany({
        where: {
          status: 'ACTIVE',
          ...(departmentId ? { departmentId } : {}),
        },
        include: {
          department: { select: { id: true, name: true, slug: true } },
          services: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { name: 'asc' },
      });
      if (orgs && orgs.length > 0) return orgs;
    } catch {
      // Fallback
    }

    const allOrgs = FALLBACK_DEPARTMENTS.flatMap((d) =>
      d.organizations.map((org) => ({
        ...org,
        department: { id: d.id, name: d.name, slug: d.slug },
      })),
    );

    return departmentId ? allOrgs.filter((o) => o.department.id === departmentId) : allOrgs;
  }

  async getOrganizationBySlugOrId(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    try {
      const org = await this.prisma.organization.findFirst({
        where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
        include: {
          department: true,
          services: {
            where: { status: 'ACTIVE' },
            include: { capabilities: true },
          },
        },
      });
      if (org) return org;
    } catch {
      // Fallback
    }

    for (const d of FALLBACK_DEPARTMENTS) {
      const found = d.organizations.find((o) => (isUuid ? o.id === idOrSlug : o.slug === idOrSlug));
      if (found) {
        return {
          ...found,
          department: { id: d.id, name: d.name, slug: d.slug, description: d.description },
        };
      }
    }

    throw new NotFoundException(`Organization '${idOrSlug}' not found.`);
  }

  // ==========================================
  // 3. Government Services
  // ==========================================
  async getServices(params: ServiceFilterParams = {}) {
    const { search, departmentId, departmentSlug, organizationId, status = 'ACTIVE' } = params;

    try {
      const whereClause: import('@prisma/client').Prisma.GovernmentServiceWhereInput = {
        ...(status ? { status: status as import('@prisma/client').EntityStatus } : {}),
        ...(organizationId ? { organizationId } : {}),
        ...(departmentId ? { organization: { departmentId } } : {}),
        ...(departmentSlug ? { organization: { department: { slug: departmentSlug } } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { organization: { name: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      };

      const services = await this.prisma.governmentService.findMany({
        where: whereClause,
        include: {
          organization: {
            include: {
              department: { select: { id: true, name: true, slug: true } },
            },
          },
          capabilities: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              description: true,
              requiresAuthentication: true,
              requiresConsent: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      if (services && services.length > 0) return services;
    } catch {
      // Fallback
    }

    // Fallback search & filter
    const allServices = FALLBACK_DEPARTMENTS.flatMap((d) =>
      d.organizations.flatMap((org) =>
        org.services.map((srv) => ({
          ...srv,
          organization: {
            id: org.id,
            name: org.name,
            slug: org.slug,
            officialDomain: org.officialDomain,
            department: { id: d.id, name: d.name, slug: d.slug },
          },
        })),
      ),
    );

    return allServices.filter((srv) => {
      const matchesSearch =
        !search ||
        srv.name.toLowerCase().includes(search.toLowerCase()) ||
        srv.description.toLowerCase().includes(search.toLowerCase()) ||
        srv.organization.name.toLowerCase().includes(search.toLowerCase());

      const matchesDept =
        (!departmentId || srv.organization.department.id === departmentId) &&
        (!departmentSlug || srv.organization.department.slug === departmentSlug);

      const matchesOrg = !organizationId || srv.organization.id === organizationId;

      return matchesSearch && matchesDept && matchesOrg;
    });
  }

  async getRecommendedServices() {
    try {
      const services = await this.prisma.governmentService.findMany({
        where: {
          status: 'ACTIVE',
          slug: { in: ['jee-main', 'ayushman-bharat', 'pan-services', 'driving-license'] },
        },
        include: {
          organization: {
            include: {
              department: { select: { id: true, name: true, slug: true } },
            },
          },
          capabilities: {
            where: { status: 'ACTIVE' },
            select: { id: true, name: true, slug: true, type: true },
          },
        },
      });

      if (services && services.length > 0) return services;
    } catch {
      // Fallback
    }

    return this.getServices();
  }

  async getServiceBySlugOrId(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    try {
      const service = await this.prisma.governmentService.findFirst({
        where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
        include: {
          organization: {
            include: {
              department: true,
            },
          },
          capabilities: {
            where: { status: 'ACTIVE' },
            include: {
              requirements: true,
            },
            orderBy: { name: 'asc' },
          },
          integrations: true,
        },
      });

      if (service) return service;
    } catch {
      // Fallback
    }

    for (const d of FALLBACK_DEPARTMENTS) {
      for (const org of d.organizations) {
        const found = org.services.find((s) => (isUuid ? s.id === idOrSlug : s.slug === idOrSlug));
        if (found) {
          return {
            ...found,
            organization: {
              id: org.id,
              name: org.name,
              slug: org.slug,
              officialDomain: org.officialDomain,
              department: { id: d.id, name: d.name, slug: d.slug, description: d.description },
            },
            integrations: [
              {
                id: 'int-demo-1',
                integrationType: 'MOCK',
                baseReference: found.slug === 'jee-main' ? 'JEEAdapter' : 'AyushmanAdapter',
                status: 'ACTIVE',
              },
            ],
          };
        }
      }
    }

    throw new NotFoundException(`Government service '${idOrSlug}' not found.`);
  }

  // ==========================================
  // 4. Capabilities & Requirements
  // ==========================================
  async getCapabilities(serviceIdOrSlug: string) {
    const service = await this.getServiceBySlugOrId(serviceIdOrSlug);

    try {
      const caps = await this.prisma.serviceCapability.findMany({
        where: { serviceId: service.id, status: 'ACTIVE' },
        include: { requirements: true },
        orderBy: { name: 'asc' },
      });
      if (caps && caps.length > 0) return caps;
    } catch {
      // Fallback
    }

    return service.capabilities || [];
  }

  async getCapability(serviceIdOrSlug: string, capIdOrSlug: string) {
    const service = await this.getServiceBySlugOrId(serviceIdOrSlug);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(capIdOrSlug);

    try {
      const capability = await this.prisma.serviceCapability.findFirst({
        where: {
          serviceId: service.id,
          ...(isUuid ? { id: capIdOrSlug } : { slug: capIdOrSlug }),
        },
        include: {
          requirements: true,
          service: {
            include: {
              organization: {
                include: { department: true },
              },
            },
          },
        },
      });

      if (capability) return capability;
    } catch {
      // Fallback
    }

    const foundCap = (service.capabilities || []).find((c: any) =>
      isUuid ? c.id === capIdOrSlug : c.slug === capIdOrSlug,
    );

    if (!foundCap) {
      throw new NotFoundException(`Capability '${capIdOrSlug}' not found for service '${service.name}'.`);
    }

    return {
      ...foundCap,
      service,
    };
  }
}
