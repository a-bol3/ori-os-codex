import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const originalEnvironment = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnvironment,
      NODE_ENV: 'test',
    };
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it('accepts valid payloads', async () => {
    const strategy = new JwtStrategy();

    await expect(
      strategy.validate({
        sub: 'user-1',
        email: 'user@example.com',
        organizationId: 'org-1',
      }),
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'user@example.com',
      organizationId: 'org-1',
    });
  });

  it('rejects payloads without subject', async () => {
    const strategy = new JwtStrategy();

    await expect(
      strategy.validate({
        organizationId: 'org-1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects payloads without organization context', async () => {
    const strategy = new JwtStrategy();

    await expect(
      strategy.validate({
        sub: 'user-1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
