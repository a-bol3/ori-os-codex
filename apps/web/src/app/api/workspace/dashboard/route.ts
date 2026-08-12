import { NextResponse } from "next/server";

import { resolveWorkspaceRequestContext } from "@/app/api/workspace/_lib/request-context";
import { prisma } from "@/lib/prisma";
import { syncReplySignalsForOrganization } from "@/lib/engagement/reply-sync";

function startOfCurrentMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function toIsoDate(value?: Date | null) {
    return value ? value.toISOString() : null;
}

export async function GET() {
    try {
        const context = await resolveWorkspaceRequestContext();

        if (!context.organizationId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: { "Cache-Control": "no-store" } },
            );
        }

        try {
            await syncReplySignalsForOrganization(context.organizationId);
        } catch (error) {
            console.warn("[workspace-dashboard] Reply sync skipped", error);
        }

        const monthStart = startOfCurrentMonth();

        const [
            contactsTotal,
            contactsThisMonth,
            companiesTotal,
            companiesThisMonth,
            deals,
            campaigns,
            workflows,
            seoProjects,
            gdprRequests,
            latestActivities,
            latestTasks,
        ] = await Promise.all([
            prisma.contact.count({
                where: { organizationId: context.organizationId },
            }),
            prisma.contact.count({
                where: {
                    organizationId: context.organizationId,
                    createdAt: { gte: monthStart },
                },
            }),
            prisma.company.count({
                where: { organizationId: context.organizationId },
            }),
            prisma.company.count({
                where: {
                    organizationId: context.organizationId,
                    createdAt: { gte: monthStart },
                },
            }),
            prisma.deal.findMany({
                where: { organizationId: context.organizationId },
                include: {
                    stage: {
                        select: {
                            name: true,
                        },
                    },
                    company: {
                        select: {
                            name: true,
                        },
                    },
                    contact: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.campaign.findMany({
                where: { organizationId: context.organizationId },
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.workflow.findMany({
                where: { organizationId: context.organizationId },
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    runs: {
                        select: {
                            startedAt: true,
                        },
                        orderBy: {
                            startedAt: "desc",
                        },
                        take: 1,
                    },
                },
            }),
            prisma.sEOProject.count({
                where: { organizationId: context.organizationId },
            }),
            prisma.gdprRequest.count({
                where: { organizationId: context.organizationId },
            }),
            prisma.activity.findMany({
                where: { organizationId: context.organizationId },
                include: {
                    company: { select: { name: true } },
                    contact: { select: { firstName: true, lastName: true, email: true } },
                    deal: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 8,
            }),
            prisma.task.findMany({
                where: { organizationId: context.organizationId },
                include: {
                    company: { select: { name: true } },
                    contact: { select: { firstName: true, lastName: true, email: true } },
                    deal: { select: { name: true } },
                },
                orderBy: { updatedAt: "desc" },
                take: 8,
            }),
        ]);

        const sentWhere = {
            campaign: {
                organizationId: context.organizationId,
            },
            eventType: "SENT" as const,
        };
        const openedWhere = {
            campaign: {
                organizationId: context.organizationId,
            },
            eventType: "OPENED" as const,
        };

        const [sentCount, openedCount, lastSentEvent] = await Promise.all([
            prisma.emailEvent.count({ where: sentWhere }),
            prisma.emailEvent.count({ where: openedWhere }),
            prisma.emailEvent.findFirst({
                where: sentWhere,
                orderBy: { createdAt: "desc" },
                select: { createdAt: true },
            }),
        ]);

        const dealsValue = deals.reduce((sum, deal) => sum + (deal.valueAmount ?? 0), 0);
        const dealsByStageMap = new Map<string, { stage: string; count: number; value: number }>();

        for (const deal of deals) {
            const stageName = deal.stage?.name ?? "Unknown";
            const current = dealsByStageMap.get(stageName) ?? { stage: stageName, count: 0, value: 0 };
            current.count += 1;
            current.value += deal.valueAmount ?? 0;
            dealsByStageMap.set(stageName, current);
        }

        const recentActivity = [
            ...latestActivities.map((activity) => {
                const linkedName =
                    activity.deal?.name ??
                    activity.company?.name ??
                    `${activity.contact?.firstName ?? ""} ${activity.contact?.lastName ?? ""}`.trim() ??
                    activity.contact?.email ??
                    "Workspace record";

                return {
                    id: `activity-${activity.id}`,
                    title: activity.subject?.trim() || `${activity.type} logged`,
                    description: linkedName,
                    time: activity.createdAt.toISOString(),
                    type: activity.dealId ? "deal" : activity.contactId ? "contact" : "activity",
                };
            }),
            ...latestTasks.map((task) => ({
                id: `task-${task.id}`,
                title: `Task ${task.status === "completed" ? "completed" : "updated"}: ${task.title}`,
                description:
                    task.description?.trim() ||
                    task.company?.name ||
                    task.deal?.name ||
                    `${task.contact?.firstName ?? ""} ${task.contact?.lastName ?? ""}`.trim() ||
                    task.contact?.email ||
                    "No description provided.",
                time: task.updatedAt.toISOString(),
                type: "task",
            })),
        ]
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 12);

        const contactGrowth = contactsTotal > contactsThisMonth
            ? Math.round((contactsThisMonth / Math.max(contactsTotal - contactsThisMonth, 1)) * 100)
            : contactsThisMonth > 0
                ? 100
                : 0;

        return NextResponse.json(
            {
                contacts: {
                    total: contactsTotal,
                    thisMonth: contactsThisMonth,
                    growth: contactGrowth,
                },
                companies: {
                    total: companiesTotal,
                    thisMonth: companiesThisMonth,
                    growth: companiesThisMonth,
                },
                deals: {
                    total: deals.length,
                    value: dealsValue,
                    byStage: Array.from(dealsByStageMap.values()),
                },
                campaigns: {
                    total: campaigns.length,
                    active: campaigns.filter((campaign) => campaign.status === "RUNNING").length,
                    sent: sentCount,
                    opened: openedCount,
                    lastSendDate: toIsoDate(lastSentEvent?.createdAt),
                },
                workflows: {
                    total: workflows.length,
                    active: workflows.filter((workflow) => workflow.status === "active").length,
                    runs: workflows.reduce((sum, workflow) => sum + workflow.runs.length, 0),
                    lastRunDate: toIsoDate(
                        workflows
                            .flatMap((workflow) => workflow.runs.map((run) => run.startedAt))
                            .sort((a, b) => b.getTime() - a.getTime())[0],
                    ),
                },
                seo: {
                    projects: seoProjects,
                },
                compliance: {
                    gdprRequests,
                },
                recentActivity,
            },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (error) {
        console.error("[workspace-dashboard] Failed to build dashboard payload", error);
        return NextResponse.json(
            { error: "Failed to load dashboard" },
            { status: 500, headers: { "Cache-Control": "no-store" } },
        );
    }
}
