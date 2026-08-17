import { NextResponse } from 'next/server';

const DOCUMENTS = [
  {
    id: 'doc-001',
    userId: 'usr_parv_demo_001',
    fileName: 'class_10_marksheet.pdf',
    fileSize: 524288,
    mimeType: 'application/pdf',
    documentType: 'ACADEMIC_MARKSHEET',
    verificationStatus: 'VERIFIED',
    virusScanStatus: 'CLEAN',
    createdAt: '2026-08-16T12:00:00Z',
  },
  {
    id: 'doc-002',
    userId: 'usr_parv_demo_001',
    fileName: 'obc_ncl_certificate.pdf',
    fileSize: 314572,
    mimeType: 'application/pdf',
    documentType: 'CATEGORY_CERTIFICATE',
    verificationStatus: 'VERIFIED',
    virusScanStatus: 'CLEAN',
    createdAt: '2026-08-16T12:00:00Z',
  },
];

export async function GET() {
  return NextResponse.json({
    data: DOCUMENTS,
    meta: {
      total: DOCUMENTS.length,
      requestId: 'doc-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    },
  });
}
