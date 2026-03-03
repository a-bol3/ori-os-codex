'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
    { value: 10000, suffix: '+', label: 'Companies served' },
    { value: 50, suffix: 'M+', label: 'Leads enriched' },
    { value: 99.9, suffix: '%', label: 'Uptime SLA' },
    { value: 4.9, suffix: '/5', label: 'Customer rating' },
];

function AnimatedCounter({
    value,
    suffix,
    inView,
}: {
    value: number;
    suffix: string;
    inView: boolean;
}) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;

        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value, inView]);

    const displayValue = value % 1 !== 0 ? count.toFixed(1) : Math.floor(count);

    return (
        <span className="tabular-nums">
            {displayValue}
            {suffix}
        </span>
    );
}

export function StatsSection() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    return (
        <section className="py-24 lg:py-40 bg-coffee-bean text-white relative overflow-hidden border-y border-tangerine/20">
            {/* Minimal Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                }} />
            </div>

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-coffee-bean p-12 lg:p-16 text-center group"
                        >
                            <div className="text-4xl sm:text-6xl font-black text-tangerine mb-4 tracking-tighter">
                                <AnimatedCounter
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    inView={inView}
                                />
                            </div>
                            <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-tangerine/60 transition-colors">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
