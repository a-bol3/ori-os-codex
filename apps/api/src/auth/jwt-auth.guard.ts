import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedUser } from '../common/request-context';
import { isAuthBypassEnabled, isAuthBypassRequested } from './auth-bypass';

function readDevelopmentIdentity(): AuthenticatedUser {
  const userId = process.env.ORI_DEV_USER_ID;
  const organizationId = process.env.ORI_DEV_ORGANIZATION_ID;

  if (!userId || !organizationId) {
    throw new UnauthorizedException(
      'Development auth bypass requires ORI_DEV_USER_ID and ORI_DEV_ORGANIZATION_ID',
    );
  }

  return {
    userId,
    organizationId,
    email: process.env.ORI_DEV_USER_EMAIL,
    role: 'OWNER',
  };
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: TUser | false,
  ): TUser {
    // Never infer development from an absent NODE_ENV. Auth bypass must be
    // explicitly opted into by the runtime environment.
    const isDev = process.env.NODE_ENV === 'development';
    const bypassRequested = isAuthBypassRequested();

    if (!isDev && bypassRequested) {
      throw new UnauthorizedException(
        'ORI_AUTH_BYPASS must never be enabled outside development',
      );
    }

    if (isAuthBypassEnabled()) {
      console.warn('ORI_AUTH_BYPASS ACTIVE (development only)');
      return user || (readDevelopmentIdentity() as TUser);
    }

    if (err instanceof Error) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
