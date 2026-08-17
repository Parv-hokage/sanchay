import { NextResponse } from 'next/server';

const SERVICES = [
  {
    id: 'srv-jee-001',
    name: 'Joint Entrance Examination (Main)',
    slug: 'jee-main',
    description: 'National undergraduate engineering entrance exam for admission to NITs, IIITs, and eligibility for JEE (Advanced).',
    officialUrl: 'https://jeemain.nta.nic.in',
    status: 'ACTIVE',
    version: '2026.1',
    organizationName: 'National Testing Agency (NTA)',
    departmentName: 'Department of Higher Education',
  },
  {
    id: 'srv-ayush-001',
    name: 'Ayushman Bharat PM-JAY',
    slug: 'ayushman-bharat',
    description: 'Universal health protection scheme providing coverage of up to Rs. 5 Lakh per family per year.',
    officialUrl: 'https://pmjay.gov.in',
    status: 'ACTIVE',
    version: '2.0',
    organizationName: 'National Health Authority (NHA)',
    departmentName: 'Department of Health & Family Welfare',
  },
];

export async function GET() {
  return NextResponse.json({
    data: SERVICES,
    meta: {
      total: SERVICES.length,
      requestId: 'srv-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
