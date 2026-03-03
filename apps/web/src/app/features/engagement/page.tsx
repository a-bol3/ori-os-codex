'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { Mail, Send, MessageSquare, Phone, CheckCircle2, Inbox } from 'lucide-react';

export default function EngagementFeaturePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-coffee-bean text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-noise opacity-10" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl">
                            <Badge variant="accent" className="mb-6">Engagement</Badge>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">Connect with <span className="text-tangerine">every prospect</span></h1>
                            <p className="text-xl text-white/70 mb-10">
                                Launch multi-channel outreach campaigns that actually get replies. Email, LinkedIn, and phone—all in one place.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" variant="accent">Launch Campaign</Button>
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
                                    title: 'Email Sequences',
                                    description: 'Hyper-personalized automated follow-ups at scale.',
                                    icon: Mail,
                                },
                                {
                                    title: 'Unified Inbox',
                                    description: 'Manage every conversation from every channel in one view.',
                                    icon: Inbox,
                                },
                                {
                                    title: 'Multi-channel Flow',
                                    description: 'Combine email, social, and phone tasks for maximum impact.',
                                    icon: Send,
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
                            <div className="order-2 lg:order-1 aspect-square bg-gunmetal rounded-none border border-white/10 flex items-center justify-center p-8">
                                <MessageSquare className="h-32 w-32 text-white/10" />
                            </div>
                            <div className="order-1 lg:order-2">
                                <h2 className="text-3xl font-bold mb-6">Personalization isn't optional</h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Use AI to tailor every message based on prospect data, social activity, and company news.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        'AI-generated opening lines and snippets',
                                        'A/B testing for subject lines and body copy',
                                        'Automatic sentiment analysis of replies',
                                        'Native integration with Gmail and Outlook',
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-tangerine" />
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="accent" size="lg">Start Sequencing</Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
