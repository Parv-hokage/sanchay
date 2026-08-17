import { NextRequest, NextResponse } from 'next/server';

const ADDRESSES = [
  {
    id: 'addr-001',
    userId: 'usr_parv_demo_001',
    addressType: 'PERMANENT',
    addressLine1: 'House 42, Civil Lines',
    addressLine2: 'Near Gandhi Chowk',
    city: 'Jaipur',
    state: 'Rajasthan',
    postalCode: '302001',
    country: 'India',
    isVerified: true,
  },
];

export async function GET() {
  return NextResponse.json({
    data: ADDRESSES,
    meta: {
      total: ADDRESSES.length,
      requestId: 'addr-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newAddr = {
    id: 'addr-' + Math.random().toString(36).substring(2, 9),
    userId: 'usr_parv_demo_001',
    ...body,
    isVerified: false,
  };
  return NextResponse.json({
    data: newAddr,
    meta: {
      requestId: 'addr-create-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
