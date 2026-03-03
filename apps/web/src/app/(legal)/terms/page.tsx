export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <p className="text-sm text-muted-foreground mb-8">Last Updated: February 9, 2026</p>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using ORI-OS ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                            If you do not agree to these Terms of Service, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p>
                            ORI-OS provides a comprehensive sales engagement platform including CRM, email automation, deliverability monitoring,
                            AI-powered lead discovery, and campaign management tools. The Service is provided on a subscription basis.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                        <p>You are responsible for:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Notifying us immediately of any unauthorized use</li>
                            <li>Ensuring your use complies with applicable laws and regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
                        <p>You agree NOT to use the Service to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Send spam or unsolicited commercial emails</li>
                            <li>Violate any applicable laws, including CAN-SPAM, GDPR, or CASL</li>
                            <li>Transmit malware, viruses, or harmful code</li>
                            <li>Impersonate others or misrepresent your affiliation</li>
                            <li>Interfere with or disrupt the Service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Subscription and Billing</h2>
                        <p>
                            Subscriptions are billed monthly or annually as selected. You authorize us to charge your payment method for all fees.
                            Subscriptions automatically renew unless cancelled before the renewal date. Refunds are provided at our discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Data and Privacy</h2>
                        <p>
                            Your use of the Service is also governed by our Privacy Policy. We collect, use, and protect your data as described in that policy.
                            You retain ownership of your data and can export or delete it at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
                        <p>
                            The Service, including all content, features, and functionality, is owned by ORI-OS and is protected by copyright, trademark,
                            and other intellectual property laws. You may not copy, modify, or distribute any part of the Service without our permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your access to the Service at any time for violations of these Terms.
                            You may cancel your subscription at any time through your account settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                        <p>
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                            SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify you of material changes via email or through the Service.
                            Continued use after changes constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
                        <p>
                            For questions about these Terms, please contact us at: <a href="mailto:legal@ori-os.com" className="text-primary hover:underline">legal@ori-os.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
