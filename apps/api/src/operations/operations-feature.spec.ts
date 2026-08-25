import { NotFoundException } from '@nestjs/common';
import {
  isOperationsCoreEnabled,
  requireOperationsCoreEnabled,
} from './operations-feature';

describe('Operations Core feature flag', () => {
  it('fails closed unless explicitly enabled', () => {
    expect(isOperationsCoreEnabled({} as NodeJS.ProcessEnv)).toBe(false);
    expect(() => requireOperationsCoreEnabled({} as NodeJS.ProcessEnv)).toThrow(
      NotFoundException,
    );
  });

  it('enables only with the literal true value', () => {
    const env = { ENABLE_OPERATIONS_CORE: 'true' } as NodeJS.ProcessEnv;
    expect(isOperationsCoreEnabled(env)).toBe(true);
    expect(() => requireOperationsCoreEnabled(env)).not.toThrow();
  });
});
