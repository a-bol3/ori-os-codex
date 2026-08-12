export function normalizePagination(
  rawLimit: number | string | undefined,
  rawOffset: number | string | undefined,
  defaults: { limit: number; maxLimit: number; offset?: number },
) {
  const parsedLimit =
    typeof rawLimit === 'number'
      ? rawLimit
      : rawLimit
        ? Number.parseInt(rawLimit, 10)
        : defaults.limit;

  const parsedOffset =
    typeof rawOffset === 'number'
      ? rawOffset
      : rawOffset
        ? Number.parseInt(rawOffset, 10)
        : defaults.offset ?? 0;

  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), defaults.maxLimit)
    : defaults.limit;

  const offset = Number.isFinite(parsedOffset)
    ? Math.max(parsedOffset, 0)
    : defaults.offset ?? 0;

  return { limit, offset };
}
