import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceRequestContext } from "@/app/api/workspace/_lib/request-context";

export async function GET() {
    try {
        const requestContext = await resolveWorkspaceRequestContext();

        if (!requestContext.organizationId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: { "Cache-Control": "no-store" } },
            );
        }

        const contacts = await prisma.contact.findMany({
            where: {
                organizationId: requestContext.organizationId,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                jobTitle: true,
                company: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [
                { firstName: "asc" },
                { lastName: "asc" },
                { email: "asc" },
            ],
        });

        return NextResponse.json(contacts, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("[workspace-crm-contact-options] Failed to load contact options", error);
        return NextResponse.json(
            { error: "Failed to load contact options" },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
