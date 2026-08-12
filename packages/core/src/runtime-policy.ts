export type RuntimeEnvironment = 'development' | 'test' | 'production';

export function runtimeEnvironment(env: NodeJS.ProcessEnv = process.env): RuntimeEnvironment {
  if (env.NODE_ENV === 'production') return 'production';
  if (env.NODE_ENV === 'test') return 'test';
  return 'development';
}

/** Fixture data is opt-in and can never be enabled in production. */
export function fixtureMode(
  flag:
    | 'ENABLE_AI_SIMULATION'
    | 'ENABLE_EMAIL_FIXTURES'
    | 'ENABLE_BILLING_FIXTURES'
    | 'ENABLE_SEO_FIXTURES'
    | 'ENABLE_TEST_BENCH',
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return runtimeEnvironment(env) !== 'production' && env[flag] === 'true';
}

export class ProviderConfigurationError extends Error {
  readonly code = 'PROVIDER_NOT_CONFIGURED';

  constructor(readonly provider: string, message = `${provider} is not configured`) {
    super(message);
    this.name = 'ProviderConfigurationError';
  }
}

export function requireConfiguredProvider(
  provider: string,
  configured: boolean,
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (!configured && runtimeEnvironment(env) === 'production') {
    throw new ProviderConfigurationError(provider);
  }
}
