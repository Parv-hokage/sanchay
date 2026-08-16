import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SANCHAY Government Service Platform catalog...');

  // ==========================================
  // 1. Departments
  // ==========================================
  const educationDept = await prisma.department.upsert({
    where: { slug: 'education' },
    update: {},
    create: {
      name: 'Department of Higher Education',
      slug: 'education',
      description: 'Unified admissions, competitive entrance examinations, and academic scholarships across India.',
      iconName: 'AcademicCapIcon',
      status: 'ACTIVE',
    },
  });

  const healthcareDept = await prisma.department.upsert({
    where: { slug: 'healthcare' },
    update: {},
    create: {
      name: 'Ministry of Health and Family Welfare',
      slug: 'healthcare',
      description: 'Universal health assurance, digital health records (ABHA), and medical benefits for citizens.',
      iconName: 'HeartIcon',
      status: 'ACTIVE',
    },
  });

  const financeDept = await prisma.department.upsert({
    where: { slug: 'finance' },
    update: {},
    create: {
      name: 'Department of Revenue & Financial Services',
      slug: 'finance',
      description: 'Taxation, national identity cards, pensions, and financial inclusion services.',
      iconName: 'BanknotesIcon',
      status: 'ACTIVE',
    },
  });

  const transportDept = await prisma.department.upsert({
    where: { slug: 'transport' },
    update: {},
    create: {
      name: 'Ministry of Road Transport and Highways',
      slug: 'transport',
      description: 'Driving license issuance, vehicle registration, and national transport permits.',
      iconName: 'TruckIcon',
      status: 'ACTIVE',
    },
  });

  // ==========================================
  // 2. Organizations
  // ==========================================
  const nta = await prisma.organization.upsert({
    where: { slug: 'national-testing-agency' },
    update: {},
    create: {
      departmentId: educationDept.id,
      name: 'National Testing Agency (NTA)',
      slug: 'national-testing-agency',
      officialDomain: 'nta.ac.in',
      description: 'Premier specialist autonomous testing organization conducting entrance examinations for higher educational institutions.',
      status: 'ACTIVE',
    },
  });

  const nha = await prisma.organization.upsert({
    where: { slug: 'national-health-authority' },
    update: {},
    create: {
      departmentId: healthcareDept.id,
      name: 'National Health Authority (NHA)',
      slug: 'national-health-authority',
      officialDomain: 'nha.gov.in',
      description: 'Apex statutory body responsible for implementing Ayushman Bharat Pradhan Mantri Jan Arogya Yojana and Ayushman Bharat Digital Mission.',
      status: 'ACTIVE',
    },
  });

  const cbdt = await prisma.organization.upsert({
    where: { slug: 'central-board-direct-taxes' },
    update: {},
    create: {
      departmentId: financeDept.id,
      name: 'Central Board of Direct Taxes (CBDT)',
      slug: 'central-board-direct-taxes',
      officialDomain: 'incometax.gov.in',
      description: 'Statutory authority functioning under the Central Board of Revenue Act administering direct taxes and Permanent Account Number (PAN).',
      status: 'ACTIVE',
    },
  });

  const morth = await prisma.organization.upsert({
    where: { slug: 'parivahan-sewa' },
    update: {},
    create: {
      departmentId: transportDept.id,
      name: 'Parivahan Sewa (MoRTH)',
      slug: 'parivahan-sewa',
      officialDomain: 'parivahan.gov.in',
      description: 'National portal facilitating citizen-centric transport services under the Ministry of Road Transport and Highways.',
      status: 'ACTIVE',
    },
  });

  // ==========================================
  // 3. Government Services
  // ==========================================
  // 3.1 JEE Main
  const jeeMain = await prisma.governmentService.upsert({
    where: { slug: 'jee-main' },
    update: {},
    create: {
      organizationId: nta.id,
      name: 'Joint Entrance Examination (Main)',
      slug: 'jee-main',
      description: 'National undergraduate engineering entrance exam for admission to NITs, IIITs, and eligibility for JEE (Advanced).',
      officialUrl: 'https://jeemain.nta.nic.in',
      status: 'ACTIVE',
      version: '2026.1',
    },
  });

  // 3.2 Ayushman Bharat
  const ayushmanBharat = await prisma.governmentService.upsert({
    where: { slug: 'ayushman-bharat' },
    update: {},
    create: {
      organizationId: nha.id,
      name: 'Ayushman Bharat PM-JAY',
      slug: 'ayushman-bharat',
      description: 'Flagship national health protection scheme providing ₹5 lakh health cover per family per year for secondary and tertiary care hospitalization.',
      officialUrl: 'https://pmjay.gov.in',
      status: 'ACTIVE',
      version: '3.0',
    },
  });

  // 3.3 PAN Card
  const panService = await prisma.governmentService.upsert({
    where: { slug: 'pan-services' },
    update: {},
    create: {
      organizationId: cbdt.id,
      name: 'Permanent Account Number (PAN) Issuance',
      slug: 'pan-services',
      description: 'Application, correction, and verification of 10-digit alphanumeric PAN for citizens and tax entities.',
      officialUrl: 'https://www.incometax.gov.in',
      status: 'ACTIVE',
      version: '2.0',
    },
  });

  // 3.4 Driving License
  const dlService = await prisma.governmentService.upsert({
    where: { slug: 'driving-license' },
    update: {},
    create: {
      organizationId: morth.id,
      name: 'Driving License Services (Sarathi)',
      slug: 'driving-license',
      description: 'Learner license application, permanent license booking, renewal, and address change services.',
      officialUrl: 'https://parivahan.gov.in/parivahan',
      status: 'ACTIVE',
      version: '4.0',
    },
  });

  // ==========================================
  // 4. Service Capabilities & Requirements
  // ==========================================
  // 4.1 JEE Main Capabilities
  const jeeCaps = [
    {
      name: 'Exam Information & Schedule',
      slug: 'exam-info',
      type: 'KNOWLEDGE' as const,
      description: 'View examination dates, shifts, pattern of examination, syllabus, and test center cities.',
      requiresAuthentication: false,
      requiresConsent: false,
      requiresConfirmation: false,
      auditRequired: false,
    },
    {
      name: 'Eligibility Verification',
      slug: 'check-eligibility',
      type: 'RETRIEVE' as const,
      description: 'Verify qualifying examination percentage, age criteria, and subject combinations for B.E. / B.Tech / B.Arch.',
      requiresAuthentication: false,
      requiresConsent: false,
      requiresConfirmation: false,
      auditRequired: false,
    },
    {
      name: 'Online Application & Registration',
      slug: 'registration',
      type: 'ACTION' as const,
      description: 'Prepare, auto-fill, and submit official examination application form.',
      requiresAuthentication: true,
      requiresConsent: true,
      requiresConfirmation: true,
      auditRequired: true,
      requirements: [
        { fieldKey: 'fullName', label: 'Candidate Full Name', required: true, source: 'PROFILE' },
        { fieldKey: 'dateOfBirth', label: 'Date of Birth (YYYY-MM-DD)', required: true, source: 'PROFILE' },
        { fieldKey: 'gender', label: 'Gender', required: true, source: 'PROFILE' },
        { fieldKey: 'category', label: 'Category (GEN/OBC/SC/ST/EWS)', required: true, source: 'USER' },
        { fieldKey: 'twelfthMarks', label: 'Class 12 Passing Status / Percentage', required: true, source: 'USER' },
        { fieldKey: 'permanentAddress', label: 'Permanent Address', required: true, source: 'PROFILE' },
      ],
    },
    {
      name: 'Application Status Tracker',
      slug: 'application-status',
      type: 'STATUS' as const,
      description: 'Check real-time application verification, payment confirmation, and scrutiny status.',
      requiresAuthentication: true,
      requiresConsent: true,
      requiresConfirmation: false,
      auditRequired: true,
    },
    {
      name: 'Admit Card Download',
      slug: 'admit-card',
      type: 'DOCUMENT' as const,
      description: 'Retrieve verified digital hall ticket with examination center allotment and QR code.',
      requiresAuthentication: true,
      requiresConsent: true,
      requiresConfirmation: false,
      auditRequired: true,
    },
    {
      name: 'Scorecard & Results',
      slug: 'results',
      type: 'DOCUMENT' as const,
      description: 'View official NTA percentile score, All India Rank (AIR), and qualification cutoff.',
      requiresAuthentication: true,
      requiresConsent: true,
      requiresConfirmation: false,
      auditRequired: true,
    },
  ];

  for (const cap of jeeCaps) {
    const createdCap = await prisma.serviceCapability.upsert({
      where: {
        serviceId_slug: {
          serviceId: jeeMain.id,
          slug: cap.slug,
        },
      },
      update: {},
      create: {
        serviceId: jeeMain.id,
        name: cap.name,
        slug: cap.slug,
        type: cap.type,
        description: cap.description,
        requiresAuthentication: cap.requiresAuthentication,
        requiresConsent: cap.requiresConsent,
        requiresConfirmation: cap.requiresConfirmation,
        auditRequired: cap.auditRequired,
        status: 'ACTIVE',
      },
    });

    if (cap.requirements) {
      for (const req of cap.requirements) {
        await prisma.serviceCapabilityRequirement.create({
          data: {
            capabilityId: createdCap.id,
            fieldKey: req.fieldKey,
            label: req.label,
            required: req.required,
            source: req.source,
          },
        }).catch(() => {});
      }
    }
  }

  // 4.2 Ayushman Bharat Capabilities
  const ayushmanCaps = [
    {
      name: 'Scheme Benefits & Guidelines',
      slug: 'scheme-info',
      type: 'KNOWLEDGE' as const,
      description: 'Overview of ₹5 Lakh cashless hospitalization coverage, eligible treatments, and pre-existing disease terms.',
      requiresAuthentication: false,
      requiresConsent: false,
      requiresConfirmation: false,
      auditRequired: false,
    },
    {
      name: 'Beneficiary Eligibility Check',
      slug: 'check-eligibility',
      type: 'RETRIEVE' as const,
      description: 'Verify SECC household inclusion, ration card mapping, or state eligibility list.',
      requiresAuthentication: true,
      requiresConsent: true,
      requiresConfirmation: false,
      auditRequired: true,
      requirements: [
        { fieldKey: 'rationCardNumber', label: 'Ration Card Number', required: false, source: 'USER' },
        { fieldKey: 'state', label: 'Residential State', required: true, source: 'PROFILE' },
      ],
    },
    {
      name: 'Ayushman Card (Golden Card) Download',
      slug: 'ayushman-card',
      type: 'DOCUMENT' as const,
      description: 'Download verified PVC Ayushman Golden Card with PM-JAY ID for cashless hospital admission.',
      requiresAuthentication: true,
      requiresConsent: true,
      requiresConfirmation: false,
      auditRequired: true,
    },
    {
      name: 'Empaneled Hospital Search',
      slug: 'hospital-search',
      type: 'KNOWLEDGE' as const,
      description: 'Locate nearby government and private empaneled hospitals by specialty and district.',
      requiresAuthentication: false,
      requiresConsent: false,
      requiresConfirmation: false,
      auditRequired: false,
    },
    {
      name: 'Treatment & Pre-Auth Claim Status',
      slug: 'claim-status',
      type: 'STATUS' as const,
      description: 'Track pre-authorization status and hospital discharge claim settlements.',
      requiresAuthentication: true,
      requiresConsent: true,
      requiresConfirmation: false,
      auditRequired: true,
    },
  ];

  for (const cap of ayushmanCaps) {
    const createdCap = await prisma.serviceCapability.upsert({
      where: {
        serviceId_slug: {
          serviceId: ayushmanBharat.id,
          slug: cap.slug,
        },
      },
      update: {},
      create: {
        serviceId: ayushmanBharat.id,
        name: cap.name,
        slug: cap.slug,
        type: cap.type,
        description: cap.description,
        requiresAuthentication: cap.requiresAuthentication,
        requiresConsent: cap.requiresConsent,
        requiresConfirmation: cap.requiresConfirmation,
        auditRequired: cap.auditRequired,
        status: 'ACTIVE',
      },
    });

    if (cap.requirements) {
      for (const req of cap.requirements) {
        await prisma.serviceCapabilityRequirement.create({
          data: {
            capabilityId: createdCap.id,
            fieldKey: req.fieldKey,
            label: req.label,
            required: req.required,
            source: req.source,
          },
        }).catch(() => {});
      }
    }
  }

  // 4.3 PAN Capabilities
  await prisma.serviceCapability.upsert({
    where: {
      serviceId_slug: {
        serviceId: panService.id,
        slug: 'pan-allotment',
      },
    },
    update: {},
    create: {
      serviceId: panService.id,
      name: 'Apply for New PAN (Form 49A)',
      slug: 'pan-allotment',
      type: 'ACTION',
      description: 'Instant paperless PAN allotment for Indian citizens with digital e-Sign.',
      requiresAuthentication: true,
      requiresConsent: true,
      requiresConfirmation: true,
      auditRequired: true,
      status: 'ACTIVE',
    },
  });

  // 4.4 Driving License Capabilities
  await prisma.serviceCapability.upsert({
    where: {
      serviceId_slug: {
        serviceId: dlService.id,
        slug: 'learner-license',
      },
    },
    update: {},
    create: {
      serviceId: dlService.id,
      name: 'Learner License Application',
      slug: 'learner-license',
      type: 'ACTION',
      description: 'Online application and contactless computer test for Learner License.',
      requiresAuthentication: true,
      requiresConsent: true,
      requiresConfirmation: true,
      auditRequired: true,
      status: 'ACTIVE',
    },
  });

  // ==========================================
  // 5. Service Integrations (Mock Adapters)
  // ==========================================
  await prisma.serviceIntegration.create({
    data: {
      serviceId: jeeMain.id,
      integrationType: 'MOCK',
      baseReference: 'JEEAdapter',
      status: 'ACTIVE',
    },
  }).catch(() => {});

  await prisma.serviceIntegration.create({
    data: {
      serviceId: ayushmanBharat.id,
      integrationType: 'MOCK',
      baseReference: 'AyushmanAdapter',
      status: 'ACTIVE',
    },
  }).catch(() => {});

  console.log('Seeding completed successfully: 4 Departments, 4 Organizations, 4 Services, 13 Capabilities seeded.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
