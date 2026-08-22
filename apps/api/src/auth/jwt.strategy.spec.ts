import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const prisma = {
    organizationMembership: {
      findUnique: jest.fn(),
    },
  } as never;
  const originalEnvironment = process.env;

  beforeEach(() => {
    (
      prisma as { organizationMembership: { findUnique: jest.Mock } }
    ).organizationMembership.findUnique.mockReset();
    process.env = {
      ...originalEnvironment,
      NODE_ENV: 'test',
    };
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it('accepts valid payloads', async () => {
    (
      prisma as { organizationMembership: { findUnique: jest.Mock } }
    ).organizationMembership.findUnique.mockResolvedValue({ role: 'ADMIN' });
    const strategy = new JwtStrategy(prisma);

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
      role: 'ADMIN',
    });
  });

  it('rejects a user who is not a member of the token organization', async () => {
    (
      prisma as { organizationMembership: { findUnique: jest.Mock } }
    ).organizationMembership.findUnique.mockResolvedValue(null);
    const strategy = new JwtStrategy(prisma);

    await expect(
      strategy.validate({
        sub: 'user-1',
        organizationId: 'org-other',
      }),
    ).rejects.toThrow('User is not a member of this organization');
  });

  it('rejects payloads without subject', async () => {
    const strategy = new JwtStrategy(prisma);

    await expect(
      strategy.validate({
        organizationId: 'org-1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects payloads without organization context', async () => {
    const strategy = new JwtStrategy(prisma);

    await expect(
      strategy.validate({
        sub: 'user-1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
