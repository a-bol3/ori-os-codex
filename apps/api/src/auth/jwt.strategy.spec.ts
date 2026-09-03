import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const prisma = {
    session: {
      findUnique: jest.fn(),
    },
    organizationMembership: {
      findUnique: jest.fn(),
    },
  } as never;
  const originalEnvironment = process.env;

  beforeEach(() => {
    (
      prisma as { organizationMembership: { findUnique: jest.Mock } }
    ).organizationMembership.findUnique.mockReset();
    (prisma as { session: { findUnique: jest.Mock } }).session.findUnique.mockReset();
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
    (prisma as { session: { findUnique: jest.Mock } }).session.findUnique.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    const strategy = new JwtStrategy(prisma);

    await expect(
      strategy.validate({
        sub: 'user-1',
        email: 'user@example.com',
        organizationId: 'org-1',
        sid: 'session-1',
      }),
    ).resolves.toEqual({
      userId: 'user-1',
      sessionId: 'session-1',
      email: 'user@example.com',
      organizationId: 'org-1',
      role: 'ADMIN',
    });
  });

  it('rejects a user who is not a member of the token organization', async () => {
    (
      prisma as { organizationMembership: { findUnique: jest.Mock } }
    ).organizationMembership.findUnique.mockResolvedValue(null);
    (prisma as { session: { findUnique: jest.Mock } }).session.findUnique.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-other',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    const strategy = new JwtStrategy(prisma);

    await expect(
      strategy.validate({
        sub: 'user-1',
        organizationId: 'org-other',
        sid: 'session-1',
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

  it('rejects payloads without session context', async () => {
    const strategy = new JwtStrategy(prisma);

    await expect(
      strategy.validate({
        sub: 'user-1',
        organizationId: 'org-1',
      }),
    ).rejects.toThrow('JWT payload is missing session context');
  });

  it('rejects revoked sessions', async () => {
    (prisma as { session: { findUnique: jest.Mock } }).session.findUnique.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    });
    const strategy = new JwtStrategy(prisma);

    await expect(
      strategy.validate({
        sub: 'user-1',
        organizationId: 'org-1',
        sid: 'session-1',
      }),
    ).rejects.toThrow('Session is invalid or expired');
  });
});
