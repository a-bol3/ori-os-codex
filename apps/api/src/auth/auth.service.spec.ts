import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OrganizationRole } from '@prisma/client';
import { createHash } from 'node:crypto';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const compareMock = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
  const jwtService = {
    sign: jest.fn(() => 'signed-token'),
  };
  type PrismaUserFindUnique = {
    findUnique: jest.Mock;
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
    } satisfies PrismaUserFindUnique,
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const service = new AuthService(
    prisma as unknown as any,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when credentials are invalid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      memberships: [{ organizationId: 'org-1', role: OrganizationRole.OWNER }],
    });
    compareMock.mockResolvedValue(false as never);

    await expect(
      service.validateUser('user@example.com', 'bad-password'),
    ).resolves.toBeNull();
  });

  it('returns null when the user has no memberships', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      memberships: [],
    });
    compareMock.mockResolvedValue(true as never);

    await expect(
      service.validateUser('user@example.com', 'password'),
    ).resolves.toBeNull();
  });

  it('signs a token for the first membership when none is requested', async () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      memberships: [
        { organizationId: 'org-1', role: OrganizationRole.ADMIN },
        { organizationId: 'org-2', role: OrganizationRole.VIEWER },
      ],
    };
    prisma.session.create.mockImplementation(async ({ data }) => ({ id: data.id }));

    const result = await service.login(user);

    expect(result).toEqual({
      access_token: 'signed-token',
      refresh_token: expect.stringMatching(/^[0-9a-f-]{36}\.[0-9a-f]{64}$/),
      organizationId: 'org-1',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: undefined,
        avatarUrl: undefined,
      },
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      email: 'user@example.com',
      sub: 'user-1',
      organizationId: 'org-1',
      sid: result.refresh_token.split('.')[0],
    });

    const createdSession = prisma.session.create.mock.calls[0][0].data;
    expect(createdSession.id).toBe(
      result.refresh_token.split('.')[0],
    );
    expect(createdSession.refreshToken).toBe(
      createHash('sha256')
        .update(result.refresh_token)
        .digest('hex'),
    );
  });

  it('rejects organization switching outside memberships', async () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      memberships: [{ organizationId: 'org-1', role: OrganizationRole.ADMIN }],
    };

    await expect(service.login(user, 'org-999')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('reissues an access token bound to the refresh session', async () => {
    const session = {
      id: 'session-1',
      userId: 'user-1',
      organizationId: 'org-1',
      refreshToken: createHash('sha256').update('session-1.secret').digest('hex'),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: { email: 'user@example.com' },
    };
    prisma.session.findUnique.mockResolvedValue(session);

    await service.refresh('session-1.secret');

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'user@example.com',
      organizationId: 'org-1',
      sid: 'session-1',
    });
    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { refreshToken: expect.any(String) },
    });
  });

  it('rejects refresh after the session has been revoked', async () => {
    prisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      organizationId: 'org-1',
      refreshToken: createHash('sha256').update('session-1.secret').digest('hex'),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
      user: { email: 'user@example.com' },
    });

    await expect(service.refresh('session-1.secret')).rejects.toThrow(
      'Session has been revoked',
    );
  });

  it('revokes only the authenticated session and organization', async () => {
    prisma.session.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      service.revokeSession('session-1', 'user-1', 'org-1'),
    ).resolves.toEqual({ success: true });

    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'session-1',
        userId: 'user-1',
        organizationId: 'org-1',
        revokedAt: null,
      },
      data: { revokedAt: expect.any(Date), refreshToken: null },
    });
  });
});
