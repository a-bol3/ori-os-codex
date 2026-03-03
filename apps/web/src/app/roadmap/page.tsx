'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge, Button } from '@ori-os/ui';
import { Rocket, Clock, CheckCircle2, Circle } from 'lucide-react';

const roadmap = [
    {
        quarter: 'Q1 2026',
        status: 'Released',
        items: [
            'Unified Inbox v2 (Gmail, Outlook, Slack)',
            'Advanced AI Lead Scoring',
            'SDR Workflow Automation Templates',
        ],
    },
    {
        quarter: 'Q2 2026',
        status: 'In Progress',
        items: [
            'Native CRM Enrichment (v3)',
            'Custom AI Agent Nodes for Workflows',
            'Multi-tenant Enterprise Security controls',
        ],
    },
    {
        quarter: 'Q3 2026',
        status: 'Planned',
        items: [
            'Brand Voice Content Generator',
            'Advanced Attribution for Content Ops',
            'Public API v2 with Webhook Builder',
        ],
    },
    {
        quarter: 'Q4 2026',
        status: 'Future',
        items: [
            'Predictive Market Research Tool',
            'Cross-platform Workflow Sharing',
            'Mobile App for Dashboard Access',
        ],
    },
];

export default function RoadmapPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <div className="container mx-auto px-4 py-24">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-20">
                            <Badge variant="accent" className="mb-4">Product Direction</Badge>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our <span className="gradient-text">Roadmap</span></h1>
                            <p className="text-lg text-muted-foreground">
                                See what we've built, what we're working on, and where we're going next.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {roadmap.map((phase, i) => (
                                <Card key={i} className="bg-muted/30 border-none">
                                    <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-bold">{phase.quarter}</h3>
                                            <Badge variant={phase.status === 'Released' ? 'success' : 'secondary'}>
                                                {phase.status}
                                            </Badge>
                                        </div>
                                        <ul className="space-y-4">
                                            {phase.items.map((item, j) => (
                                                <li key={j} className="flex items-start gap-3">
                                                    {phase.status === 'Released' ? (
                                                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                                                    ) : phase.status === 'In Progress' ? (
                                                        <Clock className="h-5 w-5 text-tangerine shrink-0 mt-0.5" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                                    )}
                                                    <span className="text-muted-foreground">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-20 p-8 rounded-none bg-gunmetal text-white text-center">
                            <h3 className="text-xl font-bold mb-4">Have a feature request?</h3>
                            <p className="text-white/70 mb-6">We build Ori-OS with our community. Tell us what you need next.</p>
                            <Button variant="accent">Submit Feedback</Button>
                        </div>
                    </div>
                </div>
            </main>
            <MarketingFooter />
        </div>
    );
}
