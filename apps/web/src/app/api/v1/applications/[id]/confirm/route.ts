export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const referenceCode = `SANDBOX-JEE-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  return Response.json({
    data: {
      applicationId: id,
      referenceCode,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      message: 'JEE Main sandbox application successfully submitted.',
    },
    meta: {
      requestId: 'app-confirm-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
