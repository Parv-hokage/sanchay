import { ApiResponse } from '@sanchay/shared';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:4000/api/v1');

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sanchay_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': 'web-' + Math.random().toString(36).substring(2, 9),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    const errorMsg = json?.error?.message || json?.message || 'API request failed';
    throw new Error(errorMsg);
  }

  return json as ApiResponse<T>;
}
