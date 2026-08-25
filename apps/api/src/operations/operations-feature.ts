import { NotFoundException } from '@nestjs/common';

export function isOperationsCoreEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.ENABLE_OPERATIONS_CORE === 'true';
}

export function requireOperationsCoreEnabled(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (!isOperationsCoreEnabled(env)) {
    throw new NotFoundException('Operations Core is not enabled');
  }
}

