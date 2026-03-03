'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button } from '@ori-os/ui';
import { Target, Users, Zap, Globe, Sparkles, Building2 } from 'lucide-react';

const values = [
    {
        title: 'Radical Intelligence',
        description: 'We believe in data-driven decisions. Our platform provides the deepest insights possible.',
        icon: Sparkles,
    },
    {
        title: 'User Obsession',
        description: 'Every feature is built with the end-user in mind, focusing on speed and simplicity.',
        icon: Users,
    },
    {
        title: 'Iterate Fast',
        description: 'We move quickly, learn from feedback, and ship improvements daily.',
        icon: Zap,
    },
    {
        title: 'Global First',
        description: 'Ori-OS is built for the global economy, supporting teams across every time zone.',
        icon: Globe,
    },
];

const team = [
    { name: 'Alex Rivera', role: 'Founder & CEO', avatar: 'AR' },
    { name: 'Sarah Chen', role: 'Head of Product', avatar: 'SC' },
    { name: 'Michael Torres', role: 'CTO', avatar: 'MT' },
    { name: 'Emily Watson', role: 'Head of Growth', avatar: 'EW' },
];

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1">
                {/* Hero */}
                <section className="py-24 bg-coffee-bean text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-noise opacity-10" />
                    <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold mb-6"
                        >
                            We're on a mission to <span className="text-tangerine">automate</span> global go-to-market.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-white/70"
                        >
                            Ori-OS was founded to solve the fragmentation in the modern sales and marketing stack. We're building the first unified OS for growth.
                        </motion.p>
                    </div>
                </section>

                {/* Values */}
                <section className="py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
                            <p className="text-muted-foreground">The principles that guide everything we do.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((v, i) => (
                                <Card key={i} variant="outline" className="border-none shadow-none text-center">
                                    <CardContent className="p-6">
                                        <div className="p-4 rounded-none bg-tangerine/10 w-fit mx-auto mb-6">
                                            <v.icon className="h-8 w-8 text-tangerine" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3">{v.title}</h3>
                                        <p className="text-muted-foreground">{v.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Story */}
                <section className="py-24 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                                <p className="text-lg text-muted-foreground mb-6">
                                    Founded in 2024, Ori-OS started as a small internal tool built by founders who were tired of switching between five different platforms just to find a lead and send an email.
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    Today, we're a remote-first team of 50+ people helping thousands of companies streamline their go-to-market operations. We're backed by some of the world's leading investors and we're just getting started.
                                </p>
                            </div>
                            <div className="bg-gunmetal aspect-video rounded-none overflow-hidden flex items-center justify-center">
                                <Building2 className="h-24 w-24 text-white/20" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
