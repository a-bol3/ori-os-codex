'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, cn } from '@ori-os/ui';
import {
    Search,
    Database,
    GitBranch,
    Mail,
    BarChart3,
    FileText,
} from 'lucide-react';

const features = [
    {
        icon: Search,
        title: 'Intelligence',
        description:
            'Discover and enrich leads with AI-powered research. Deep company analysis, tech stack detection, and hiring signals.',
    },
    {
        icon: Database,
        title: 'CRM',
        description:
            'Unified relationship hub with customizable pipelines, activity tracking, and segment management.',
    },
    {
        icon: GitBranch,
        title: 'Automation',
        description:
            'Visual workflow builder for complex automations. Connect triggers, conditions, and actions seamlessly.',
    },
    {
        icon: Mail,
        title: 'Engagement',
        description:
            'Multi-step sequences across email, SMS, and social. Unified inbox for all conversations.',
    },
    {
        icon: BarChart3,
        title: 'Analytics',
        description:
            'Event tracking, funnels, retention cohorts, and custom reports. PostHog-level insights built in.',
    },
    {
        icon: FileText,
        title: 'Content Studio',
        description:
            'AI-powered content generation for emails, newsletters, and social posts. Version control included.',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
        },
    },
};

export function FeaturesSection() {
    return (
        <section className="py-24 lg:py-32 bg-background border-y border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-20"
                >
                    <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
                        Product <span className="text-tangerine">Capabilities</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        A unified engine for the entire go-to-market lifecycle.
                        No more silos, just complete data flow.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 border border-border/20"
                >
                    {features.map((feature) => (
                        <motion.div key={feature.title} variants={itemVariants}>
                            <Card
                                className="h-full bg-background border-none rounded-none group cursor-pointer transition-colors hover:bg-muted/30"
                            >
                                <CardContent className="p-10 flex flex-col h-full">
                                    <div className="w-12 h-12 flex items-center justify-center mb-8 border border-tangerine/20 bg-tangerine/5">
                                        <feature.icon className="h-6 w-6 text-tangerine transition-transform duration-300 group-hover:-translate-y-1" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-4 tracking-tight group-hover:text-tangerine transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {feature.description}
                                    </p>
                                    <div className="mt-auto pt-8">
                                        <div className="w-8 h-px bg-tangerine/40 group-hover:w-full transition-all duration-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
