'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { Search, Building2, Zap, Target, Globe, ArrowRight, CheckCircle2, Layout, Inbox, BarChart3, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        title: 'Intelligence',
        description: 'Global database with 270M+ records and real-time AI enrichment.',
        icon: Search,
        href: '/features/intelligence',
    },
    {
        title: 'Unified CRM',
        description: 'A relationship hub that automates data entry and activity logging.',
        icon: Building2,
        href: '/features/crm',
    },
    {
        title: 'Automation',
        description: 'Visual workflow builder for complex go-to-market logic.',
        icon: Zap,
        href: '/features/automation',
    },
    {
        title: 'Engagement',
        description: 'Multi-channel outreach with AI-powered personalization.',
        icon: Inbox,
        href: '/features/engagement',
    },
    {
        title: 'Analytics',
        description: 'Full-funnel attribution and predictive revenue forecasting.',
        icon: BarChart3,
        href: '/features/analytics',
    },
    {
        title: 'Content Studio',
        description: 'AI-powered content operations for high-velocity teams.',
        icon: Sparkles,
        href: '/features/content',
    },
];

export default function FeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-coffee-bean text-white text-center">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Badge variant="accent" className="mb-6">The Platform</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Everything you need to <span className="text-tangerine">scale</span></h1>
                        <p className="text-xl text-white/70">
                            A unified operating system for your sales, marketing, and success teams.
                        </p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((f, i) => (
                                <Link key={i} href={f.href}>
                                    <Card hover="lift" className="bg-muted/30 border-none cursor-pointer group">
                                        <CardContent className="p-8">
                                            <div className="p-4 rounded-none bg-background w-fit mb-6 group-hover:bg-tangerine/10 transition-colors">
                                                <f.icon className="h-8 w-8 text-foreground group-hover:text-tangerine transition-colors" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                            <p className="text-muted-foreground mb-6">{f.description}</p>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-tangerine">
                                                Explore {f.title} <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-gunmetal text-white">
                    <div className="container mx-auto px-4 text-center max-w-3xl">
                        <h2 className="text-3xl font-bold mb-6">Built for the future of work</h2>
                        <p className="text-lg text-white/70 mb-10">
                            Ori-OS replaces 5+ disconnected tools with a single integrated workspace. Save time, reduce costs, and accelerate your growth.
                        </p>
                        <Button variant="accent" size="lg">Schedule a Platform Tour</Button>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
