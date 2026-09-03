import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@ori-os/db/nestjs';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

type OrganizationRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

type UserMembership = {
  organizationId: string;
  role: OrganizationRole;
};

export interface AuthenticatedLoginUser {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  memberships: UserMembership[];
}

type UserRecordWithPassword = AuthenticatedLoginUser & {
  passwordHash: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<AuthenticatedLoginUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
        include: {
          memberships: {
            select: {
              organizationId: true,
              role: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
    });

    if (user && user.passwordHash) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch && user.memberships.length > 0) {
        return this.toAuthenticatedLoginUser(user);
      }
    }
    return null;
  }

  async login(
    user: AuthenticatedLoginUser,
    requestedOrganizationId?: string,
  ) {
    const membership = this.resolveMembership(user, requestedOrganizationId);

    // The database id must be the same id returned in the refresh token.  The
    // previous implementation persisted a hash of one token and returned a
    // second token prefixed with Prisma's generated id, so every refresh was
    // rejected even when the client held the newly-issued credential.
    const sessionId = randomUUID();
    const refreshToken = `${sessionId}.${randomBytes(32).toString('hex')}`;
    const session = await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        organizationId: membership.organizationId,
        refreshToken: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      access_token: this.jwtService.sign({
        email: user.email,
        sub: user.id,
        organizationId: membership.organizationId,
        sid: session.id,
      }),
      refresh_token: refreshToken,
      organizationId: membership.organizationId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refresh(refreshToken: string) {
    const [sessionId, secret] = refreshToken.split('.');
    if (!sessionId || !secret) throw new UnauthorizedException('Invalid refresh token');
    const session = await this.prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } });
    if (!session?.refreshToken || session.expiresAt < new Date() || session.refreshToken !== this.hashRefreshToken(refreshToken)) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (session.revokedAt) {
      throw new UnauthorizedException('Session has been revoked');
    }
    const accessToken = this.jwtService.sign({
      sub: session.userId,
      email: session.user.email,
      organizationId: session.organizationId,
      sid: session.id,
    });
    const replacement = `${session.id}.${randomBytes(32).toString('hex')}`;
    await this.prisma.session.update({ where: { id: session.id }, data: { refreshToken: this.hashRefreshToken(replacement) } });
    return { access_token: accessToken, refresh_token: replacement, organizationId: session.organizationId };
  }

  async revokeSession(
    sessionId: string,
    userId: string,
    organizationId: string,
  ) {
    await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        userId,
        organizationId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        refreshToken: null,
      },
    });

    return { success: true };
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private resolveMembership(
    user: AuthenticatedLoginUser,
    requestedOrganizationId?: string,
  ): UserMembership {
    if (user.memberships.length === 0) {
      throw new UnauthorizedException(
        'User is not assigned to any organization',
      );
    }

    if (!requestedOrganizationId) {
      // Prefer the newest membership so login defaults to the currently active
      // workspace instead of a stale test organization.
      return user.memberships[0];
    }

    const membership = user.memberships.find(
      ({ organizationId }) => organizationId === requestedOrganizationId,
    );

    if (!membership) {
      throw new UnauthorizedException(
        'Requested organization is not available for this user',
      );
    }

    return membership;
  }

  private toAuthenticatedLoginUser(
    user: UserRecordWithPassword,
  ): AuthenticatedLoginUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      memberships: user.memberships,
    };
  }
}
