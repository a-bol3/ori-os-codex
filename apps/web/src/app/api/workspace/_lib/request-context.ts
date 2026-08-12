import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type WorkspaceRequestContext = {
    organizationId?: string;
    email?: string;
    userId?: string;
};

export async function resolveWorkspaceRequestContext(): Promise<WorkspaceRequestContext> {
    try {
        const session = await auth();
        const sessionOrganizationId =
            typeof (session as { organizationId?: unknown } | null)?.organizationId === "string"
                ? (session as { organizationId?: string }).organizationId
                : undefined;
        const email = typeof session?.user?.email === "string" ? session.user.email : undefined;
        const userId = typeof session?.user?.id === "string" ? session.user.id : undefined;

        if (sessionOrganizationId) {
            return { organizationId: sessionOrganizationId, email, userId };
        }

        if (!email) {
            return { organizationId: undefined, email: undefined, userId };
        }

        // If the session does not carry an explicit organization, prefer the most
        // recently created membership instead of the oldest one. The oldest entry
        // can belong to stale test workspaces and silently route requests to the
        // wrong tenant.
        const membership = await prisma.organizationMembership.findFirst({
            where: {
                user: {
                    email,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                organizationId: true,
                userId: true,
            },
        });

        return {
            organizationId: membership?.organizationId,
            email,
            userId: userId ?? membership?.userId,
        };
    } catch (error) {
        console.error("[workspace-context] Failed to resolve workspace request context", error);
        return {
            organizationId: undefined,
            email: undefined,
            userId: undefined,
        };
    }
}
