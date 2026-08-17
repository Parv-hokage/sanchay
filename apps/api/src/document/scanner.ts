/**
 * SANCHAY Document Processing & Malware Scanner (API Internal)
 * Responsible for file integrity verification, development malware scanning, and scan status updates.
 */

export interface ScanResult {
  documentId: string;
  isClean: boolean;
  threatDetails?: string;
  scannedAt: Date;
  engine: string;
}

// Standard EICAR Antivirus Test Signature for deterministic sandbox testing
const EICAR_TEST_SIGNATURE = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

/**
 * Deterministic Development Malware Scanner
 * Clearly marked as DEVELOPMENT / MOCK per phase/PHASE_04_DOCUMENT_PLATFORM.md Section 14
 */
export async function scanDocumentBuffer(documentId: string, buffer: Buffer): Promise<ScanResult> {
  const content = buffer.toString('utf-8');

  // Check for EICAR test string
  if (content.includes(EICAR_TEST_SIGNATURE) || content.includes('MALWARE_PAYLOAD_TEST')) {
    return {
      documentId,
      isClean: false,
      threatDetails: 'EICAR-Standard-AV-Test-Signature (Development Mock Detection)',
      scannedAt: new Date(),
      engine: 'Sanchay-DevMock-ClamAV-Scanner/1.0',
    };
  }

  // Simulate scanning duration (100ms)
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    documentId,
    isClean: true,
    scannedAt: new Date(),
    engine: 'Sanchay-DevMock-ClamAV-Scanner/1.0',
  };
}

export async function processCitizenDocumentJob(documentId: string, buffer?: Buffer): Promise<ScanResult> {
  if (!buffer) {
    return {
      documentId,
      isClean: true,
      scannedAt: new Date(),
      engine: 'Sanchay-DevMock-ClamAV-Scanner/1.0',
    };
  }
  return scanDocumentBuffer(documentId, buffer);
}
