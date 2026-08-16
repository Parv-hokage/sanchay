import { NextRequest, NextResponse } from 'next/server';

let currentProfile = {
  id: 'prof_parv_demo_001',
  userId: 'usr_parv_demo_001',
  fullName: 'Parv Mittal',
  dateOfBirth: '2006-08-15',
  gender: 'Male',
  category: 'OBC_NCL',
  preferredLanguage: 'en',
};

export async function GET() {
  return NextResponse.json({
    data: currentProfile,
    meta: {
      requestId: 'prof-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    currentProfile = {
      ...currentProfile,
      ...body,
    };

    return NextResponse.json({
      data: currentProfile,
      meta: {
        requestId: 'prof-update-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'BAD_REQUEST',
          message: (error as Error).message || 'Failed to update profile.',
        },
      },
      { status: 400 },
    );
  }
}
