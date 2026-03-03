'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, Badge, cn } from '@ori-os/ui';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
    {
        name: 'Starter',
        description: 'Perfect for small teams getting started',
        price: 49,
        period: '/user/mo',
        features: [
            'Up to 5 team members',
            '1,000 lead enrichments/mo',
            'Basic CRM features',
            'Email sequences',
            'Standard analytics',
            'Priority email support',
        ],
        cta: 'Start Free Trial',
        popular: false,
    },
    {
        name: 'Growth',
        description: 'For scaling teams with advanced needs',
        price: 99,
        period: '/user/mo',
        features: [
            'Up to 20 team members',
            '10,000 lead enrichments/mo',
            'Full CRM + pipelines',
            'Multi-channel sequences',
            'Advanced analytics & funnels',
            'Workflow automation',
            'API access',
            'Dedicated account manager',
        ],
        cta: 'Start Free Trial',
        popular: true,
    },
    {
        name: 'Enterprise',
        description: 'For large organizations with custom needs',
        price: null,
        period: 'Custom',
        features: [
            'Unlimited team members',
            'Unlimited enrichments',
            'Custom integrations',
            'SSO & advanced security',
            'Custom contracts & SLAs',
            'On-premise deployment',
            'Dedicated success team',
            '24/7 Phone support',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

export function PricingSection() {
    return (
        <section className="py-24 lg:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-20"
                >
                    <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
                        Scale with <span className="text-tangerine">Confidence</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Transparent, performance-based pricing built for modern growth teams.
                        No hidden tiers, just absolute value.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(
                                "flex flex-col h-full",
                                index !== plans.length - 1 && "border-b md:border-b-0 md:border-r border-border"
                            )}
                        >
                            <div className={cn(
                                "flex-1 p-8 lg:p-12 transition-all duration-300",
                                plan.popular ? "bg-muted/30" : "bg-background hover:bg-muted/10"
                            )}>
                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-bold text-foreground tracking-tight">
                                            {plan.name}
                                        </h3>
                                        {plan.popular && (
                                            <Badge variant="accent" className="rounded-none uppercase tracking-widest text-[10px] py-1 border-none px-3">
                                                Recommended
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-10">
                                    {plan.price !== null ? (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-foreground">
                                                ${plan.price}
                                            </span>
                                            <span className="text-muted-foreground font-medium">{plan.period}</span>
                                        </div>
                                    ) : (
                                        <div className="text-5xl font-black text-foreground">
                                            {plan.period}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-12">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3">
                                            <div className="h-4 w-4 border border-tangerine/30 flex items-center justify-center">
                                                <Check className="h-3 w-3 text-tangerine" />
                                            </div>
                                            <span className="text-sm text-foreground/80 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={plan.popular ? 'accent' : 'outline'}
                                    className="w-full h-14 rounded-none text-base font-bold group"
                                    asChild
                                >
                                    <Link href={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                                        {plan.cta}
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
