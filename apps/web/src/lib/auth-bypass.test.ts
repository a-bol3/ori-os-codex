import { afterEach, describe, expect, it } from 'vitest';
import { isAuthBypassEnabled } from './auth-bypass';

describe('web auth bypass', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('fails closed when NODE_ENV is missing', () => {
    process.env = {
      ...originalEnv,
      ORI_AUTH_BYPASS: 'true',
    };

    expect(isAuthBypassEnabled()).toBe(false);
  });

  it('only enables the bypass with an explicit development environment', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      ORI_AUTH_BYPASS: 'true',
    };
    expect(isAuthBypassEnabled()).toBe(false);

    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
      ORI_AUTH_BYPASS: 'true',
    };
    expect(isAuthBypassEnabled()).toBe(true);
  });
});
