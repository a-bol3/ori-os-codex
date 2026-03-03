
import { DomainMailboxWizard } from '@/components/deliverability/DomainMailboxWizard';

export default function DeliverabilitySetupPage() {
    return (
        <div className="container max-w-4xl py-10">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Setup Sending Infrastructure</h1>
                <p className="mt-2 text-muted-foreground">
                    Configure your domains and mailboxes to ensure high deliverability and avoid spam filters.
                </p>
            </div>

            <DomainMailboxWizard />
        </div>
    );
}
