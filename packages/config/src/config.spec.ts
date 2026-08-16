import { describe, it, expect } from 'vitest';
import { loadConfig } from './index';

describe('Environment Configuration Loader', () => {
  it('should load default configuration when env is valid', () => {
    const config = loadConfig({
      NODE_ENV: 'test',
      PORT: '4000',
      DATABASE_URL: 'postgresql://localhost:5432/sanchay_test',
    });

    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(4000);
    expect(config.DATABASE_URL).toBe('postgresql://localhost:5432/sanchay_test');
  });

  it('should fail validation when invalid node env is provided', () => {
    expect(() =>
      loadConfig({
        NODE_ENV: 'invalid_env',
      }),
    ).toThrow('[SANCHAY CONFIG ERROR]');
  });
});
