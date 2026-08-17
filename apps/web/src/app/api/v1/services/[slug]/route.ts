import { NextRequest, NextResponse } from 'next/server';

const SERVICES: Record<string, any> = {
  'jee-main': {
    id: 'srv-jee-001',
    name: 'Joint Entrance Examination (Main) 2026',
    slug: 'jee-main',
    description: 'National undergraduate engineering entrance exam for admission to NITs, IIITs, and eligibility for JEE (Advanced).',
    officialUrl: 'https://jeemain.nta.nic.in',
    status: 'ACTIVE',
    version: '2026.1',
    organizationName: 'National Testing Agency (NTA)',
    departmentName: 'Department of Higher Education',
    capabilities: [
      { id: 'cap-jee-1', name: 'Exam Information & Schedule', slug: 'exam-info', type: 'KNOWLEDGE', description: 'View examination dates, shifts, pattern of examination, syllabus, and test center cities.' },
      { id: 'cap-jee-2', name: 'Eligibility Verification', slug: 'check-eligibility', type: 'RETRIEVE', description: 'Verify qualifying examination percentage, age criteria, and subject combinations for B.E. / B.Tech / B.Arch.' },
      { id: 'cap-jee-3', name: 'Online Application & Registration', slug: 'registration', type: 'ACTION', description: 'Prepare, auto-fill, and submit official examination application form.' },
      { id: 'cap-jee-4', name: 'Application Status Tracker', slug: 'application-status', type: 'STATUS', description: 'Check real-time application verification, payment confirmation, and scrutiny status.' },
      { id: 'cap-jee-5', name: 'Admit Card Download', slug: 'admit-card', type: 'DOCUMENT', description: 'Retrieve verified digital hall ticket with examination center allotment and QR code.' },
      { id: 'cap-jee-6', name: 'Scorecard & Results', slug: 'results', type: 'DOCUMENT', description: 'View official NTA percentile score, All India Rank (AIR), and qualification cutoff.' },
    ],
  },
  'ayushman-bharat': {
    id: 'srv-ayush-001',
    name: 'Ayushman Bharat PM-JAY',
    slug: 'ayushman-bharat',
    description: 'Universal health protection scheme providing coverage of up to Rs. 5 Lakh per family per year.',
    officialUrl: 'https://pmjay.gov.in',
    status: 'ACTIVE',
    version: '2.0',
    organizationName: 'National Health Authority (NHA)',
    departmentName: 'Department of Health & Family Welfare',
    capabilities: [
      { id: 'cap-ayush-1', name: 'Eligibility Check', slug: 'check-eligibility', type: 'RETRIEVE', description: 'Verify SECC and Ration card entitlement.' },
      { id: 'cap-ayush-2', name: 'Ayushman Card Generation', slug: 'card-generation', type: 'ACTION', description: 'Generate digital Ayushman PVC card.' },
      { id: 'cap-ayush-3', name: 'Empaneled Hospital Search', slug: 'hospitals', type: 'KNOWLEDGE', description: 'Search public and private hospitals offering cashless treatments.' },
    ],
  },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const srv = SERVICES[slug] || SERVICES['jee-main'];

  return Response.json({
    data: srv,
    meta: {
      requestId: 'srv-detail-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
