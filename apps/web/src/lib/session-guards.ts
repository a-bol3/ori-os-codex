export function hasUsableSession(auth: {
    user?: unknown;
    organizationId?: unknown;
} | null | undefined) {
    return !!auth?.user &&
        typeof auth.organizationId === "string";
}
