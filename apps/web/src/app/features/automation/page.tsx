'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { GitBranch, Zap, Cpu, Settings, CheckCircle2, Sparkles } from 'lucide-react';

export default function AutomationFeaturePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-gunmetal text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-noise opacity-10" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl">
                            <Badge variant="accent" className="mb-6">Automations</Badge>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">Put your growth on <span className="text-tangerine">autopilot</span></h1>
                            <p className="text-xl text-white/70 mb-10">
                                Build complex workflows in minutes with our visual builder. No code required, just pure logic.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" variant="accent">Build First Workflow</Button>
                                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10">View Templates</Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Visual Workflow Builder',
                                    description: 'Drag and drop nodes to create sophisticated multi-step logic.',
                                    icon: GitBranch,
                                },
                                {
                                    title: 'Ready-made Recipes',
                                    description: 'Choose from 100+ templates for common sales and marketing tasks.',
                                    icon: Sparkles,
                                },
                                {
                                    title: 'Real-time Execution',
                                    description: 'Zero latency triggers and instant feedback on your automations.',
                                    icon: Zap,
                                },
                            ].map((feature, i) => (
                                <Card key={i} variant="outline" className="border-none shadow-none">
                                    <CardContent className="p-0">
                                        <div className="p-3 rounded-none bg-tangerine/10 w-fit mb-6">
                                            <feature.icon className="h-6 w-6 text-tangerine" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Design logic that scales</h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    From simple "if this then that" to complex conditional branching with AI decision-making. Ori-OS handles the heavy lifting.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        'Conditional branching and multi-path logic',
                                        'Wait periods and scheduled triggers',
                                        'AI-agent nodes for natural language processing',
                                        'Webhook support for custom integrations',
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-tangerine" />
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="accent" size="lg">Start Building</Button>
                            </div>
                            <div className="aspect-square bg-gunmetal rounded-none border border-white/10 flex items-center justify-center p-8">
                                <Cpu className="h-32 w-32 text-white/10" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
