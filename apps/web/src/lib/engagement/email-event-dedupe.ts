export function buildTrackingOpenDedupeKey(
  campaignId: string | null | undefined,
  contactId: string,
) {
  return `tracking-open:${campaignId ?? "none"}:${contactId}`;
}

export function buildImapReplyDedupeKey(providerMessageId: string) {
  return `imap-reply:${providerMessageId}`;
}

export function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
