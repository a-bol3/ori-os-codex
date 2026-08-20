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
                        Invitation-only private beta
                    </div>

                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-10 tracking-tight leading-tight">
                        Building a dependable <span className="text-tangerine">GTM foundation</span>
                    </h2>

                    <p className="text-xl lg:text-2xl text-white/60 mb-14 max-w-2xl mx-auto leading-relaxed">
                        Access is limited while core CRM, security and operational controls are validated.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            variant="accent"
                            size="xl"
                            className="w-full sm:w-auto h-16 px-12 text-lg font-bold rounded-none group"
                            asChild
                        >
                            <Link href="/login">
                                Access beta
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>

                </motion.div>
            </div>
        </section>
    );
}
