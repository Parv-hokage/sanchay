import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentService } from './document.service';
import { StorageService } from '../storage/storage.service';
import { DocumentType, DocumentStatus } from '../types';

describe('Document Security & IDOR Authorization Tests', () => {
  let documentService: DocumentService;
  let storageService: StorageService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      citizenDocument: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      documentAccessLog: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    mockAudit = {
      recordEvent: vi.fn().mockResolvedValue(null),
    };

    storageService = new StorageService();
    documentService = new DocumentService(
      mockPrisma as any,
      mockAudit as any,
      storageService,
    );
  });

  it('rejects User A attempting to view User B document (IDOR / BOLA)', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 private data for User B');
    const mockFile = {
      buffer: pdfBuffer,
      originalname: 'income_certificate.pdf',
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
    };

    const docOfUserB = await documentService.uploadDocument(
      'user-b-uuid',
      mockFile,
      { documentType: DocumentType.INCOME_CERTIFICATE, title: 'Private Income Certificate' },
      'req-upload-b',
    );

    // User A attempts to access User B's document
    await expect(
      documentService.getDocumentById('user-a-uuid', docOfUserB.id),
    ).rejects.toThrow(/Access Denied/);
  });

  it('rejects User A attempting to download User B document', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 User B passport');
    const mockFile = {
      buffer: pdfBuffer,
      originalname: 'passport.pdf',
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
    };

    const docOfUserB = await documentService.uploadDocument(
      'user-b-uuid',
      mockFile,
      { documentType: DocumentType.IDENTITY_PROOF, title: 'Passport' },
      'req-upload-b',
    );

    // Set verified status
    docOfUserB.status = DocumentStatus.VERIFIED;

    // User A attempts download
    await expect(
      documentService.downloadDocument('user-a-uuid', docOfUserB.id, 'CITIZEN_VIEW'),
    ).rejects.toThrow(/Access Denied/);
  });

  it('quarantines malicious upload containing test malware signature (EICAR)', async () => {
    // PDF wrapper containing EICAR test string
    const maliciousBuffer = Buffer.from(
      '%PDF-1.4\nX5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*\n%%EOF',
    );
    const mockFile = {
      buffer: maliciousBuffer,
      originalname: 'eicar_test.pdf',
      mimetype: 'application/pdf',
      size: maliciousBuffer.length,
    };

    const doc = await documentService.uploadDocument(
      'user-security-test',
      mockFile,
      { documentType: DocumentType.OTHER, title: 'Malware Test' },
      'req-malware-test',
    );

    // Wait 150ms for asynchronous worker scan
    await new Promise((r) => setTimeout(r, 150));

    const updatedDoc = await documentService.getDocumentById('user-security-test', doc.id);
    expect(updatedDoc.status).toBe(DocumentStatus.QUARANTINED);

    // Attempted download of quarantined document must be denied
    await expect(
      documentService.downloadDocument('user-security-test', doc.id, 'DOWNLOAD'),
    ).rejects.toThrow(/quarantined/);
  });

  it('sanitizes malicious path traversal in filenames into safe opaque key', () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 clean test');
    const maliciousFilename = '../../../../../../etc/passwd.pdf';

    const validation = storageService.validateFile(pdfBuffer, maliciousFilename, 'application/pdf');
    expect(validation.sanitizedFilename).toBe('passwd.pdf');

    const storageKey = storageService.generateStorageKey(
      'user-1',
      'doc-1',
      1,
      validation.sanitizedFilename,
    );
    expect(storageKey).toBe('documents/user-1/doc-1/v1.pdf');
    expect(storageKey.startsWith('documents/user-1/doc-1/')).toBe(true);
  });
});
