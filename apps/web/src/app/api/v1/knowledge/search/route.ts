import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  return NextResponse.json({
    data: {
      query: q,
      total: 1,
      results: [
        {
          id: 'chunk-jee-001',
          content: 'Candidates who have passed Class 12 / equivalent examination in 2024, 2025, or appearing in 2026 are eligible to appear in JEE (Main) - 2026.',
          sourceTitle: 'JEE (Main) 2026 Information Bulletin',
          sourceUrl: 'https://jeemain.nta.nic.in/bulletin-2026.pdf',
          similarityScore: 0.94,
        },
      ],
    },
    meta: {
      requestId: 'knw-search-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
