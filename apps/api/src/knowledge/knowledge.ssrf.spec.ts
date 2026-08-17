import { describe, it, expect } from 'vitest';
import { validateSafeGovernmentUrl } from './ingestion';

describe('Knowledge Pipeline SSRF & Source Security Tests', () => {
  it('allows authentic official government URLs', () => {
    const validUrls = [
      'https://jeemain.nta.nic.in/information-bulletin',
      'https://nta.ac.in/notice',
      'https://pmjay.gov.in/guidelines/beneficiary',
      'https://nha.gov.in/schemes',
      'https://morth.gov.in/rules',
    ];

    for (const url of validUrls) {
      const result = validateSafeGovernmentUrl(url);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBeDefined();
    }
  });

  it('blocks loopback and localhost access attempts (SSRF)', () => {
    const loopbackUrls = [
      'http://localhost:8080/admin',
      'http://127.0.0.1:4000/api/v1/health',
      'http://127.0.0.1/etc/passwd',
      'https://localhost/secrets',
    ];

    for (const url of loopbackUrls) {
      const result = validateSafeGovernmentUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/loopback|local network/i);
    }
  });

  it('blocks cloud metadata endpoint access attempts (AWS / GCP / Azure)', () => {
    const metadataUrls = [
      'http://169.254.169.254/latest/meta-data/',
      'http://169.254.169.254/computeMetadata/v1/',
      'http://metadata.google.internal/computeMetadata/v1/',
    ];

    for (const url of metadataUrls) {
      const result = validateSafeGovernmentUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/metadata|private/i);
    }
  });

  it('blocks private internal network IP ranges (RFC 1918)', () => {
    const privateIpUrls = [
      'http://10.0.0.1/admin',
      'http://192.168.1.1/router',
      'http://172.16.0.5/internal',
      'http://172.31.255.255/db',
    ];

    for (const url of privateIpUrls) {
      const result = validateSafeGovernmentUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/private RFC1918/i);
    }
  });

  it('blocks unapproved external domains and suspicious sources', () => {
    const unapprovedUrls = [
      'https://malicious-attacker-site.com/exploit.html',
      'https://random-news-blog.org/nta-leak',
      'https://evilsite.gov.in.fake.com/phishing',
    ];

    for (const url of unapprovedUrls) {
      const result = validateSafeGovernmentUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/not on Sanchay's official government source allowlist/i);
    }
  });

  it('blocks non-HTTP protocols (file://, gopher://, ftp://)', () => {
    const badProtocolUrls = [
      'file:///etc/passwd',
      'gopher://127.0.0.1:70/',
      'ftp://government.nic.in/archive',
    ];

    for (const url of badProtocolUrls) {
      const result = validateSafeGovernmentUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/forbidden/i);
    }
  });
});
