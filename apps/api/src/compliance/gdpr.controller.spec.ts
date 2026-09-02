import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { GdprController } from './gdpr.controller';
import { ORGANIZATION_ROLES_KEY } from '../auth/roles.decorator';

describe('GdprController access policy', () => {
  it('restricts compliance operations to organization owners and admins', () => {
    expect(Reflect.getMetadata(ORGANIZATION_ROLES_KEY, GdprController)).toEqual([
      'OWNER',
      'ADMIN',
    ]);
  });

  it('registers JWT and role guards on the controller', () => {
    const guards = Reflect.getMetadata('__guards__', GdprController) as Array<unknown>;

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
  });
});
