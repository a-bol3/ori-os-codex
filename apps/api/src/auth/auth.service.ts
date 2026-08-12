import {  Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@ori-os/db/nestjs';
import * as bcrypt from 'bcrypt';

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
    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: membership.organizationId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      organizationId: membership.organizationId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
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
