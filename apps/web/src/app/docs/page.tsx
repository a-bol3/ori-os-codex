'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { Search, Book, Code, HelpCircle, Terminal, Cpu, Globe, ArrowRight } from 'lucide-react';

const docCategories = [
    {
        title: 'Platform Guides',
        icon: Book,
        description: 'Learn how to use CRM, Intelligence, and Automations.',
        links: ['Onboarding', 'Data Enrichment', 'Sequence Management', 'Team Permissions'],
    },
    {
        title: 'API Reference',
        icon: Terminal,
        description: 'Build custom tools and integrations with our API.',
        links: ['Authentication', 'Core Endpoints', 'Webhooks', 'SDKs'],
    },
    {
        title: 'Workflows',
        icon: Cpu,
        description: 'Advanced automation patterns and best practices.',
        links: ['Lead Scoring', 'Auto-Followups', 'Data Hygiene', 'Custom Actions'],
    },
    {
        title: 'Resources',
        icon: Globe,
        description: 'Case studies, templates, and community guides.',
        links: ['Sales Playbooks', 'Email Templates', 'Enrichment FAQ', 'System Status'],
    },
];

export default function DocsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-coffee-bean text-white">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <Badge variant="accent" className="mb-4">Documentation</Badge>
                                <h1 className="text-4xl md:text-6xl font-bold mb-6">Expertise at your <span className="text-tangerine">fingertips</span></h1>
                                <p className="text-xl text-white/70 mb-10">
                                    Everything you need to master Ori-OS and transform your sales engine.
                                </p>
                                <div className="relative">
                                    <input
                                        className="w-full h-14 pl-12 pr-4 rounded-none bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-tangerine focus:outline-none transition-all"
                                        placeholder="Search documentation..."
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="p-8 rounded-none bg-gunmetal/50 border border-white/10 backdrop-blur-xl">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="h-3 w-3 rounded-none bg-red-500" />
                                        <div className="h-3 w-3 rounded-none bg-yellow-500" />
                                        <div className="h-3 w-3 rounded-none bg-green-500" />
                                    </div>
                                    <div className="space-y-4 font-mono text-sm">
                                        <div className="text-tangerine">$ npm install @ori-os/sdk</div>
                                        <div className="text-white/60">// Initialize client</div>
                                        <div className="text-white">
                                            const client = new OriClient(API_KEY);<br />
                                            await client.leads.enrich('acme.com');
                                        </div>
                                        <div className="text-green-500">{`{ "status": "success", "data": { ... } }`}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {docCategories.map((cat, i) => (
                                <Card key={i} className="group border-none bg-muted/30">
                                    <CardContent className="p-8">
                                        <div className="flex items-start gap-6">
                                            <div className="p-4 rounded-none bg-background w-fit shrink-0 group-hover:bg-tangerine/10 transition-colors">
                                                <cat.icon className="h-8 w-8 text-foreground group-hover:text-tangerine transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                                                <p className="text-muted-foreground text-sm mb-6">{cat.description}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {cat.links.map((link) => (
                                                        <a
                                                            key={link}
                                                            href="#"
                                                            className="text-sm text-foreground hover:text-tangerine flex items-center gap-1 group/link"
                                                        >
                                                            {link}
                                                            <ArrowRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-muted/20 border-t border-border">
                    <div className="container mx-auto px-4 text-center max-w-3xl">
                        <h2 className="text-3xl font-bold mb-6">Still have questions?</h2>
                        <p className="text-lg text-muted-foreground mb-10">
                            Our support engineers are available 24/7 to help you with technical integration.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="accent" size="lg">Contact Support</Button>
                            <Button variant="outline" size="lg">Join Discord</Button>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
