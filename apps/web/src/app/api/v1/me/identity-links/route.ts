import { NextResponse } from 'next/server';

const IDENTITY_LINKS = [
  {
    id: 'link-001',
    userId: 'usr_parv_demo_001',
    provider: 'MOCK_IDP',
    externalSubjectReference: 'XXXX-XXXX-4001',
    isVerified: true,
    verifiedAt: '2026-08-16T12:00:00Z',
    createdAt: '2026-08-16T12:00:00Z',
  },
];

export async function GET() {
  return NextResponse.json({
    data: IDENTITY_LINKS,
    meta: {
      total: IDENTITY_LINKS.length,
      requestId: 'links-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
