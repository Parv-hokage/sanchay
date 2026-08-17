import { NextResponse } from 'next/server';

const CONSENTS = [
  {
    id: 'cst-001',
    userId: 'usr_parv_demo_001',
    serviceId: 'srv-jee-001',
    scope: 'PROFILE_READ_ACADEMIC',
    grantedAt: '2026-08-16T12:00:00Z',
    status: 'ACTIVE',
  },
];

export async function GET() {
  return NextResponse.json({
    data: CONSENTS,
    meta: {
      total: CONSENTS.length,
      requestId: 'cst-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
