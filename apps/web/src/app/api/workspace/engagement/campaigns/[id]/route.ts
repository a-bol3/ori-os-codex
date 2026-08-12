import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceRequestContext } from "@/app/api/workspace/_lib/request-context";
import { syncReplySignalsForOrganization } from "@/lib/engagement/reply-sync";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const requestContext = await resolveWorkspaceRequestContext();

    if (!requestContext.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const { id } = await context.params;
    const campaign = await prisma.campaign.findFirst({
        where: {
            id,
            organizationId: requestContext.organizationId,
        },
        include: {
            sequenceSteps: { orderBy: { order: "asc" } },
            recipients: { include: { contact: true } },
            mailbox: { include: { domain: true } },
        },
    });

    if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await syncReplySignalsForOrganization(requestContext.organizationId, {
        mailboxId: campaign.mailboxId,
        mailboxEmail: campaign.fromEmail,
    });

    const [sent, opened, replies] = await Promise.all([
        prisma.emailEvent.count({
            where: { campaignId: campaign.id, eventType: "SENT" },
        }),
        prisma.emailEvent.count({
            where: { campaignId: campaign.id, eventType: "OPENED" },
        }),
        prisma.emailEvent.count({
            where: { campaignId: campaign.id, eventType: "REPLY" },
        }),
    ]);

    return NextResponse.json(
        {
            ...campaign,
            sent,
            opened,
            replies,
            recipientsCount: campaign.recipients.length,
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const requestContext = await resolveWorkspaceRequestContext();

    if (!requestContext.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const { id } = await context.params;
    const existing = await prisma.campaign.findFirst({
        where: {
            id,
            organizationId: requestContext.organizationId,
        },
        select: { id: true },
    });

    if (!existing) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const body = (await request.json()) as {
        name?: string;
        status?: "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "COMPLETED" | "ARCHIVED";
        objective?: string | null;
        mailboxId?: string | null;
        fromName?: string | null;
        fromEmail?: string | null;
        replyTo?: string | null;
        sendWindowJson?: unknown;
        sequenceSteps?: Array<{
            order: number;
            stepType: "EMAIL" | "WAIT" | "CONDITION";
            configJson: unknown;
            templateId?: string | null;
        }>;
    };

    const sequenceSteps = body.sequenceSteps
        ? body.sequenceSteps.map((step) => ({
            order: step.order,
            stepType: step.stepType,
            configJson: step.configJson as any,
            templateId: step.templateId ?? null,
        }))
        : undefined;

    const updated = await prisma.campaign.update({
        where: { id },
        data: {
            name: typeof body.name === "string" ? body.name.trim() : undefined,
            status: body.status,
            objective: body.objective,
            mailboxId: body.mailboxId,
            fromName: body.fromName,
            fromEmail: body.fromEmail,
            replyTo: body.replyTo,
            sendWindowJson: body.sendWindowJson as any,
            sequenceSteps: sequenceSteps
                ? {
                    deleteMany: {},
                    create: sequenceSteps,
                }
                : undefined,
        },
        include: {
            sequenceSteps: { orderBy: { order: "asc" } },
            _count: { select: { recipients: true } },
        },
    });

    return NextResponse.json(updated, {
        headers: { "Cache-Control": "no-store" },
    });
}

export async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const requestContext = await resolveWorkspaceRequestContext();

    if (!requestContext.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const { id } = await context.params;
    const existing = await prisma.campaign.findFirst({
        where: {
            id,
            organizationId: requestContext.organizationId,
        },
        select: { id: true },
    });

    if (!existing) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await prisma.campaign.delete({
        where: { id },
    });

    return NextResponse.json({ success: true }, {
        headers: { "Cache-Control": "no-store" },
    });
}
