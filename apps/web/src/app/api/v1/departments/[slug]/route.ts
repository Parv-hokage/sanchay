import { NextRequest, NextResponse } from 'next/server';

const DEPARTMENTS: Record<string, any> = {
  education: {
    id: 'dept-edu-001',
    name: 'Department of Higher Education',
    slug: 'education',
    description: 'Unified admissions, competitive entrance examinations, and academic scholarships across India.',
    iconName: 'AcademicCapIcon',
    status: 'ACTIVE',
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
          },
        ],
      },
    ],
  },
  health: {
    id: 'dept-health-001',
    name: 'Department of Health & Family Welfare',
    slug: 'health',
    description: 'Universal health coverage, digital health records, hospital empanelment, and medical assistance programs.',
    iconName: 'HeartIcon',
    status: 'ACTIVE',
    organizations: [
      {
        id: 'org-nha-001',
        name: 'National Health Authority (NHA)',
        slug: 'national-health-authority',
        officialDomain: 'nha.gov.in',
        description: 'Apex body responsible for implementing Ayushman Bharat PM-JAY.',
        services: [
          {
            id: 'srv-ayush-001',
            name: 'Ayushman Bharat PM-JAY',
            slug: 'ayushman-bharat',
            description: 'World largest government-funded healthcare scheme providing health cover of Rs. 5 Lakh per family per year.',
            officialUrl: 'https://pmjay.gov.in',
            status: 'ACTIVE',
            version: '2.0',
          },
        ],
      },
    ],
  },
};

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  try {
    let slug = 'education';
    if (props && props.params) {
      const resolved = await props.params;
      if (resolved && resolved.slug) {
        slug = resolved.slug;
      }
    }
    if (!slug || slug === '[slug]') {
      const parts = new URL(req.url).pathname.split('/');
      slug = parts[parts.length - 1] || 'education';
    }

    const dept = DEPARTMENTS[slug] || DEPARTMENTS['education'];

    return NextResponse.json({
      data: dept,
      meta: {
        requestId: 'dept-detail-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        data: DEPARTMENTS['education'],
        error: { message: err?.message || 'Fallback to default department' },
      },
      { status: 200 },
    );
  }
}
