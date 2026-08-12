import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const enrichedSession = session as typeof session & {
        accessToken?: string;
        organizationId?: string;
    };

    if (!enrichedSession.accessToken || !enrichedSession.organizationId) {
        redirect("/login?reason=missing-session");
    }

    return <AppShell>{children}</AppShell>;
}
