'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { BarChart3, PieChart, TrendingUp, Target, CheckCircle2, MousePointer2 } from 'lucide-react';

export default function AnalyticsFeaturePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-gunmetal text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-noise opacity-10" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl">
                            <Badge variant="accent" className="mb-6">Analytics</Badge>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">Turn data into <span className="text-tangerine">growth</span></h1>
                            <p className="text-xl text-white/70 mb-10">
                                Deep insights into every part of your funnel. From first touch to closed won, see what's actually driving revenue.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" variant="accent">See Your Data</Button>
                                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10">View Demo Dashboards</Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Funnel Optimization',
                                    description: 'Identify bottlenecks in your sales process with granular funnel views.',
                                    icon: Target,
                                },
                                {
                                    title: 'Rep Performance',
                                    description: 'Compare team productivity and outcome metrics in real-time.',
                                    icon: TrendingUp,
                                },
                                {
                                    title: 'Custom Dashboards',
                                    description: 'Build the reporting views you need with our intuitive widget builder.',
                                    icon: PieChart,
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
                                <h2 className="text-3xl font-bold mb-6">Decisions backed by evidence</h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    No more guessing. Ori-OS provides the clarity you need to allocate budget and resources where they'll have the most impact.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        'Multi-touch attribution models',
                                        'Real-time revenue and pipeline forecasting',
                                        'Cohort analysis for customer retention',
                                        'Automated weekly reporting via Slack and Email',
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-tangerine" />
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="accent" size="lg">Explore Analytics</Button>
                            </div>
                            <div className="aspect-square bg-gunmetal rounded-none border border-white/10 flex items-center justify-center p-8">
                                <BarChart3 className="h-32 w-32 text-white/10" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
