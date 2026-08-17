import { NextResponse } from 'next/server';

const RECOMMENDATIONS = [
  {
    id: 'srv-jee-001',
    name: 'Joint Entrance Examination (Main) 2026',
    slug: 'jee-main',
    description: 'Undergraduate engineering admissions across NITs, IIITs, CFTIs, and state institutions.',
    category: 'Education & Admissions',
    badge: 'Popular',
    iconName: 'AcademicCapIcon',
    departmentName: 'Department of Higher Education',
    organizationName: 'National Testing Agency',
  },
  {
    id: 'srv-ayush-001',
    name: 'Ayushman Bharat PM-JAY',
    slug: 'ayushman-bharat',
    description: 'Secondary and tertiary hospitalization cover of Rs. 5 Lakh per family per year.',
    category: 'Healthcare & Insurance',
    badge: 'Essential',
    iconName: 'HeartIcon',
    departmentName: 'Department of Health & Family Welfare',
    organizationName: 'National Health Authority',
  },
];

export async function GET() {
  return NextResponse.json({
    data: RECOMMENDATIONS,
    meta: {
      total: RECOMMENDATIONS.length,
      requestId: 'rec-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
