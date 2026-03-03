'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Badge } from '@ori-os/ui';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 lg:pt-32 pb-20">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-tangerine/10 blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-silver/20 blur-3xl" />
            </div>

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="max-w-2xl">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Badge
                                variant="glass"
                                className="mb-8 px-4 py-2 text-sm font-medium inline-flex items-center gap-2 rounded-none border border-tangerine/20"
                            >
                                <Sparkles className="h-4 w-4 text-tangerine" />
                                <span>AI-Powered Intelligence Platform</span>
                            </Badge>
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.05]"
                        >
                            One input, <br />
                            <span className="relative inline-block mt-2">
                                <span className="gradient-text">complete intelligence</span>
                                <svg
                                    className="absolute -bottom-2 left-0 w-full"
                                    height="8"
                                    viewBox="0 0 200 8"
                                    fill="none"
                                >
                                    <path
                                        d="M1 5.5C47.6667 2.16667 152.4 -1.2 199 5.5"
                                        stroke="#F77F00"
                                        strokeWidth="4"
                                        strokeLinecap="square"
                                    />
                                </svg>
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-10 text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl"
                        >
                            Consolidate your entire GTM stack into one unified AI platform.
                            Find, Enrich, Analyze, and Engage at scale.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-12 flex flex-col sm:flex-row items-center gap-6"
                        >
                            <Button variant="accent" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg rounded-none group" asChild>
                                <Link href="/register">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button variant="glass" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg rounded-none group border border-border" asChild>
                                <Link href="#demo">
                                    <Play className="mr-2 h-5 w-5" />
                                    Watch Demo
                                </Link>
                            </Button>
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="mt-20 pt-10 border-t border-border/40"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-8">
                                Trusted by technical teams at
                            </p>
                            <div className="flex flex-wrap items-center gap-x-12 gap-y-8 opacity-40 grayscale contrast-125">
                                {['Acme Corp', 'TechStart', 'InnovateCo', 'GrowthLabs'].map((company) => (
                                    <div
                                        key={company}
                                        className="text-xl font-black text-foreground tracking-tight"
                                    >
                                        {company}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Dashboard Mockup - Axion Style */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative hidden lg:block"
                    >
                        {/* Rectangular Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-tangerine/5 blur-[120px] pointer-events-none" />

                        <div className="relative border border-border bg-card/40 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden rounded-none">
                            {/* Browser Header */}
                            <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-muted/20">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-red-500/30 rounded-none border border-red-500/20" />
                                    <div className="w-3 h-3 bg-amber-500/30 rounded-none border border-amber-500/20" />
                                    <div className="w-3 h-3 bg-emerald-500/30 rounded-none border border-emerald-500/20" />
                                </div>
                                <div className="flex-1 max-w-sm">
                                    <div className="px-4 py-1.5 bg-muted/40 border border-border/50 text-[10px] text-muted-foreground font-mono flex items-center gap-2">
                                        <div className="w-2 h-2 bg-tangerine rounded-none" />
                                        app.ori-os.com/intelligence
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Content Mock */}
                            <div className="aspect-[1.4] p-8 grid grid-cols-12 gap-6 bg-gradient-to-br from-background to-muted/10">
                                <div className="col-span-3 space-y-6">
                                    <div className="h-20 bg-tangerine/10 border border-tangerine/20 flex flex-col justify-end p-3 gap-1">
                                        <div className="h-1 w-1/2 bg-tangerine/40" />
                                        <div className="h-1 w-full bg-tangerine/20" />
                                    </div>
                                    <div className="h-40 bg-muted/20 border border-border" />
                                    <div className="h-full bg-muted/10 border border-border border-dashed" />
                                </div>
                                <div className="col-span-9 space-y-6">
                                    <div className="grid grid-cols-3 gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-24 bg-muted/30 border border-border p-4 flex flex-col justify-between">
                                                <div className="h-1 w-1/3 bg-muted/50" />
                                                <div className="h-3 w-3/4 bg-foreground/10" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 bg-muted/5 border border-border p-6 h-full">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-tangerine/20 rounded-none border border-tangerine/30" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-2 w-1/4 bg-foreground/20" />
                                                    <div className="h-2 w-1/3 bg-muted/40" />
                                                </div>
                                            </div>
                                            <div className="pt-4 space-y-3">
                                                <div className="h-1 w-full bg-muted/30" />
                                                <div className="h-1 w-5/6 bg-muted/30" />
                                                <div className="h-1 w-4/6 bg-muted/30" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
