import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface StorageValidationResult {
  isValid: boolean;
  detectedMime: string;
  sanitizedFilename: string;
  contentHash: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly vaultRoot: string;

  constructor() {
    // Isolated secure directory outside web/public roots
    this.vaultRoot = path.resolve(process.cwd(), '.sanchay-vault');
    if (!fs.existsSync(this.vaultRoot)) {
      try {
        fs.mkdirSync(this.vaultRoot, { recursive: true });
      } catch (err) {
        this.logger.warn(`Could not initialize vault directory: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Generates a safe, opaque, non-traversable storage key per ADR-009 & 11_SECURITY.md
   * Example: documents/user-123/doc-456/v1.pdf
   */
  generateStorageKey(userId: string, documentId: string, version: number, originalName: string): string {
    const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeDocId = documentId.replace(/[^a-zA-Z0-9_-]/g, '');
    return `documents/${safeUserId}/${safeDocId}/v${version}.${ext}`;
  }

  /**
   * Validates file signature (magic bytes), MIME type, and size to defeat extension/MIME spoofing
   */
  validateFile(buffer: Buffer, originalName: string, claimedMime: string, maxSize = 5 * 1024 * 1024): StorageValidationResult {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty.');
    }

    if (buffer.length > maxSize) {
      throw new BadRequestException(`File exceeds maximum permitted size of ${maxSize / (1024 * 1024)}MB.`);
    }

    // Inspect Magic Bytes header
    let detectedMime = '';
    const header = buffer.subarray(0, 8);

    if (header.subarray(0, 4).toString('ascii') === '%PDF') {
      detectedMime = 'application/pdf';
    } else if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      detectedMime = 'image/jpeg';
    } else if (
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47
    ) {
      detectedMime = 'image/png';
    } else if (
      header.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      detectedMime = 'image/webp';
    }

    if (!detectedMime) {
      throw new BadRequestException(
        'Invalid or unsupported file signature. Only authentic PDF, JPEG, PNG, and WebP files are permitted.',
      );
    }

    // Sanitize display filename (prevent path traversal / script tags)
    const sanitizedFilename = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      isValid: true,
      detectedMime,
      sanitizedFilename,
      contentHash,
    };
  }

  /**
   * Persists binary buffer into private object vault
   */
  async saveFile(storageKey: string, buffer: Buffer): Promise<string> {
    const fullPath = path.resolve(this.vaultRoot, storageKey);

    // Prevent path traversal attack
    if (!fullPath.startsWith(this.vaultRoot)) {
      throw new BadRequestException('Security Violation: Storage path traversal detected.');
    }

    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, buffer);
    this.logger.log(`[Storage] Securely persisted ${buffer.length} bytes to ${storageKey}`);
    return storageKey;
  }

  /**
   * Retrieves binary buffer from private object vault
   */
  async getFile(storageKey: string): Promise<Buffer | null> {
    const fullPath = path.resolve(this.vaultRoot, storageKey);

    if (!fullPath.startsWith(this.vaultRoot)) {
      throw new BadRequestException('Security Violation: Storage path traversal detected.');
    }

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    return fs.readFileSync(fullPath);
  }

  /**
   * Deletes binary object from vault
   */
  async deleteFile(storageKey: string): Promise<boolean> {
    const fullPath = path.resolve(this.vaultRoot, storageKey);
    if (!fullPath.startsWith(this.vaultRoot)) {
      return false;
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }
}
