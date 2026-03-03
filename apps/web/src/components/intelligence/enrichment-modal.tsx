'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Badge,
} from '@ori-os/ui';
import { Sparkles, Zap, Target, Search, TrendingUp, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnrichmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'company' | 'person' | 'intent';
}

export function EnrichmentModal({ isOpen, onClose, type }: EnrichmentModalProps) {
    const getContent = () => {
        switch (type) {
            case 'company':
                return {
                    title: 'Deep Company Enrichment',
                    description: 'Analyze firmographic data, tech stack, and growth indicators.',
                    icon: Cpu,
                    items: [
                        { label: 'Firmographics', value: 'Details on history, subsidiaries, and recent IP filings.' },
                        { label: 'Tech Stack', value: 'Complete list of CMS, CRM, and analytics tools used.' },
                        { label: 'Recent Funding', value: 'Detailed breakdown of investors and series history.' }
                    ]
                };
            case 'person':
                return {
                    title: 'Contact Discovery Engine',
                    description: 'Verify contact information and professional background.',
                    icon: Search,
                    items: [
                        { label: 'Work History', value: 'Complete professional timeline and past responsibilities.' },
                        { label: 'Social Signals', value: 'Recent LinkedIn activity and public professional posts.' },
                        { label: 'Verification', value: 'Real-time SMTP verification for email addresses.' }
                    ]
                };
            default:
                return {
                    title: 'Intent & Growth Signals',
                    description: 'Track real-time indicators of buying intent.',
                    icon: Target,
                    items: [
                        { label: 'Hiring Trends', value: 'Analysis of open roles and departments being expanded.' },
                        { label: 'Project Growth', value: 'Signals indicating new project launches or expansions.' },
                        { label: 'Tech Switches', value: 'Tracking when they stop using a competitor tool.' }
                    ]
                };
        }
    };

    const content = getContent();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-tangerine mb-2">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                    </div>
                    <DialogTitle className="text-2xl">{content.title}</DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <p className="text-muted-foreground">{content.description}</p>

                    <div className="space-y-4">
                        {content.items.map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 rounded-none bg-muted/50 border border-border/50"
                            >
                                <h4 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-tangerine" />
                                    {item.label}
                                </h4>
                                <p className="text-sm text-muted-foreground">{item.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-4 rounded-none bg-tangerine/5 border border-tangerine/20 flex gap-3">
                        <TrendingUp className="h-5 w-5 text-tangerine shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <span className="font-bold text-tangerine">Hot Signal:</span>
                            <span className="ml-1 text-muted-foreground">Companies matching this pattern are 3.4x more likely to convert this quarter.</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button
                        variant="accent"
                        onClick={() => {
                            onClose();
                            // Implementation of Deep Scan simulation
                        }}
                    >
                        Start Deep Scan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
