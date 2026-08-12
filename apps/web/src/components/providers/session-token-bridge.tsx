"use client";

import { useEffect } from "react";

type SessionTokenBridgeProps = {
    accessToken?: string;
    organizationId?: string;
};

declare global {
    interface Window {
        __ORI_SESSION__?: {
            accessToken?: string;
            organizationId?: string;
        };
    }
}

export function SessionTokenBridge({
    accessToken,
    organizationId,
}: SessionTokenBridgeProps) {
    useEffect(() => {
        window.__ORI_SESSION__ = {
            accessToken,
            organizationId,
        };
    }, [accessToken, organizationId]);

    return null;
}
