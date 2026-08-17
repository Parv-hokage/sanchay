/**
 * SANCHAY SSRF & Source Allowlist Defense (API Internal)
 * Implements strict domain allowlisting, private IP blocking, link-local blocking, and cloud metadata defense per 11_SECURITY.md
 */

// Approved Government Top-Level & Subdomain Allowlists per ADR-017
const ALLOWED_DOMAIN_PATTERNS = [
  /\.gov\.in$/i,
  /\.nic\.in$/i,
  /\.ac\.in$/i,
  /^jeemain\.nta\.nic\.in$/i,
  /^nta\.ac\.in$/i,
  /^nha\.gov\.in$/i,
  /^pmjay\.gov\.in$/i,
  /^abdm\.gov\.in$/i,
  /^cbdt\.gov\.in$/i,
  /^morth\.gov\.in$/i,
];

// Blocked private / internal / link-local / cloud metadata ranges
const BLOCKED_IPS_AND_HOSTS = [
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  '169.254.169.254', // AWS / GCP / Azure metadata endpoint
  'metadata.google.internal',
];

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  hostname?: string;
  error?: string;
}

export function validateSafeGovernmentUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL is required.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { isValid: false, error: 'Malformed URL format.' };
  }

  // 1. Enforce HTTPS / HTTP protocol only (no file://, gopher://, ftp://)
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      isValid: false,
      error: `Security Violation: Protocol "${parsed.protocol}" is forbidden. Only HTTP/HTTPS permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Block Localhost, Cloud Metadata, and Loopback
  if (BLOCKED_IPS_AND_HOSTS.some((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`))) {
    return {
      isValid: false,
      error: `Security Violation: Access to loopback, local network, or cloud metadata (${hostname}) is blocked.`,
    };
  }

  // 3. Block Private IPv4 Addresses (10.x, 192.168.x, 172.16-31.x, 169.254.x)
  if (/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
    return {
      isValid: false,
      error: `Security Violation: Target IP (${hostname}) belongs to a private RFC1918 / Link-Local network range.`,
    };
  }

  // 4. Verify against official government domain allowlist
  const isAllowedDomain = ALLOWED_DOMAIN_PATTERNS.some((pattern) => pattern.test(hostname));
  if (!isAllowedDomain) {
    return {
      isValid: false,
      error: `Security Violation: Domain "${hostname}" is not on Sanchay's official government source allowlist.`,
    };
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
    hostname,
  };
}
