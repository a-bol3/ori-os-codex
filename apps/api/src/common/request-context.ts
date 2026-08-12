import { UnauthorizedException } from '@nestjs/common';

export interface AuthenticatedUser {
  userId: string;
  email?: string;
  organizationId: string;
}

export interface AuthenticatedRequest {
  user?: Partial<AuthenticatedUser> & { id?: string };
}

export function requireOrganizationId(req: AuthenticatedRequest): string {
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new UnauthorizedException('Organization context is required');
  }

  return organizationId;
}

export function requireUserId(req: AuthenticatedRequest): string {
  const userId = req.user?.userId ?? req.user?.id;

  if (!userId) {
    throw new UnauthorizedException('User context is required');
  }

  return userId;
}

export function getOptionalUserId(req: AuthenticatedRequest): string | undefined {
  const userId = req.user?.userId ?? req.user?.id;
  return typeof userId === 'string' && userId.length > 0 ? userId : undefined;
}
