import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    data: { success: true, message: 'Logged out successfully.' },
    meta: {
      requestId: 'logout-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
