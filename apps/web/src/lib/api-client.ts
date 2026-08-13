import { getApiBaseUrl } from "./api-base";
import { getSession } from "next-auth/react";

type BrowserSession = {
    accessToken?: string;
    organizationId?: string;
    user?: {
        accessToken?: string;
        organizationId?: string;
    };
};

export class ApiError extends Error {
    constructor(message: string, public readonly status: number) {
        super(message);
        this.name = "ApiError";
    }
}

async function getAccessToken(): Promise<string | undefined> {
    if (typeof window !== "undefined") {
        const bridgedToken = window.__ORI_SESSION__?.accessToken;
        if (bridgedToken) {
            return bridgedToken;
        }
    }

    const response = await fetch("/api/auth/access-token", {
        credentials: "same-origin",
        cache: "no-store",
    });
    if (response.ok) {
        const session = await response.json() as BrowserSession;
        const freshToken = session.accessToken ?? session.user?.accessToken;

        if (freshToken) {
            return freshToken;
        }
    }

    const hydratedSession = await getSession() as BrowserSession | null;
    const hydratedToken = hydratedSession?.accessToken ?? hydratedSession?.user?.accessToken;

    if (hydratedToken) {
        return hydratedToken;
    }

    throw new ApiError("Unable to read the current session", response.status);
}

async function refreshAccessToken(): Promise<string | undefined> {
    try {
        const response = await fetch("/api/auth/access-token", { credentials: "same-origin", cache: "no-store" });
        if (!response.ok) return undefined;
        const session = await response.json() as BrowserSession & { refreshToken?: string };
        if (!session.refreshToken) return undefined;
        const refreshed = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: session.refreshToken }),
        });
        if (!refreshed.ok) return undefined;
        return (await refreshed.json() as { access_token?: string }).access_token;
    } catch {
        return undefined;
    }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const token = await getAccessToken();
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let response = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
    if (response.status === 401) {
        const renewed = await refreshAccessToken();
        if (renewed) {
            headers.set("Authorization", `Bearer ${renewed}`);
            response = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
        }
    }
    if (!response.ok) {
        const detail = response.status === 401
            ? "Your session is no longer authorized. Sign in again."
            : `Request failed with status ${response.status}`;
        throw new ApiError(detail, response.status);
    }
    return response;
}

async function pause(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWorkspaceJson<T>(
    path: string,
    init: RequestInit = {},
    options: { retries?: number; retryDelayMs?: number } = {},
): Promise<T> {
    const retries = options.retries ?? 1;
    const retryDelayMs = options.retryDelayMs ?? 350;

    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const response = await fetch(path, {
                credentials: "same-origin",
                cache: "no-store",
                ...init,
            });

            if (!response.ok) {
                throw new ApiError(`Workspace request failed (${response.status})`, response.status);
            }

            return await response.json() as T;
        } catch (error) {
            lastError = error;
            const status = error instanceof ApiError ? error.status : undefined;
            const shouldRetry =
                attempt < retries &&
                (status === undefined || status >= 500);

            if (!shouldRetry) {
                throw error;
            }

            await pause(retryDelayMs);
        }
    }

    throw lastError instanceof Error ? lastError : new Error("Workspace request failed");
}

export function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}
