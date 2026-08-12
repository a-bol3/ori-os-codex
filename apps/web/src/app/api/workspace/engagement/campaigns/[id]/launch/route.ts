import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getApiBaseUrl } from "@/lib/api-base";

export const dynamic = "force-dynamic";

export async function POST(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        const accessToken =
            typeof (session as { accessToken?: unknown } | null)?.accessToken === "string"
                ? (session as { accessToken?: string }).accessToken
                : undefined;

        if (!accessToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: { "Cache-Control": "no-store" } },
            );
        }

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json(
                { error: "Campaign id is required." },
                { status: 400, headers: { "Cache-Control": "no-store" } },
            );
        }

        const response = await fetch(
            `${getApiBaseUrl()}/engagement/campaigns/${encodeURIComponent(id)}/launch`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                cache: "no-store",
            },
        );
        const text = await response.text();
        let payload: unknown = {};
        if (text) {
            try {
                payload = JSON.parse(text);
            } catch {
                payload = { error: text };
            }
        }

        return NextResponse.json(payload, {
            status: response.status,
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("Failed to launch campaign", error);
        return NextResponse.json(
            { error: "Unable to launch campaign." },
            { status: 502, headers: { "Cache-Control": "no-store" } },
        );
    }
}
