function readBypassValue() {
    return (
        process.env.ORI_AUTH_BYPASS ??
        process.env.AUTH_BYPASS ??
        process.env.NEXT_PUBLIC_AUTH_BYPASS ??
        ""
    );
}

export function isTruthyEnvValue(value: string | undefined) {
    return ["1", "true", "yes", "on"].includes(
        (value ?? "")
            .split("#")[0]
            .trim()
            .replace(/^['"]|['"]$/g, "")
            .toLowerCase()
    );
}

export function isDevelopmentEnvironment() {
    // Fail closed when NODE_ENV is absent; an unset value must not activate a
    // client-side authentication bypass in a deployed build.
    return process.env.NODE_ENV === "development";
}

export function isAuthBypassEnabled() {
    return isDevelopmentEnvironment() && isTruthyEnvValue(readBypassValue());
}
