import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, identifier } = body || {};

    if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Identifier (phone number, email, or mock ID) is required.',
          },
        },
        { status: 400 },
      );
    }

    const challengeId = uuidv4();
    const expiresInSeconds = 300;

    return NextResponse.json({
      data: {
        sessionChallengeId: challengeId,
        provider: provider || 'MOCK_CITIZEN_ID',
        message: 'Authentication challenge initiated. Enter OTP (Use 123456 in demo mode).',
        expiresInSeconds,
      },
      meta: {
        requestId: 'auth-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: (error as Error).message || 'Failed to process login request.',
        },
      },
      { status: 500 },
    );
  }
}
