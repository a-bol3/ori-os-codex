import { describe, expect, it } from "vitest";
import { hasUsableSession } from "./session-guards";

describe("hasUsableSession", () => {
    it("requires a user, access token, and organization id", () => {
        expect(hasUsableSession(null)).toBe(false);
        expect(hasUsableSession({ user: { id: "1" } })).toBe(false);
        expect(hasUsableSession({ user: { id: "1" }, accessToken: "token" })).toBe(false);
        expect(hasUsableSession({ user: { id: "1" }, organizationId: "org" })).toBe(false);
        expect(hasUsableSession({
            user: { id: "1" },
            accessToken: "token",
            organizationId: "org",
        })).toBe(true);
    });
});
