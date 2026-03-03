'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@ori-os/ui';

interface Section {
    id: string;
    label: string;
}

interface SectionProgressIndicatorProps {
    sections: Section[];
}

export function SectionProgressIndicator({ sections }: SectionProgressIndicatorProps) {
    const [activeSection, setActiveSection] = useState<string>('');

    useEffect(() => {
        const observers = new Map();

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: [0.5] }
        );

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                observer.observe(element);
                observers.set(section.id, element);
            }
        });

        return () => observer.disconnect();
    }, [sections]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-4">
            <div className="relative w-px h-64 bg-border/40">
                <motion.div
                    className="absolute top-0 left-0 w-full bg-tangerine"
                    initial={{ height: 0 }}
                    animate={{
                        height: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%`
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
            </div>

            <div className="flex flex-col gap-6">
                {sections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className="group relative flex items-center"
                        >
                            <div className={cn(
                                "w-2 h-2 transition-all duration-300",
                                isActive ? "bg-tangerine scale-125" : "bg-border/60 hover:bg-border"
                            )} />

                            <AnimatePresence>
                                <motion.span
                                    initial={{ opacity: 0, x: 10 }}
                                    whileHover={{ opacity: 1, x: 20 }}
                                    className="absolute left-full ml-4 text-xs font-medium text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {section.label}
                                </motion.span>
                            </AnimatePresence>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
