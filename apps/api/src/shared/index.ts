/**
 * Standard API Envelopes and Response Types (API Internal)
 * Defined in 09_API.md
 */

export interface ApiMeta {
  requestId: string;
  timestamp?: string;
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
  requestId: string;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export enum AppErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  GOV_SERVICE_UNAVAILABLE = 'GOV_SERVICE_UNAVAILABLE',
  CAPABILITY_UNSUPPORTED = 'CAPABILITY_UNSUPPORTED',
  CONSENT_REQUIRED = 'CONSENT_REQUIRED',
  CONFIRMATION_REQUIRED = 'CONFIRMATION_REQUIRED',
}

export const PLATFORM_NAME = 'SANCHAY';
export const PLATFORM_TAGLINE = 'Unified Government Digital Service Platform';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
