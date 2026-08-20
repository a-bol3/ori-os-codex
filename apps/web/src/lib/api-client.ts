export class ApiError extends Error {
    constructor(message: string, public readonly status: number) {
        super(message);
        this.name = "ApiError";
    }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
    if (!path.startsWith("/")) {
        throw new ApiError("API paths must start with '/'", 400);
    }

    // Credentials stay in the encrypted Auth.js cookie. The browser never sees
    // an API access or refresh token; the same-origin BFF reads it server-side.
    const response = await fetch(`/api/workspace-proxy${path}`, {
        ...init,
        credentials: "same-origin",
        cache: "no-store",
    });
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
