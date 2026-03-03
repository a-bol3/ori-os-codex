'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { PricingSection } from '@/components/marketing/pricing-section';
import { motion } from 'framer-motion';
import { Card, CardContent, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@ori-os/ui';

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <PricingSection />

                {/* Comparison Table / FAQ section */}
                <section className="py-24 border-t border-border">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="text-3xl font-bold text-center mb-16">Frequently asked questions</h2>
                        <Accordion type="single" collapsible className="w-full">
                            {[
                                { q: 'Do you offer a free trial?', a: 'Yes, we offer a 14-day free trial on all plans. No credit card required.' },
                                { q: 'Can I change plans later?', a: 'Of course! You can upgrade or downgrade your plan at any time from your settings.' },
                                { q: 'What is considered an enrichment?', a: 'An enrichment is one successful data lookup for a person or company record.' },
                                { q: 'Do you offer annual discounts?', a: 'Yes, we offer a 20% discount if you choose to be billed annually.' },
                                { q: 'What kind of support is included?', a: 'Starter plans get email support. Growth and Enterprise plans get priority support and dedicated success managers.' },
                            ].map((faq, i) => (
                                <AccordionItem key={i} value={`item-${i}`}>
                                    <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
