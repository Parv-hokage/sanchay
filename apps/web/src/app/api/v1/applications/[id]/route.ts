import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  return NextResponse.json({
    data: {
      id,
      userId: 'usr_parv_demo_001',
      serviceId: 'srv-jee-001',
      serviceName: 'Joint Entrance Examination (Main) 2026',
      status: 'READY_FOR_REVIEW',
      createdAt: '2026-08-16T12:00:00Z',
      updatedAt: '2026-08-16T12:00:00Z',
      fields: [
        { key: 'fullName', label: 'Candidate Full Name', value: 'Parv Mittal', readOnly: true, source: 'PROFILE' },
        { key: 'dateOfBirth', label: 'Date of Birth', value: '2006-08-15', readOnly: true, source: 'PROFILE' },
        { key: 'gender', label: 'Gender', value: 'Male', readOnly: true, source: 'PROFILE' },
        { key: 'category', label: 'Category', value: 'OBC_NCL', readOnly: true, source: 'PROFILE' },
        { key: 'passingYear', label: 'Class 12 Passing Year', value: '2025', readOnly: true, source: 'PROFILE' },
        { key: 'appliedSession', label: 'Examination Session', value: 'Session 1 (January 2026)', readOnly: false, source: 'USER' },
        { key: 'paper', label: 'Applying For', value: 'Paper 1 (B.E. / B.Tech)', readOnly: false, source: 'USER' },
      ],
    },
    meta: {
      requestId: 'app-detail-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
