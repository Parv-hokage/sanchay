import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionChallengeId, otp } = body || {};
    const otpCode = otp || body?.verificationCode || body?.code;

    if (!sessionChallengeId) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Session challenge ID is required.',
          },
        },
        { status: 400 },
      );
    }

    if (otpCode !== '123456') {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid verification OTP code. Use 123456 for demo verification.',
          },
        },
        { status: 401 },
      );
    }

    const token = 'sanchay_demo_token_' + Math.random().toString(36).substring(2, 12);
    const user = {
      id: 'usr_parv_demo_001',
      sanchayUid: '00000000-0000-4000-8000-000000000001',
      status: 'ACTIVE',
    };

    const profile = {
      id: 'prof_parv_demo_001',
      userId: 'usr_parv_demo_001',
      fullName: 'Parv Mittal',
      dateOfBirth: '2006-08-15',
      gender: 'MALE',
      category: 'OBC_NCL',
      preferredLanguage: 'en',
    };

    return NextResponse.json({
      data: {
        token,
        user,
        profile,
        expiresInSeconds: 86400,
      },
      meta: {
        requestId: 'verify-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: (error as Error).message || 'Failed to verify authentication.',
        },
      },
      { status: 500 },
    );
  }
}
