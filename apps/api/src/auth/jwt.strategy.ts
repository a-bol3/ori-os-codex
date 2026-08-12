import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

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
  constructor() {
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

    return {
      userId: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      organizationId: payload.organizationId,
    };
  }
}
