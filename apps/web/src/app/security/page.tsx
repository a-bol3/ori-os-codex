'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { Shield, Lock, Server, Users, CheckCircle2, Eye, ShieldCheck } from 'lucide-react';

const coreSecurity = [
    {
        title: 'Data Encryption',
        description: 'All data is encrypted at rest using AES-256 and in transit using TLS 1.3.',
        icon: Lock,
    },
    {
        title: 'SOC 2 Type II',
        description: 'We are SOC 2 compliant, ensuring the highest standards of security and availability.',
        icon: ShieldCheck,
    },
    {
        title: 'Global Infrastructure',
        description: 'Built on world-class infrastructure providers with multi-region redundancy.',
        icon: Server,
    },
    {
        title: 'RBAC & SSO',
        description: 'Granular access controls and SAML-based single sign-on for enterprise security.',
        icon: Users,
    },
];

export default function SecurityPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-gunmetal text-white text-center">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Badge variant="accent" className="mb-6">Enterprise Grade</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Built with <span className="text-tangerine">security</span> at the core</h1>
                        <p className="text-xl text-white/70">
                            We understand that your data is your most valuable asset. We protect it like it's our own.
                        </p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {coreSecurity.map((s, i) => (
                                <Card key={i} className="bg-muted/30 border-none">
                                    <CardContent className="p-8 flex gap-6">
                                        <div className="p-4 rounded-none bg-background w-fit h-fit shrink-0">
                                            <s.icon className="h-8 w-8 text-tangerine" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                                            <p className="text-muted-foreground">{s.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-muted/20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="text-3xl font-bold text-center mb-12">Security Certifications & Compliance</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {['SOC 2 Type II', 'GDPR Compliant', 'HIPAA Ready', 'CCPA Compliant'].map((item) => (
                                <div key={item} className="flex flex-col items-center gap-4 text-center">
                                    <div className="h-20 w-20 rounded-none bg-background flex items-center justify-center border border-tangerine/20 border-dashed">
                                        <CheckCircle2 className="h-8 w-8 text-tangerine" />
                                    </div>
                                    <span className="font-semibold text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <h2 className="text-3xl font-bold mb-6">Found a security issue?</h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            We take security concerns seriously. If you've found a vulnerability, please report it to our security team.
                        </p>
                        <Button variant="accent" size="lg">Report Vulnerability</Button>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
