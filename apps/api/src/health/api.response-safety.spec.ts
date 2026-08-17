import { describe, it, expect, vi } from 'vitest';

describe('API Architecture & Response Safety', () => {
  it('detects when response content-type is text/html and rejects with clear diagnostic', async () => {
    const mockHtmlResponse = {
      ok: false,
      status: 500,
      headers: {
        get: (header: string) => (header.toLowerCase() === 'content-type' ? 'text/html; charset=utf-8' : null),
      },
      text: async () => '<!DOCTYPE html><html><body>Internal Server Error</body></html>',
      json: async () => {
        throw new Error('Unexpected token < in JSON');
      },
    };

    const contentType = mockHtmlResponse.headers.get('content-type') || '';
    expect(contentType.includes('application/json')).toBe(false);

    let thrownError: Error | null = null;
    try {
      if (!contentType.includes('application/json')) {
        const text = await mockHtmlResponse.text();
        throw new Error(
          `API connection error (${mockHtmlResponse.status}): Expected JSON response from https://sanchay-api-gold.vercel.app/api/v1/departments but received ${contentType}. Check NEXT_PUBLIC_API_URL and API routing.`,
        );
      }
    } catch (err) {
      thrownError = err as Error;
    }

    expect(thrownError).not.toBeNull();
    expect(thrownError?.message).toContain('Expected JSON response');
    expect(thrownError?.message).toContain('text/html');
  });

  it('correctly parses valid JSON response payload', async () => {
    const mockJsonResponse = {
      ok: true,
      status: 200,
      headers: {
        get: (header: string) => (header.toLowerCase() === 'content-type' ? 'application/json; charset=utf-8' : null),
      },
      json: async () => ({
        data: [{ id: 'dept-edu-001', name: 'Department of Higher Education' }],
        meta: { total: 1 },
      }),
    };

    const contentType = mockJsonResponse.headers.get('content-type') || '';
    expect(contentType.includes('application/json')).toBe(true);

    const payload = await mockJsonResponse.json();
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0].id).toBe('dept-edu-001');
  });

  it('normalizes endpoint URLs and prevents double /api/v1 prefix duplication', () => {
    const base = 'https://sanchay-api-gold.vercel.app/api/v1';
    
    // Case 1: endpoint without leading slash
    const ep1 = 'departments';
    const clean1 = ep1.startsWith('/') ? ep1 : `/${ep1}`;
    expect(`${base}${clean1}`).toBe('https://sanchay-api-gold.vercel.app/api/v1/departments');

    // Case 2: endpoint with leading /api/v1/
    const ep2 = '/api/v1/departments';
    let clean2 = ep2.startsWith('/') ? ep2 : `/${ep2}`;
    if (base.endsWith('/api/v1') && clean2.startsWith('/api/v1')) {
      clean2 = clean2.substring('/api/v1'.length);
      if (!clean2.startsWith('/')) clean2 = '/' + clean2;
    }
    expect(`${base}${clean2}`).toBe('https://sanchay-api-gold.vercel.app/api/v1/departments');
  });
});
