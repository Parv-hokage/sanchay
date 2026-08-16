import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'SANCHAY API',
      version: '0.1.0',
      environment: 'production',
      database: 'DISCONNECTED',
      uptimeSeconds: process.uptime(),
    },
    meta: {
      requestId: 'health-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
