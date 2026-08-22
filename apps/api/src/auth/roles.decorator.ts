import { SetMetadata } from '@nestjs/common';

export const ORGANIZATION_ROLES_KEY = 'organization_roles';

export type OrganizationRole =
  | 'OWNER'
  | 'ADMIN'
  | 'MANAGER'
  | 'OPERATOR'
  | 'VIEWER';

export const Roles = (...roles: OrganizationRole[]) =>
  SetMetadata(ORGANIZATION_ROLES_KEY, roles);
