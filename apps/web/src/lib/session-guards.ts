export function hasUsableSession(auth: {
    user?: unknown;
    accessToken?: unknown;
    organizationId?: unknown;
} | null | undefined) {
    return !!auth?.user &&
        typeof auth.accessToken === "string" &&
        typeof auth.organizationId === "string";
}
