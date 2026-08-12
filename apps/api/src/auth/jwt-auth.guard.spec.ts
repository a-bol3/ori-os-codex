import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const originalEnvironment = process.env;

  beforeEach(() => {
    process.env = { ...originalEnvironment };
    delete process.env.ORI_AUTH_BYPASS;
    delete process.env.ORI_DEV_USER_ID;
    delete process.env.ORI_DEV_ORGANIZATION_ID;
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it('rejects missing authenticated users', () => {
    const guard = new JwtAuthGuard();

    expect(() => guard.handleRequest(undefined, false)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects bypass outside development', () => {
    process.env.NODE_ENV = 'production';
    process.env.ORI_AUTH_BYPASS = '1';
    const guard = new JwtAuthGuard();

    expect(() => guard.handleRequest(undefined, false)).toThrow(
      'ORI_AUTH_BYPASS must never be enabled outside development',
    );
  });

  it('rejects bypass when NODE_ENV is missing', () => {
    delete process.env.NODE_ENV;
    process.env.ORI_AUTH_BYPASS = '1';
    const guard = new JwtAuthGuard();

    expect(() => guard.handleRequest(undefined, false)).toThrow(
      'ORI_AUTH_BYPASS must never be enabled outside development',
    );
  });

  it('requires explicit development identity for bypass', () => {
    process.env.NODE_ENV = 'development';
    process.env.ORI_AUTH_BYPASS = '1';
    const guard = new JwtAuthGuard();

    expect(() => guard.handleRequest(undefined, false)).toThrow(
      'Development auth bypass requires ORI_DEV_USER_ID and ORI_DEV_ORGANIZATION_ID',
    );
  });

  it('uses an explicitly configured development identity', () => {
    process.env.NODE_ENV = 'development';
    process.env.ORI_AUTH_BYPASS = '1';
    process.env.ORI_DEV_USER_ID = 'developer-1';
    process.env.ORI_DEV_ORGANIZATION_ID = 'organization-1';
    const guard = new JwtAuthGuard();

    expect(guard.handleRequest(undefined, false)).toEqual({
      userId: 'developer-1',
      organizationId: 'organization-1',
      email: undefined,
    });
  });
});
