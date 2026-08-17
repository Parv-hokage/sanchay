import { NextRequest, NextResponse } from 'next/server';
import { UpdateProfileSchema } from '@sanchay/validation';
import { CitizenProfile, Gender, CitizenCategory } from '@sanchay/types';

let currentProfile: Partial<CitizenProfile> = {
  id: 'prof_parv_demo_001',
  userId: 'usr_parv_demo_001',
  fullName: 'Parv Mittal',
  dateOfBirth: '2006-08-15',
  gender: Gender.MALE,
  category: CitizenCategory.OBC_NCL,
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
    const validated = UpdateProfileSchema.parse(body);
    currentProfile = {
      ...currentProfile,
      ...validated,
    };

    return NextResponse.json({
      data: currentProfile,
      meta: {
        requestId: 'prof-update-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    const message = error?.errors
      ? error.errors.map((e: any) => `${e.path.join('.') || 'field'}: ${e.message}`).join('; ')
      : error.message || 'Failed to update profile.';
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid profile data: ${message}`,
        },
      },
      { status: 400 },
    );
  }
}
