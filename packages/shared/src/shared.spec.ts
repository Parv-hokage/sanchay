import { describe, it, expect } from 'vitest';
import { PLATFORM_NAME, AppErrorCode } from './index';

describe('Shared Platform Constants and Errors', () => {
  it('should define platform identity and error codes', () => {
    expect(PLATFORM_NAME).toBe('SANCHAY');
    expect(AppErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(AppErrorCode.GOV_SERVICE_UNAVAILABLE).toBe('GOV_SERVICE_UNAVAILABLE');
  });
});
