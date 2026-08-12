import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveWorkspaceRequestContext } from "@/app/api/workspace/_lib/request-context";
import { syncReplySignalsForOrganization } from "@/lib/engagement/reply-sync";

const PREFERRED_MAILBOX_EMAIL = "business@ori-craftlabs.com";

function selectPreferredMailbox<T extends { email: string }>(mailboxes: T[]): T | null {
    if (!mailboxes.length) {
        return null;
    }

    return (
        mailboxes.find((mailbox) => mailbox.email.toLowerCase() === PREFERRED_MAILBOX_EMAIL) ??
        mailboxes.find((mailbox) => mailbox.email.toLowerCase().endsWith("@ori-craftlabs.com")) ??
        mailboxes[0] ??
        null
    );
}

function getCampaignId(request: NextRequest) {
    return request.nextUrl.searchParams.get("id")?.trim() ?? "";
}

export async function GET(request: NextRequest) {
    const requestContext = await resolveWorkspaceRequestContext();

    if (!requestContext.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const id = getCampaignId(request);

    if (!id) {
        return NextResponse.json({ error: "Campaign id is required." }, { status: 400 });
    }

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

    const recentEvents = await prisma.emailEvent.findMany({
        where: {
            campaignId: campaign.id,
        },
        include: {
            contact: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 20,
    });

    return NextResponse.json(
        {
            ...campaign,
            sent,
            opened,
            replies,
            recipientsCount: campaign.recipients.length,
            recentEvents,
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}

export async function PUT(request: NextRequest) {
    const requestContext = await resolveWorkspaceRequestContext();

    if (!requestContext.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const id = getCampaignId(request);

    if (!id) {
        return NextResponse.json({ error: "Campaign id is required." }, { status: 400 });
    }

    const existing = await prisma.campaign.findFirst({
        where: {
            id,
            organizationId: requestContext.organizationId,
        },
        select: {
            id: true,
            mailboxId: true,
            fromEmail: true,
        },
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

    const activeMailboxes = await prisma.mailbox.findMany({
        where: {
            organizationId: requestContext.organizationId,
            isActive: true,
        },
        select: {
            id: true,
            email: true,
        },
        orderBy: { createdAt: "asc" },
    });

    const preferredMailbox = selectPreferredMailbox(activeMailboxes);
    const selectedMailbox = body.mailboxId
        ? activeMailboxes.find((mailbox) => mailbox.id === body.mailboxId)
        : null;

    const resolvedMailboxId = body.mailboxId === null
        ? null
        : selectedMailbox?.id ?? preferredMailbox?.id ?? existing.mailboxId;

    const resolvedFromEmail = body.fromEmail === null
        ? null
        : selectedMailbox?.email ?? preferredMailbox?.email ?? existing.fromEmail ?? body.fromEmail;

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
            mailboxId: resolvedMailboxId,
            fromName: body.fromName,
            fromEmail: resolvedFromEmail,
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

export async function DELETE(request: NextRequest) {
    const requestContext = await resolveWorkspaceRequestContext();

    if (!requestContext.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const id = getCampaignId(request);

    if (!id) {
        return NextResponse.json({ error: "Campaign id is required." }, { status: 400 });
    }

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
