import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const guard = new RolesGuard(reflector as never);

  const context = (roles: string[] | undefined, role?: string) =>
    ({
      getHandler: () => 'handler',
      getClass: () => 'class',
      switchToHttp: () => ({
        getRequest: () => ({ user: role ? { role } : undefined }),
      }),
      roles,
    }) as never;

  beforeEach(() => reflector.getAllAndOverride.mockReset());

  it('allows routes without role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(context(undefined, 'VIEWER'))).toBe(true);
  });

  it('allows a role listed by the route', () => {
    reflector.getAllAndOverride.mockReturnValue(['OWNER', 'ADMIN']);

    expect(guard.canActivate(context(['OWNER', 'ADMIN'], 'ADMIN'))).toBe(true);
  });

  it('rejects a member with an insufficient role', () => {
    reflector.getAllAndOverride.mockReturnValue(['OWNER', 'ADMIN']);

    expect(() => guard.canActivate(context(['OWNER', 'ADMIN'], 'VIEWER'))).toThrow(
      new ForbiddenException('Insufficient organization role'),
    );
  });

  it('rejects a request without authenticated role context', () => {
    reflector.getAllAndOverride.mockReturnValue(['OWNER']);

    expect(() => guard.canActivate(context(['OWNER']))).toThrow(
      new ForbiddenException('Insufficient organization role'),
    );
  });
});
