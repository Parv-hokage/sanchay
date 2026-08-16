import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: {
      authenticated: true,
      user: {
        id: 'usr_parv_demo_001',
        sanchayUid: '00000000-0000-4000-8000-000000000001',
        status: 'ACTIVE',
      },
    },
    meta: {
      requestId: 'session-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
