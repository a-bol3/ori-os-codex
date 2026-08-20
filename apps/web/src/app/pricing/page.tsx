import Link from "next/link";
import { Button } from "@ori-os/ui";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <MarketingHeader />
            <main className="flex flex-1 items-center justify-center px-6 pt-24 text-center">
                <div className="max-w-xl space-y-6">
                    <p className="text-sm font-medium text-tangerine">Private beta</p>
                    <h1 className="text-4xl font-bold">Public pricing is not available yet</h1>
                    <p className="text-muted-foreground">
                        Billing and entitlement controls are being validated before any public plan or trial is offered.
                    </p>
                    <Button variant="accent" asChild><Link href="/login">Sign in</Link></Button>
                </div>
            </main>
            <MarketingFooter />
        </div>
    );
}
