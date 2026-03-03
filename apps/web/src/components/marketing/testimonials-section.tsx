'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Avatar, AvatarFallback, AvatarImage, cn } from '@ori-os/ui';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
    {
        quote:
            "Ori-OS replaced 5 different tools we were using. The unified platform has saved us countless hours and the AI insights are genuinely useful.",
        author: 'Sarah Chen',
        title: 'VP of Sales',
        company: 'TechCorp',
        avatar: 'SC',
    },
    {
        quote:
            "The workflow automation is incredibly powerful. We've automated our entire lead qualification process and it just works.",
        author: 'Michael Torres',
        title: 'Revenue Operations',
        company: 'ScaleUp Inc',
        avatar: 'MT',
    },
    {
        quote:
            "Finally, a platform that understands how modern sales teams work. The analytics alone are worth the subscription.",
        author: 'Emily Watson',
        title: 'Head of Growth',
        company: 'FastTrack',
        avatar: 'EW',
    },
];

export function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section className="py-24 lg:py-40 bg-background border-y border-border/40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-20"
                >
                    <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
                        Built for <span className="text-tangerine">Teams</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Join hundreds of organizations using Ori-OS to drive
                        measurable growth and operational efficiency.
                    </p>
                </motion.div>

                <div className="max-w-5xl relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Card className="rounded-none border-border bg-muted/20 p-8 lg:p-16 relative overflow-hidden">
                                <CardContent className="p-0 relative z-10">
                                    <Quote className="h-12 w-12 text-tangerine/20 mb-10" />
                                    <blockquote className="text-2xl lg:text-4xl text-foreground font-medium mb-12 leading-tight tracking-tight italic">
                                        "{testimonials[currentIndex].quote}"
                                    </blockquote>

                                    <div className="flex items-center gap-6">
                                        <Avatar className="h-16 w-16 rounded-none border border-border">
                                            <AvatarImage
                                                className="rounded-none"
                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonials[currentIndex].avatar}`}
                                            />
                                            <AvatarFallback className="rounded-none bg-tangerine/5 text-tangerine">
                                                {testimonials[currentIndex].avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-xl font-bold text-foreground tracking-tight">
                                                {testimonials[currentIndex].author}
                                            </div>
                                            <div className="text-sm font-bold uppercase tracking-widest text-tangerine/80">
                                                {testimonials[currentIndex].title}, {testimonials[currentIndex].company}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-tangerine/5 -mr-16 -mt-16 rotate-45" />
                            </Card>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center gap-px bg-border border border-border w-fit mt-12">
                        <button
                            onClick={prev}
                            className="p-4 bg-background hover:bg-muted transition-colors"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="h-6 w-6 text-foreground" />
                        </button>
                        <div className="flex items-center gap-4 px-6 bg-background">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={cn(
                                        "w-8 h-1 transition-colors",
                                        index === currentIndex ? "bg-tangerine" : "bg-border hover:bg-muted-foreground/30"
                                    )}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={next}
                            className="p-4 bg-background hover:bg-muted transition-colors"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="h-6 w-6 text-foreground" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
