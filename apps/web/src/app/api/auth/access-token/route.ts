import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    const accessToken = typeof (session as { accessToken?: unknown } | null)?.accessToken === "string"
        ? (session as { accessToken?: string }).accessToken
        : undefined;
    const organizationId = typeof (session as { organizationId?: unknown } | null)?.organizationId === "string"
        ? (session as { organizationId?: string }).organizationId
        : undefined;
    const email = typeof session?.user?.email === "string" ? session.user.email : undefined;
    const refreshToken = typeof (session as { refreshToken?: unknown } | null)?.refreshToken === "string"
        ? (session as { refreshToken?: string }).refreshToken
        : undefined;

    console.log("[access-token] session check", {
        hasSession: !!session,
        hasAccessToken: !!accessToken,
        hasOrganizationId: !!organizationId,
        email,
    });

    if (!accessToken) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    return NextResponse.json(
        {
            accessToken,
            refreshToken,
            organizationId,
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}
