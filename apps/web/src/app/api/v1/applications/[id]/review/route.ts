export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return Response.json({
    data: {
      applicationId: id,
      reviewStatus: 'VERIFIED',
      verifiedFieldsCount: 18,
      missingFieldsCount: 0,
      readOnlyFields: [
        { label: 'Full Legal Name', value: 'Parv Mittal' },
        { label: 'Date of Birth', value: '15 August 2006' },
        { label: 'Gender', value: 'Male' },
        { label: 'Category', value: 'OBC-NCL' },
        { label: 'Class 10 Board', value: 'CBSE (2023)' },
        { label: 'Class 12 Board', value: 'CBSE (2025)' },
      ],
    },
    meta: {
      requestId: 'app-review-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
