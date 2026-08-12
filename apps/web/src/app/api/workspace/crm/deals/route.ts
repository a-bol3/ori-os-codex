import { NextResponse } from "next/server";

import { resolveWorkspaceRequestContext } from "@/app/api/workspace/_lib/request-context";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const context = await resolveWorkspaceRequestContext();

        if (!context.organizationId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: { "Cache-Control": "no-store" } },
            );
        }

        const deals = await prisma.deal.findMany({
            where: {
                organizationId: context.organizationId,
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                contact: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                stage: {
                    select: {
                        name: true,
                    },
                },
                organization: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [
                { createdAt: "desc" },
                { name: "asc" },
            ],
        });

        return NextResponse.json(
            {
                items: deals,
                total: deals.length,
                limit: deals.length,
                offset: 0,
                hasMore: false,
            },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (error) {
        console.error("[workspace-crm-deals] Failed to load deals", error);
        return NextResponse.json(
            { error: "Failed to load deals" },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
