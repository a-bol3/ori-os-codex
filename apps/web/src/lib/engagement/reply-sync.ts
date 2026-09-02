import { ImapFlow } from "imapflow";

import { prisma } from "@/lib/prisma";
import {
  buildImapReplyDedupeKey,
  buildTrackingOpenDedupeKey,
  isUniqueConstraintError,
} from "./email-event-dedupe";

const DEFAULT_IMAP_HOST = process.env.IMAP_HOST || "imap.hostinger.com";
const DEFAULT_IMAP_PORT = Number(process.env.IMAP_PORT || 993);
const DEFAULT_IMAP_USER = process.env.IMAP_USER || process.env.SMTP_USER || "";
const DEFAULT_IMAP_PASSWORD =
  process.env.IMAP_PASSWORD || process.env.SMTP_PASSWORD || "";
const DEFAULT_IMAP_SECURE =
  (process.env.IMAP_SECURE || "").toLowerCase() === "true" ||
  DEFAULT_IMAP_PORT === 993;

const SYNC_WINDOW_DAYS = 14;
const SYNC_COOLDOWN_MS = 30_000;

type GlobalWithReplySync = typeof globalThis & {
  __oriReplySyncState?: Map<string, number>;
};

function isHeaderCollection(value: unknown): value is HeaderCollection {
  return (
    !!value &&
    typeof value === "object" &&
    "get" in value &&
    typeof (value as { get?: unknown }).get === "function"
  );
}

function getSyncState() {
  const scopedGlobal = globalThis as GlobalWithReplySync;
  if (!scopedGlobal.__oriReplySyncState) {
    scopedGlobal.__oriReplySyncState = new Map<string, number>();
  }

  return scopedGlobal.__oriReplySyncState;
}

function normalizeMessageId(value?: string | null) {
  return value?.trim().replace(/^<|>$/g, "").toLowerCase() || "";
}

type HeaderValue = string | Buffer | string[] | Buffer[];
type HeaderCollection = {
  get(name: string): HeaderValue | undefined;
};

function readHeaderValue(
  headers: HeaderCollection | undefined,
  headerName: string,
) {
  const value = headers?.get(headerName.toLowerCase());

  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) =>
        Buffer.isBuffer(entry) ? entry.toString("utf8") : String(entry),
      )
      .join(" ");
  }

  return Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
}

