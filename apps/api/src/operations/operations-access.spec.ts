import { ForbiddenException } from '@nestjs/common';
import { requireOperationsWriteAccess } from './operations-access';

describe('Operations Core permissions', () => {
  it.each(['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR'] as const)(
    'allows %s to write',
    (role) => {
      expect(() =>
        requireOperationsWriteAccess({
          user: { userId: 'user-1', organizationId: 'org-1', role },
        }),
      ).not.toThrow();
    },
  );

  it('keeps VIEWER read-only', () => {
    expect(() =>
      requireOperationsWriteAccess({
        user: { userId: 'user-1', organizationId: 'org-1', role: 'VIEWER' },
      }),
    ).toThrow(ForbiddenException);
  });
});
