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

        const contacts = await prisma.contact.findMany({
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
                organization: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [
                { createdAt: "desc" },
                { firstName: "asc" },
                { lastName: "asc" },
                { email: "asc" },
            ],
        });

        return NextResponse.json(
            {
                items: contacts,
                total: contacts.length,
                limit: contacts.length,
                offset: 0,
                hasMore: false,
            },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (error) {
        console.error("[workspace-crm-contacts] Failed to load contacts", error);
        return NextResponse.json(
            { error: "Failed to load contacts" },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
