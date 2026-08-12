import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceRequestContext } from "@/app/api/workspace/_lib/request-context";
import { syncReplySignalsForOrganization } from "@/lib/engagement/reply-sync";

export async function GET() {
    const context = await resolveWorkspaceRequestContext();

    if (!context.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    await syncReplySignalsForOrganization(context.organizationId);

    const items = await prisma.emailEvent.findMany({
        where: {
            eventType: "REPLY",
            campaign: {
                organizationId: context.organizationId,
            },
        },
        include: {
            contact: true,
            campaign: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items, {
        headers: { "Cache-Control": "no-store" },
    });
}
