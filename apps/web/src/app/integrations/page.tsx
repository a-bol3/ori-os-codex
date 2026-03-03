'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { Search, Puzzle, Send, Zap, ChevronRight, Layout, Database, MessageSquare } from 'lucide-react';

const integrationCategories = ['All', 'CRM', 'Marketing', 'Collaboration', 'Dev Tools', 'Sales Desk'];

const platforms = [
    { name: 'Salesforce', category: 'CRM', description: 'Sync leads and contacts automatically.', icon: Database },
    { name: 'HubSpot', category: 'CRM', description: 'Deep bidirectional data synchronization.', icon: Database },
    { name: 'Slack', category: 'Collaboration', description: 'Real-time alerts for lead activity.', icon: MessageSquare },
    { name: 'GitHub', category: 'Dev Tools', description: 'Connect engineering and sales data.', icon: Zap },
    { name: 'Gmail', category: 'Sales Desk', description: 'Native email sequencing from your inbox.', icon: Send },
    { name: 'Notion', category: 'Collaboration', description: 'Export your enriched lists to Notion.', icon: Layout },
];

export default function IntegrationsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-coffee-bean text-white text-center">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Sync with your <span className="text-tangerine">stack</span></h1>
                        <p className="text-xl text-white/70 mb-10">
                            Connect Ori-OS with the tools you already use. Deep, native integrations built for scale.
                        </p>
                        <div className="relative max-w-xl mx-auto">
                            <Input
                                placeholder="Search for an integration..."
                                className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                icon={<Search className="h-5 w-5 text-white/60" />}
                            />
                        </div>
                    </div>
                </section>

                <section className="py-16 border-b border-border bg-muted/20">
                    <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-3 justify-center min-w-max">
                            {integrationCategories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={cat === 'All' ? 'accent' : 'ghost'}
                                    className="rounded-none px-6"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {platforms.map((p, i) => (
                                <Card key={i} hover="lift" className="group cursor-pointer">
                                    <CardContent className="p-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="p-4 rounded-none bg-muted group-hover:bg-tangerine/10 transition-colors">
                                                <p.icon className="h-8 w-8 text-foreground group-hover:text-tangerine transition-colors" />
                                            </div>
                                            <Badge variant="secondary">{p.category}</Badge>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                                        <p className="text-muted-foreground text-sm mb-6">{p.description}</p>
                                        <Button variant="ghost" className="p-0 h-auto font-semibold hover:bg-transparent group/btn">
                                            Setup Guide
                                            <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-muted/10 border-t border-border">
                    <div className="container mx-auto px-4 text-center max-w-3xl">
                        <h2 className="text-3xl font-bold mb-6">Can't find what you need?</h2>
                        <p className="text-lg text-muted-foreground mb-10">
                            Build your own integrations with our robust API or connect via Zapier.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="outline" size="lg">Explore API Docs</Button>
                            <Button variant="accent" size="lg">Connect with Zapier</Button>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}

function Input({ className, icon, ...props }: any) {
    return (
        <div className="relative w-full">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                className={cn(
                    "flex h-10 w-full rounded-none border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tangerine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    className
                )}
                {...props}
            />
        </div>
    );
}

import { cn } from '@ori-os/ui';
