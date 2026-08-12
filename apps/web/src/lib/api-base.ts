const DEFAULT_API_BASE_URL = 'http://localhost:4000';

export function getApiBaseUrl() {
    if (typeof window !== 'undefined') {
        return '/api';
    }

    const rawValue =
        process.env.NEXT_PUBLIC_API_URL ??
        process.env.API_URL ??
        DEFAULT_API_BASE_URL;

    const normalized = rawValue
        .split('#')[0]
        .trim()
        .replace(/^['"]|['"]$/g, '');

    return normalized || DEFAULT_API_BASE_URL;
}
