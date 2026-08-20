'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@ori-os/ui';
import {
    Zap,
    Shield,
    Puzzle,
    Globe,
    Clock,
    Sparkles,
} from 'lucide-react';

const bentoItems = [
    {
        title: 'Focused beta scope',
        description: 'Private-beta organizations use the CRM workflow while broader modules complete validation.',
        icon: Zap,
        className: 'md:col-span-2 md:row-span-1',
    },
    {
        title: 'Security in progress',
        description: 'Authentication, tenant isolation, auditability and recovery are being hardened before public launch.',
        icon: Shield,
        className: 'md:col-span-1 md:row-span-2',
    },
    {
        title: 'Controlled integrations',
        description: 'Integrations are enabled only when their provider, consent and operational status are verified.',
        icon: Puzzle,
        className: 'md:col-span-1 md:row-span-1',
    },
    {
        title: 'Measured rollout',
        description: 'Capacity is validated through staged beta cohorts before broader availability.',
        icon: Globe,
        className: 'md:col-span-1 md:row-span-1',
    },
    {
        title: 'Visible system state',
        description: 'Unavailable dependencies are surfaced instead of being replaced with simulated success.',
        icon: Clock,
        className: 'md:col-span-1 md:row-span-1',
    },
    {
        title: 'Capability-led delivery',
        description: 'New automation and intelligence features ship only after end-to-end acceptance testing.',
        icon: Sparkles,
        className: 'md:col-span-2 md:row-span-1',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
        },
    },
};

export function BentoSection() {
    return (
        <section className="py-24 lg:py-32 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-20"
                >
                    <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
                        Engineered for <span className="text-tangerine">Performance</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        A controlled foundation for validating dependable go-to-market workflows.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl"
                >
                    {bentoItems.map((item) => (
                        <motion.div
                            key={item.title}
                            variants={itemVariants}
                            className={item.className}
                        >
                            <Card
                                className="h-full rounded-none border border-border bg-card/50 backdrop-blur-sm group cursor-default transition-all duration-300 hover:border-tangerine/30 hover:bg-muted/10"
                            >
                                <CardContent className="p-8 h-full flex flex-col">
                                    <div className="w-10 h-10 border border-border flex items-center justify-center mb-6 group-hover:border-tangerine/40 group-hover:bg-tangerine/5 transition-colors">
                                        <item.icon className="h-5 w-5 text-tangerine" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
