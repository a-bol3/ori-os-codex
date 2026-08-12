import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceRequestContext } from "@/app/api/workspace/_lib/request-context";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PUT(_request: Request, context: RouteContext) {
    const { id } = await context.params;
    const requestContext = await resolveWorkspaceRequestContext();
    const organizationId = requestContext?.organizationId;

    if (!organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const activity = await prisma.activity.findFirst({
        where: { id, organizationId },
        select: {
            id: true,
            metadataJson: true,
        },
    });

    if (!activity) {
        return NextResponse.json(
            { error: "Activity not found" },
            { status: 404, headers: { "Cache-Control": "no-store" } },
        );
    }

    const metadata =
        activity.metadataJson && typeof activity.metadataJson === "object" && !Array.isArray(activity.metadataJson)
            ? activity.metadataJson as Record<string, unknown>
            : {};

    await prisma.activity.update({
        where: { id },
        data: {
            metadataJson: {
                ...metadata,
                read: true,
            },
        },
    });

    return NextResponse.json({ ok: true }, {
        headers: { "Cache-Control": "no-store" },
    });
}
