'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@ori-os/ui';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
    return (
        <section className="py-24 lg:py-40 relative overflow-hidden bg-coffee-bean">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-tangerine/10 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tangerine/5 blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 border border-tangerine/30 bg-tangerine/5 text-tangerine text-xs font-bold uppercase tracking-[0.2em] mb-10">
                        <Sparkles className="h-4 w-4" />
                        Start your 14-day free trial
                    </div>

                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-10 tracking-tight leading-tight">
                        Ready to <span className="text-tangerine">Accelerate</span> <br />
                        your Growth?
                    </h2>

                    <p className="text-xl lg:text-2xl text-white/60 mb-14 max-w-2xl mx-auto leading-relaxed">
                        Join the high-performance teams using Ori-OS
                        to unify their intelligence and execution.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            variant="accent"
                            size="xl"
                            className="w-full sm:w-auto h-16 px-12 text-lg font-bold rounded-none group"
                            asChild
                        >
                            <Link href="/register">
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="xl"
                            className="w-full sm:w-auto h-16 px-12 text-lg font-bold rounded-none border-white/20 text-white hover:bg-white/5"
                            asChild
                        >
                            <Link href="/contact">Talk to Sales</Link>
                        </Button>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <span>No credit card required</span>
                        <div className="w-1 h-1 bg-tangerine/40" />
                        <span>Cancel anytime</span>
                        <div className="w-1 h-1 bg-tangerine/40" />
                        <span>Instant access</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
