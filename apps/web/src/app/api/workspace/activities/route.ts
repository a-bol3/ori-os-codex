import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceRequestContext } from "../_lib/request-context";

type ActivityResponseItem = {
    id: string;
    type: "lead" | "deal" | "sequence" | "task" | "system";
    title: string;
    description: string;
    createdAt: string;
    status: "read" | "unread";
};

export async function GET() {
    const context = await resolveWorkspaceRequestContext();

    if (!context.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const items = await prisma.activity.findMany({
        where: { organizationId: context.organizationId },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    const payload: ActivityResponseItem[] = items.map((activity) => ({
        id: activity.id,
        type: mapActivityType(activity.type, activity.dealId, activity.contactId),
        title: activity.subject || "Activity logged",
        description: activity.body || "No description provided.",
        createdAt: activity.createdAt.toISOString(),
        status: readMetadataBoolean(activity.metadataJson, "read") ? "read" : "unread",
    }));

    return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store" },
    });
}

function mapActivityType(
    type: string,
    dealId?: string | null,
    contactId?: string | null,
): ActivityResponseItem["type"] {
    if (type === "TASK") {
        return "task";
    }

    if (dealId) {
        return "deal";
    }

    if (contactId) {
        return "lead";
    }

    return "system";
}

function readMetadataBoolean(value: unknown, key: string): boolean {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    return (value as Record<string, unknown>)[key] === true;
}
