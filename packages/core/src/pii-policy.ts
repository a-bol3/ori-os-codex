/**
 * Conservative redaction applied before text is sent to an external AI
 * provider. Raw personal data is only allowed when the operator explicitly
 * enables ENABLE_EXTERNAL_AI_PII after completing the required assessment.
 */
export function redactExternalPii(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, '[redacted-phone]')
    .replace(
      /\b(?:organizationId|organisationId|contactId|userId|memberId)\s*[:=]\s*[A-Za-z0-9_-]+/gi,
      (match) => match.replace(/([:=]\s*).+$/, '$1[redacted-id]'),
    );
}

export function prepareExternalAiInput(
  value: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  return env.ENABLE_EXTERNAL_AI_PII === 'true' ? value : redactExternalPii(value);
}
