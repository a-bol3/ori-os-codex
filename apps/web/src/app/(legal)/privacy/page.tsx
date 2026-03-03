export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mb-8">Last Updated: February 9, 2026</p>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p>
                            ORI-OS ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect,
                            use, disclose, and safeguard your information when you use our sales engagement platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <h3 className="text-xl font-semibold mb-3 mt-4">Account Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Name, email address, and company information</li>
                            <li>Billing and payment information (processed securely via Stripe)</li>
                            <li>Account preferences and settings</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 mt-4">Usage Data</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Contact and company data you upload to the CRM</li>
                            <li>Email campaign data and engagement metrics</li>
                            <li>Log data including IP addresses, browser type, and access times</li>
                            <li>Feature usage and interaction patterns</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <p>We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, maintain, and improve the Service</li>
                            <li>Process payments and manage subscriptions</li>
                            <li>Send transactional emails and service notifications</li>
                            <li>Provide customer support and respond to inquiries</li>
                            <li>Analyze usage patterns to enhance user experience</li>
                            <li>Detect and prevent fraud or security issues</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
                        <p>We do NOT sell your personal information. We may share data with:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Service Providers:</strong> Stripe (payments), AWS (hosting), OpenAI (AI features)</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Your Rights (GDPR & CCPA)</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                            <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                            <li><strong>Objection:</strong> Opt-out of certain data processing activities</li>
                            <li><strong>Restriction:</strong> Limit how we use your data</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, contact us at <a href="mailto:privacy@ori-os.com" className="text-primary hover:underline">privacy@ori-os.com</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
                        <p>
                            We retain your data for as long as your account is active or as needed to provide services.
                            After account deletion, we may retain certain data for legal compliance, fraud prevention, or dispute resolution.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Security</h2>
                        <p>
                            We implement industry-standard security measures including encryption, access controls, and regular security audits.
                            However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
                        <p>
                            We use cookies and similar technologies to improve user experience, analyze usage, and provide personalized content.
                            You can control cookie preferences through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
                        <p>
                            Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards
                            are in place to protect your data in accordance with this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
                        <p>
                            Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Service.
                            Your continued use after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                        <p>
                            For privacy-related questions or to exercise your rights, contact us at:
                        </p>
                        <p className="mt-2">
                            Email: <a href="mailto:privacy@ori-os.com" className="text-primary hover:underline">privacy@ori-os.com</a><br />
                            Address: ORI-OS, Inc., [Your Address]
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
