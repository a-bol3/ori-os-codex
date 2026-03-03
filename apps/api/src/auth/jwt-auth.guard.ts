import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    const isDev = process.env.NODE_ENV === 'development';
    const bypassEnabled =
      isDev &&
      (process.env.ORI_AUTH_BYPASS === '1' ||
        process.env.ORI_AUTH_BYPASS === 'true');

    if (
      !isDev &&
      (process.env.ORI_AUTH_BYPASS === '1' ||
        process.env.ORI_AUTH_BYPASS === 'true')
    ) {
      throw new UnauthorizedException(
        'ORI_AUTH_BYPASS must never be enabled in production',
      );
    }

    if (bypassEnabled) {
      console.warn('⚠️ ORI_AUTH_BYPASS ACTIVE (development only)');
      return (
        user || {
          userId: 'mock-user-id',
          email: 'admin@oricraftlabs.com',
          organizationId: 'mock-org-id',
        }
      );
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