export async function syncReplySignalsForOrganization(
  organizationId: string,
  options?: { mailboxId?: string | null; mailboxEmail?: string | null },
) {
  if (
    !organizationId ||
    !DEFAULT_IMAP_USER ||
    !DEFAULT_IMAP_PASSWORD ||
    !DEFAULT_IMAP_HOST
  ) {
    return { synced: false, reason: "missing-imap-config" as const };
  }

  if (options?.mailboxEmail && options.mailboxEmail !== DEFAULT_IMAP_USER) {
    return { synced: false, reason: "mailbox-not-configured" as const };
  }

  const syncKey = `${organizationId}:${options?.mailboxId || DEFAULT_IMAP_USER}`;
  const syncState = getSyncState();
  const lastRun = syncState.get(syncKey) || 0;

  if (Date.now() - lastRun < SYNC_COOLDOWN_MS) {
    return { synced: false, reason: "cooldown" as const };
  }

  syncState.set(syncKey, Date.now());

  const sentEvents = await prisma.emailEvent.findMany({
    where: {
      eventType: "SENT",
      campaign: { organizationId },
      providerMessageId: { not: null },
      ...(options?.mailboxId ? { mailboxId: options.mailboxId } : {}),
    },
    select: {
      id: true,
      campaignId: true,
      contactId: true,
      mailboxId: true,
      providerMessageId: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const sentByMessageId = new Map<
    string,
    {
      campaignId: string | null;
      contactId: string | null;
      mailboxId: string | null;
    }
  >();

  for (const event of sentEvents) {
    const normalized = normalizeMessageId(event.providerMessageId);
    if (!normalized || sentByMessageId.has(normalized)) {
      continue;
    }

    sentByMessageId.set(normalized, {
      campaignId: event.campaignId,
      contactId: event.contactId,
      mailboxId: event.mailboxId,
    });
  }

  if (sentByMessageId.size === 0) {
    return { synced: false, reason: "no-sent-events" as const };
  }

  const client = new ImapFlow({
    host: DEFAULT_IMAP_HOST,
    port: DEFAULT_IMAP_PORT,
    secure: DEFAULT_IMAP_SECURE,
    auth: {
      user: DEFAULT_IMAP_USER,
      pass: DEFAULT_IMAP_PASSWORD,
    },
    logger: false,
  });

  let replyCount = 0;

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    const sinceDate = new Date(
      Date.now() - SYNC_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    const uids = await client.search({ since: sinceDate });
    const recentUids = Array.isArray(uids) ? uids.slice(-50) : [];

    if (recentUids.length === 0) {
      return { synced: true, replyCount: 0 };
    }

    for await (const message of client.fetch(recentUids, {
      uid: true,
      envelope: true,
      headers: ["message-id", "in-reply-to", "references"],
    })) {
      const headers = isHeaderCollection(message.headers)
        ? message.headers
        : undefined;

      const inboundMessageId = normalizeMessageId(
        readHeaderValue(headers, "message-id") ||
          message.envelope?.messageId ||
          undefined,
      );

      if (!inboundMessageId) {
        continue;
      }

      const directReplyReference = normalizeMessageId(
        readHeaderValue(headers, "in-reply-to"),
      );
      const referencesHeader = readHeaderValue(headers, "references");
      const references = directReplyReference
        ? [directReplyReference]
        : referencesHeader
            .split(/\s+/)
            .map((entry) => normalizeMessageId(entry))
            .filter(Boolean);
      const matchedReference = references.find((reference) =>
        sentByMessageId.has(reference),
      );

      if (!matchedReference) {
        continue;
      }

      const sentEvent = sentByMessageId.get(matchedReference);
      if (!sentEvent?.campaignId || !sentEvent.contactId) {
        continue;
      }

      const existingReply = await prisma.emailEvent.findFirst({
        where: {
          campaignId: sentEvent.campaignId,
          contactId: sentEvent.contactId,
          eventType: "REPLY",
          providerMessageId: inboundMessageId,
        },
        select: { id: true },
      });

      if (existingReply) {
        await prisma.campaignRecipient.updateMany({
          where: {
            campaignId: sentEvent.campaignId,
            contactId: sentEvent.contactId,
          },
          data: {
            status: "REPLIED",
            lastEventAt: new Date(),
          },
        });
        continue;
      }

      const fromAddress = message.envelope?.from?.[0]?.address || null;
      const replySubject = message.envelope?.subject || null;

      try {
        await prisma.emailEvent.create({
          data: {
            campaignId: sentEvent.campaignId!,
            contactId: sentEvent.contactId!,
            mailboxId: sentEvent.mailboxId,
            providerMessageId: inboundMessageId,
            dedupeKey: buildTrackingOpenDedupeKey(
              sentEvent.campaignId,
              sentEvent.contactId,
            ),
            eventType: "OPENED",
            rawPayloadJson: {
              source: "imap-reply-inference",
              inferredFromReply: true,
              from: fromAddress,
              subject: replySubject,
            },
          },
        });
      } catch (error) {
        // A tracking pixel or another IMAP pass may have won the
        // canonical open insert. Both outcomes represent one open.
        if (!isUniqueConstraintError(error)) {
          throw error;
        }
      }

      let replyAccepted = false;
      let replyCreated = false;

      try {
        await prisma.emailEvent.create({
          data: {
            campaignId: sentEvent.campaignId!,
            contactId: sentEvent.contactId!,
            mailboxId: sentEvent.mailboxId,
            providerMessageId: inboundMessageId,
            dedupeKey: buildImapReplyDedupeKey(inboundMessageId),
            eventType: "REPLY",
            rawPayloadJson: {
              source: "imap",
              from: fromAddress,
              subject: replySubject,
              inReplyTo: matchedReference,
              uid: message.uid,
            },
          },
        });
        replyAccepted = true;
        replyCreated = true;
      } catch (error) {
        // IMAP polling can overlap across requests or instances.
        // The unique provider-message key makes a replay harmless.
        if (!isUniqueConstraintError(error)) {
          throw error;
        }
        replyAccepted = true;
      }

      if (replyAccepted) {
        await prisma.campaignRecipient.updateMany({
          where: {
            campaignId: sentEvent.campaignId!,
            contactId: sentEvent.contactId!,
          },
          data: {
            status: "REPLIED",
            lastEventAt: new Date(),
          },
        });
      }

      if (replyCreated) {
        replyCount += 1;
      }
    }
  } finally {
    await client.logout().catch(() => undefined);
  }

  return { synced: true, replyCount };
}
