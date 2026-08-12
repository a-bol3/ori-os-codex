import { NextResponse } from "next/server";

import { resolveWorkspaceRequestContext } from "@/app/api/workspace/_lib/request-context";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const context = await resolveWorkspaceRequestContext();

    if (!context.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const pipelines = await prisma.pipeline.findMany({
        where: {
            organizationId: context.organizationId,
        },
        include: {
            stages: {
                orderBy: {
                    order: "asc",
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    return NextResponse.json(pipelines, {
        headers: { "Cache-Control": "no-store" },
    });
}
