import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentService } from './document.service';
import { StorageService } from '../storage/storage.service';
import { DocumentType, DocumentStatus } from '@sanchay/types';

describe('DocumentService Unit Tests', () => {
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

  it('validates authentic PDF buffer and generates safe storage key', () => {
    // Standard PDF header '%PDF-1.4'
    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
    const result = storageService.validateFile(pdfBuffer, 'my_aadhaar_card.pdf', 'application/pdf');

    expect(result.isValid).toBe(true);
    expect(result.detectedMime).toBe('application/pdf');
    expect(result.contentHash).toBeDefined();

    const key = storageService.generateStorageKey('user-1', 'doc-1', 1, result.sanitizedFilename);
    expect(key).toBe('documents/user-1/doc-1/v1.pdf');
    expect(key).not.toContain('..');
  });

  it('rejects fake executable file masquerading as a PDF (MIME spoofing)', () => {
    // Executable ELF/PE header disguised as PDF
    const fakeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
    expect(() => {
      storageService.validateFile(fakeBuffer, 'malware.pdf', 'application/pdf');
    }).toThrow(/Invalid or unsupported file signature/);
  });

  it('creates document record in PENDING_SCAN state upon upload', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 sample content');
    const mockFile = {
      buffer: pdfBuffer,
      originalname: 'class12_marksheet.pdf',
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
    };

    const doc = await documentService.uploadDocument(
      'user-100',
      mockFile,
      { documentType: DocumentType.EDUCATION_CERTIFICATE, title: 'Class 12 Certificate' },
      'req-upload-1',
    );

    expect(doc).toBeDefined();
    expect(doc.userId).toBe('user-100');
    expect(doc.status).toBe(DocumentStatus.PENDING_SCAN);
    expect(doc.title).toBe('Class 12 Certificate');
    expect(mockAudit.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DOCUMENT_UPLOADED',
        actorId: 'user-100',
        resourceType: 'DOCUMENT',
      }),
    );
  });

  it('rejects download attempt if document is in PENDING_SCAN state', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 test');
    const mockFile = {
      buffer: pdfBuffer,
      originalname: 'cert.pdf',
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
    };

    const doc = await documentService.uploadDocument(
      'user-200',
      mockFile,
      { documentType: DocumentType.OTHER, title: 'Unscanned Doc' },
      'req-1',
    );

    // Force PENDING_SCAN state to verify consequential safeguard
    doc.status = DocumentStatus.PENDING_SCAN;

    await expect(
      documentService.downloadDocument('user-200', doc.id, 'CITIZEN_VIEW'),
    ).rejects.toThrow(/undergoing security scan/);
  });
});
