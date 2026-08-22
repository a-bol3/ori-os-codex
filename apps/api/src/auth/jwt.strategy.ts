import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { OrganizationRole } from './roles.decorator';

type JwtPayload = {
  sub?: unknown;
  email?: unknown;
  organizationId?: unknown;
};

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'ori-os-test-only-secret';
  }

  throw new Error('JWT_SECRET is required');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireJwtSecret(),
    });
  }

  async validate(payload: JwtPayload) {
    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new UnauthorizedException('JWT payload is missing subject');
    }

    if (
      typeof payload.organizationId !== 'string' ||
      payload.organizationId.length === 0
    ) {
      throw new UnauthorizedException(
        'JWT payload is missing organization context',
      );
    }

    const membership = await this.prisma.organizationMembership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: payload.organizationId,
          userId: payload.sub,
        },
      },
      select: { role: true },
    });

    if (!membership) {
      throw new UnauthorizedException(
        'User is not a member of this organization',
      );
    }

    return {
      userId: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      organizationId: payload.organizationId,
      role: membership.role as OrganizationRole,
    };
  }
}
