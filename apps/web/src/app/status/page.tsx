'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge } from '@ori-os/ui';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Database, Zap, Globe } from 'lucide-react';

const systems = [
    { name: 'Core API', status: 'Operational', uptime: '99.99%', icon: Zap },
    { name: 'Data Enrichment Engine', status: 'Operational', uptime: '99.95%', icon: Database },
    { name: 'Workflow Execution', status: 'Operational', uptime: '100%', icon: Globe },
    { name: 'Marketing Website', status: 'Operational', uptime: '100%', icon: ShieldCheck },
];

const incidents = [
    { date: 'Jan 28, 2026', title: 'Data Enrichment Latency', status: 'Resolved', duration: '14 mins' },
    { date: 'Dec 12, 2025', title: 'Scheduled Database Maintenance', status: 'Completed', duration: '2 hours' },
];

export default function StatusPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <div className="container mx-auto px-4 py-24">
                    <div className="max-w-4xl mx-auto">
                        <div className="p-6 rounded-none bg-success/10 border border-success/20 flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="h-4 w-4 rounded-none bg-success animate-pulse" />
                                <h1 className="text-xl font-bold text-success">All Systems Operational</h1>
                            </div>
                            <span className="text-sm text-success/70 font-medium">As of Feb 1, 2026 - 15:42 UTC</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                            {systems.map((s, i) => (
                                <Card key={i} className="border-none bg-muted/30">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded bg-background">
                                                <s.icon className="h-5 w-5 text-foreground" />
                                            </div>
                                            <div>
                                                <div className="font-bold">{s.name}</div>
                                                <div className="text-xs text-muted-foreground">Uptime: {s.uptime}</div>
                                            </div>
                                        </div>
                                        <Badge variant="success">{s.status}</Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <section>
                            <h2 className="text-2xl font-bold mb-6">Incident History</h2>
                            <div className="space-y-4">
                                {incidents.map((inc, i) => (
                                    <div key={i} className="p-6 rounded-none border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">{inc.date}</div>
                                            <h3 className="font-bold text-lg">{inc.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-4 w-4" /> {inc.duration}
                                            </div>
                                            <Badge variant="secondary">{inc.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="mt-16 text-center">
                            <p className="text-muted-foreground text-sm">
                                Real-time monitoring provided by Ori-OS Analytics.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <MarketingFooter />
        </div>
    );
}
