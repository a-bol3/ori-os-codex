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

        const companies = await prisma.company.findMany({
            where: {
                organizationId: context.organizationId,
            },
            include: {
                _count: {
                    select: {
                        contacts: true,
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
                items: companies,
                total: companies.length,
                limit: companies.length,
                offset: 0,
                hasMore: false,
            },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (error) {
        console.error("[workspace-crm-companies] Failed to load companies", error);
        return NextResponse.json(
            { error: "Failed to load companies" },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
