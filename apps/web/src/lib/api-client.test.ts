import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, fetchWorkspaceJson } from "./api-client";

describe("apiFetch", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("forwards the API token stored in the Auth.js session", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: "jwt-token" }), { status: 200 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({ contacts: [] }), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        await apiFetch("/dashboard");

        expect(fetchMock).toHaveBeenCalledTimes(2);
        const [, apiRequest] = fetchMock.mock.calls;
        expect(apiRequest[0]).toBe("/api/dashboard");
        expect((apiRequest[1].headers as Headers).get("Authorization")).toBe("Bearer jwt-token");
    });

    it("turns an unauthorized API response into a visible session error", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: "expired" }), { status: 200 }))
            .mockResolvedValueOnce(new Response(null, { status: 401 }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiFetch("/dashboard")).rejects.toMatchObject({
            status: 401,
            message: "Your session is no longer authorized. Sign in again.",
        });
    });
});

describe("fetchWorkspaceJson", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("retries once after a transient workspace failure", async () => {
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error("temporary network issue"))
            .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        const result = await fetchWorkspaceJson<{ ok: boolean }>("/api/workspace/dashboard", undefined, {
            retries: 1,
            retryDelayMs: 0,
        });

        expect(result).toEqual({ ok: true });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("does not retry unauthorized workspace responses", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response(null, { status: 401 }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(
            fetchWorkspaceJson("/api/workspace/dashboard", undefined, {
                retries: 1,
                retryDelayMs: 0,
            }),
        ).rejects.toMatchObject({
            status: 401,
            message: "Workspace request failed (401)",
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
