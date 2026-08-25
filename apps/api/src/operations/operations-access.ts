import { ForbiddenException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/request-context';

const WRITE_ROLES = new Set(['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR']);

export function requireOperationsWriteAccess(req: AuthenticatedRequest): void {
  if (!req.user?.role || !WRITE_ROLES.has(req.user.role)) {
    throw new ForbiddenException('Operations write access is required');
  }
}

