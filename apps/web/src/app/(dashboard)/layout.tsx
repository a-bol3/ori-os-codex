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

    const enrichedSession = session as typeof session & { organizationId?: string };

    if (!enrichedSession.organizationId) {
        redirect("/login?reason=missing-session");
    }

    return <AppShell>{children}</AppShell>;
}
