'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { Search, Sparkles, Building2, Zap, Target, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function IntelligenceFeaturePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-gunmetal text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-noise opacity-10" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl">
                            <Badge variant="accent" className="mb-6">Intelligence</Badge>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">Find your <span className="text-tangerine">next customer</span> with AI</h1>
                            <p className="text-xl text-white/70 mb-10">
                                Access over 275M+ contacts and 65M+ companies. Enrich your data instantly with proprietary AI models.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" variant="accent">Start Searching Free</Button>
                                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10">Book a Demo</Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Global Database',
                                    description: 'Verified emails and direct dials for professionals around the world.',
                                    icon: Globe,
                                },
                                {
                                    title: 'Intent Data',
                                    description: 'See which companies are researching your solution in real-time.',
                                    icon: Target,
                                },
                                {
                                    title: 'AI Enrichment',
                                    description: 'Automatically clean and append 50+ data points to any lead.',
                                    icon: Sparkles,
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
                                <h2 className="text-3xl font-bold mb-6">Precision targeting at scale</h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Stop wasting time on bad data. Our multi-step verification process ensures that 95% of our emails are deliverable.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        'Search by job title, location, industry, and revenue',
                                        'Filter by technology stack and hiring intent',
                                        'Save searches and get alerts for new matches',
                                        'Export to CRM or CSV in one click',
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-tangerine" />
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="accent" size="lg">Explore the Database</Button>
                            </div>
                            <div className="aspect-square bg-gunmetal rounded-none border border-white/10 flex items-center justify-center p-8">
                                <Search className="h-32 w-32 text-white/10" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
