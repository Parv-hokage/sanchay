import { NextResponse } from 'next/server';

const KNOWLEDGE_SOURCES = [
  {
    id: 'src-jee-bulletin-2026',
    title: 'JEE (Main) 2026 Official Information Bulletin',
    sourceUrl: 'https://jeemain.nta.nic.in/bulletin-2026.pdf',
    authorityLevel: 'TIER_1_OFFICIAL_GOV',
    publishedAt: '2026-08-16T12:00:00Z',
    documentType: 'PDF_GUIDELINE',
    chunkCount: 142,
    serviceSlug: 'jee-main',
  },
  {
    id: 'src-jee-syllabus-2026',
    title: 'JEE (Main) 2026 Official Syllabus Breakdown',
    sourceUrl: 'https://jeemain.nta.nic.in/syllabus-2026.pdf',
    authorityLevel: 'TIER_1_OFFICIAL_GOV',
    publishedAt: '2026-08-16T12:00:00Z',
    documentType: 'SYLLABUS',
    chunkCount: 88,
    serviceSlug: 'jee-main',
  },
];

export async function GET() {
  return NextResponse.json({
    data: KNOWLEDGE_SOURCES,
    meta: {
      total: KNOWLEDGE_SOURCES.length,
      requestId: 'knw-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
