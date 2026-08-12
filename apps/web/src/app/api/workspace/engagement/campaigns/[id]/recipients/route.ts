import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getApiBaseUrl } from "@/lib/api-base";

export async function POST(
    request: NextRequest,
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
        const body = (await request.json().catch(() => ({}))) as { contactIds?: string[] };
        const response = await fetch(`${getApiBaseUrl()}/engagement/campaigns/${id}/recipients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
            body: JSON.stringify({
                contactIds: Array.isArray(body.contactIds) ? body.contactIds : [],
            }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
            count?: number;
        };

        if (!response.ok) {
            return NextResponse.json(
                { error: payload.error || "Could not add recipient." },
                { status: response.status, headers: { "Cache-Control": "no-store" } },
            );
        }

        return NextResponse.json(
            { count: payload.count ?? 0 },
            { status: 201, headers: { "Cache-Control": "no-store" } },
        );
    } catch (error) {
        console.error("Failed to add campaign recipients", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: message || "Could not add recipient." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}

export async function DELETE(
    request: NextRequest,
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
        const body = (await request.json().catch(() => ({}))) as { contactId?: string };
        const contactId = typeof body.contactId === "string" ? body.contactId.trim() : "";

        if (!contactId) {
            return NextResponse.json({ error: "Contact id is required." }, { status: 400 });
        }

        const response = await fetch(
            `${getApiBaseUrl()}/engagement/campaigns/${id}/recipients/${contactId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: "no-store",
            },
        );

        const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
            success?: boolean;
        };

        if (!response.ok) {
            return NextResponse.json(
                { error: payload.error || "Could not remove recipient." },
                { status: response.status, headers: { "Cache-Control": "no-store" } },
            );
        }

        return NextResponse.json(
            { success: payload.success ?? true },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (error) {
        console.error("Failed to remove campaign recipient", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: message || "Could not remove recipient." },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
