export function isTruthyEnvValue(value: string | undefined) {
  return ['1', 'true', 'yes', 'on'].includes(
    (value ?? '')
      .split('#')[0]
      .trim()
      .replace(/^['"]|['"]$/g, '')
      .toLowerCase(),
  );
}

export function isAuthBypassEnabled() {
  const rawValue = process.env.ORI_AUTH_BYPASS ?? process.env.AUTH_BYPASS ?? '';
  // Fail closed when NODE_ENV is missing. A missing environment declaration is
  // not proof that the process is a local development instance.
  const isDevelopment = process.env.NODE_ENV === 'development';

  return isDevelopment && isTruthyEnvValue(rawValue);
}

export function isAuthBypassRequested() {
  const rawValue = process.env.ORI_AUTH_BYPASS ?? process.env.AUTH_BYPASS ?? '';
  return isTruthyEnvValue(rawValue);
}
