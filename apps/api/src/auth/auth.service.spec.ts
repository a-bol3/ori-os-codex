import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OrganizationRole } from '@prisma/client';
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
    prisma.session.create.mockResolvedValue({ id: 'session-1' });

    await expect(service.login(user)).resolves.toEqual({
      access_token: 'signed-token',
      refresh_token: expect.stringMatching(/^session-1\./),
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
    });
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
});
