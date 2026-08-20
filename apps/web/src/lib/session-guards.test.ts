import { describe, expect, it } from "vitest";
import { hasUsableSession } from "./session-guards";

describe("hasUsableSession", () => {
    it("requires a user and organization id", () => {
        expect(hasUsableSession(null)).toBe(false);
        expect(hasUsableSession({ user: { id: "1" } })).toBe(false);
        expect(hasUsableSession({
            user: { id: "1" },
            organizationId: "org",
        })).toBe(true);
    });
});
