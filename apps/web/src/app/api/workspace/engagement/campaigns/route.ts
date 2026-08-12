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

export async function GET() {
    const context = await resolveWorkspaceRequestContext();

    if (!context.organizationId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    await syncReplySignalsForOrganization(context.organizationId);

    const campaigns = await prisma.campaign.findMany({
        where: { organizationId: context.organizationId },
        include: {
            sequenceSteps: { orderBy: { order: "asc" } },
            _count: { select: { recipients: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const payload = await Promise.all(
        campaigns.map(async (campaign) => {
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

            return {
                ...campaign,
                sent,
                opened,
                replies,
            };
        }),
    );

    return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store" },
    });
}

export async function POST(request: NextRequest) {
    const context = await resolveWorkspaceRequestContext();

    if (!context.organizationId || !context.userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
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

    if (!body.name?.trim()) {
        return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
    }

    const activeMailboxes = await prisma.mailbox.findMany({
        where: {
            organizationId: context.organizationId,
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

    const resolvedMailboxId = selectedMailbox?.id ?? preferredMailbox?.id ?? null;
    const resolvedFromEmail = selectedMailbox?.email ?? preferredMailbox?.email ?? null;

    if (!resolvedMailboxId) {
        return NextResponse.json(
            {
                error: "Selected mailbox is not available.",
                message: "Choose an active sending mailbox from your workspace before launching the campaign.",
            },
            { status: 400, headers: { "Cache-Control": "no-store" } },
        );
    }

    const sequenceSteps = body.sequenceSteps?.length
        ? body.sequenceSteps.map((step) => ({
            order: step.order,
            stepType: step.stepType,
            configJson: step.configJson as any,
            templateId: step.templateId ?? null,
        }))
        : undefined;

    try {
        const campaign = await prisma.campaign.create({
            data: {
                organizationId: context.organizationId,
                createdBy: context.userId,
                name: body.name.trim(),
                status: body.status ?? "DRAFT",
                objective: body.objective ?? null,
                mailboxId: resolvedMailboxId,
                fromName: body.fromName ?? null,
                fromEmail: body.fromEmail ?? resolvedFromEmail,
                replyTo: body.replyTo ?? null,
                sendWindowJson: body.sendWindowJson as any,
                sequenceSteps: sequenceSteps?.length
                    ? {
                        create: sequenceSteps,
                    }
                    : undefined,
            },
            include: {
                sequenceSteps: { orderBy: { order: "asc" } },
                _count: { select: { recipients: true } },
            },
        });

        return NextResponse.json(
            {
                ...campaign,
                sent: 0,
                replies: 0,
            },
            { status: 201, headers: { "Cache-Control": "no-store" } },
        );
    } catch (error) {
        console.error("[workspace/engagement/campaigns] create failed", error);

        return NextResponse.json(
            {
                error: "Campaign creation failed.",
                message: "The campaign could not be created with the selected sending setup. Refresh the page and choose a valid active mailbox.",
            },
            { status: 400, headers: { "Cache-Control": "no-store" } },
        );
    }
}
