import { NextResponse } from 'next/server';

const DEPARTMENTS = [
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
  },
  {
    id: 'dept-health-001',
    name: 'Department of Health & Family Welfare',
    slug: 'health',
    description: 'Universal health coverage, digital health records, hospital empanelment, and medical assistance programs.',
    iconName: 'HeartIcon',
    status: 'ACTIVE',
    organizationCount: 1,
    serviceCount: 1,
    featuredServices: [{ id: 'srv-ayush-001', name: 'Ayushman Bharat PM-JAY', slug: 'ayushman-bharat' }],
  },
  {
    id: 'dept-revenue-001',
    name: 'Department of Revenue',
    slug: 'revenue',
    description: 'Direct taxation, PAN card services, tax refunds, and electronic tax filing services.',
    iconName: 'BuildingOfficeIcon',
    status: 'ACTIVE',
    organizationCount: 1,
    serviceCount: 1,
    featuredServices: [],
  },
  {
    id: 'dept-sje-001',
    name: 'Department of Social Justice and Empowerment',
    slug: 'social-justice',
    description: 'Welfare schemes, affirmative action certificates, senior citizen cards, and scholarship disbursement.',
    iconName: 'UsersIcon',
    status: 'ACTIVE',
    organizationCount: 1,
    serviceCount: 1,
    featuredServices: [],
  },
];

export async function GET() {
  return NextResponse.json({
    data: DEPARTMENTS,
    meta: {
      total: DEPARTMENTS.length,
      requestId: 'dept-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
