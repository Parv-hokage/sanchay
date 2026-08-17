import { NextRequest, NextResponse } from 'next/server';

let APPLICATIONS = [
  {
    id: 'app-jee-001',
    userId: 'usr_parv_demo_001',
    serviceId: 'srv-jee-001',
    serviceName: 'Joint Entrance Examination (Main) 2026',
    status: 'DRAFT',
    createdAt: '2026-08-16T12:00:00Z',
    updatedAt: '2026-08-16T12:00:00Z',
    data: {
      appliedSession: 'Session 1 (January 2026)',
      paper: 'Paper 1 (B.E. / B.Tech)',
      examMedium: 'English',
    },
  },
];

export async function GET() {
  return NextResponse.json({
    data: APPLICATIONS,
    meta: {
      total: APPLICATIONS.length,
      requestId: 'apps-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newApp = {
    id: 'app-jee-' + Math.random().toString(36).substring(2, 9),
    userId: 'usr_parv_demo_001',
    serviceId: body.serviceId || 'srv-jee-001',
    serviceName: 'Joint Entrance Examination (Main) 2026',
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: body.data || {},
  };
  APPLICATIONS.push(newApp);

  return NextResponse.json({
    data: newApp,
    meta: {
      requestId: 'app-create-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
