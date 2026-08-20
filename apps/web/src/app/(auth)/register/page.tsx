import Link from "next/link";
import { Button } from "@ori-os/ui";

export default function RegisterPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <p className="text-sm font-medium text-tangerine">Private beta</p>
                <h1 className="text-2xl font-bold text-foreground">ORI-OS is currently invite-only</h1>
                <p className="text-muted-foreground">
                    We are onboarding a limited number of organizations while the private beta is validated.
                    Ask your workspace administrator for an invitation.
                </p>
            </div>
            <Button variant="accent" asChild>
                <Link href="/login">Sign in</Link>
            </Button>
        </div>
    );
}
