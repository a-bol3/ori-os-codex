import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function GDPRPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <MarketingHeader />
            <main className="flex-1 container mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold mb-8">GDPR Compliance</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="lead">
                        We are committed to protecting your data and complying with the General Data Protection Regulation (GDPR).
                    </p>

                    <h2>Your Rights</h2>
                    <ul>
                        <li>Right to access your data</li>
                        <li>Right to rectification</li>
                        <li>Right to erasure ("Right to be forgotten")</li>
                        <li>Right to restrict processing</li>
                        <li>Right to data portability</li>
                        <li>Right to object</li>
                    </ul>

                    <h2>Data Processing</h2>
                    <p>
                        We process data only for legitimate business purposes and with your consent where required.
                        All data is stored securely within the EU or in compliance with EU data transfer mechanisms.
                    </p>

                    <h2>Contact Us</h2>
                    <p>
                        For any GDPR-related inquiries or to exercise your rights, please contact our Data Protection Officer at:
                        <br />
                        <a href="mailto:privacy@ori-craftlabs.com" className="text-blue-600 hover:underline">privacy@ori-craftlabs.com</a>
                    </p>
                </div>
            </main>
            <MarketingFooter />
        </div>
    );
}
