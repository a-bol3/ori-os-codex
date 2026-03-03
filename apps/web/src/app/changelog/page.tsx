'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { CheckCircle2, Clock, Zap, ArrowRight, User, Rocket } from 'lucide-react';

const releases = [
    {
        version: 'v2.4.0',
        date: 'February 1, 2026',
        title: 'Unified Sales Toolbox',
        description: 'Major update bringing unified sequence tracking and AI-powered lead scoring.',
        highlights: [
            'Cross-channel sequence analytics',
            'Proprietary lead scoring model',
            'Native Salesforce integration v2',
            'Enhanced data enrichment for EU markets',
        ],
        type: 'Major Release',
    },
    {
        version: 'v2.3.5',
        date: 'January 15, 2026',
        title: 'Performance & API Improvements',
        description: 'Focused on speed and developer experience.',
        highlights: [
            '50% faster contact search',
            'New API endpoints for bulk enrichment',
            'Rate limiting updates',
            'Dashboard load time optimizations',
        ],
        type: 'Maintenance',
    },
    {
        version: 'v2.3.0',
        date: 'December 20, 2025',
        title: 'Automation Builder v2',
        description: 'New drag-and-drop workspace for building complex workflows.',
        highlights: [
            'Conditional branching logic',
            'Custom webhook triggers',
            'Slack & MS Teams actions',
            'Error handling and retry policies',
        ],
        type: 'Major Release',
    },
];

export default function ChangelogPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <div className="container mx-auto px-4 py-24">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-20">
                            <Badge variant="accent" className="mb-4">Internal Log</Badge>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">What's <span className="gradient-text">new</span>?</h1>
                            <p className="text-lg text-muted-foreground">
                                Updates, improvements, and new features shipped by the Ori-OS team.
                            </p>
                        </div>

                        <div className="space-y-24 relative">
                            {/* Line */}
                            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border hidden md:block" />

                            {releases.map((release, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="relative flex flex-col md:flex-row gap-8 md:gap-16"
                                >
                                    {/* Circle on line */}
                                    <div className="absolute left-0 top-0 h-10 w-10 rounded-none bg-background border-2 border-tangerine flex items-center justify-center z-10 hidden md:flex">
                                        <Zap className="h-5 w-5 text-tangerine" />
                                    </div>

                                    <div className="md:ml-12 flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                                            <span className="text-sm font-mono text-tangerine bg-tangerine/10 px-2 py-1 rounded">{release.version}</span>
                                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {release.date}
                                            </span>
                                            <Badge variant="secondary" className="w-fit">{release.type}</Badge>
                                        </div>

                                        <h2 className="text-2xl font-bold mb-4">{release.title}</h2>
                                        <p className="text-muted-foreground mb-8 text-lg">
                                            {release.description}
                                        </p>

                                        <Card className="border-none bg-muted/30">
                                            <CardContent className="p-6">
                                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                                    <Rocket className="h-4 w-4 text-tangerine" />
                                                    Release Highlights
                                                </h4>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {release.highlights.map((h, j) => (
                                                        <li key={j} className="flex items-start gap-3">
                                                            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                                                            <span className="text-sm text-muted-foreground">{h}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-24 pt-24 border-t border-border text-center">
                            <h3 className="text-2xl font-bold mb-6">Never miss an update</h3>
                            <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
                                Subscribe to our product updates newsletter to stay in the loop with the latest GTM strategies and tool enhancements.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                                <input
                                    className="flex-1 h-12 px-4 rounded-none border border-border bg-background text-sm focus:ring-2 focus:ring-tangerine focus:outline-none"
                                    placeholder="Enter your email"
                                />
                                <Button variant="accent" size="lg">Subscribe</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <MarketingFooter />
        </div>
    );
}
