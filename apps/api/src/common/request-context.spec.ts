import { UnauthorizedException } from '@nestjs/common';
import { requireOrganizationId, requireUserId } from './request-context';

describe('request context', () => {
  it('requires an organization identifier', () => {
    expect(() => requireOrganizationId({ user: { userId: 'user-1' } })).toThrow(
      UnauthorizedException,
    );
  });

  it('requires a user identifier', () => {
    expect(() =>
      requireUserId({ user: { organizationId: 'organization-1' } }),
    ).toThrow(UnauthorizedException);
  });

  it('returns explicit identity values', () => {
    const request = {
      user: { userId: 'user-1', organizationId: 'organization-1' },
    };

    expect(requireUserId(request)).toBe('user-1');
    expect(requireOrganizationId(request)).toBe('organization-1');
  });
});
