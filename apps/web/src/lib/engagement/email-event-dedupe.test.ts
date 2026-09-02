import { describe, expect, it } from "vitest";

import {
  buildImapReplyDedupeKey,
  buildTrackingOpenDedupeKey,
  isUniqueConstraintError,
} from "./email-event-dedupe";

describe("email event dedupe keys", () => {
  it("uses one canonical key for tracking and inferred opens", () => {
    expect(buildTrackingOpenDedupeKey("campaign-1", "contact-1")).toBe(
      "tracking-open:campaign-1:contact-1",
    );
    expect(buildTrackingOpenDedupeKey(null, "contact-1")).toBe(
      "tracking-open:none:contact-1",
    );
  });

  it("keys IMAP replies by their normalized provider message id", () => {
    expect(buildImapReplyDedupeKey("message-1")).toBe("imap-reply:message-1");
  });

  it("recognizes Prisma unique conflicts as safe replays", () => {
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(true);
    expect(isUniqueConstraintError({ code: "P2025" })).toBe(false);
    expect(isUniqueConstraintError(null)).toBe(false);
  });
});
