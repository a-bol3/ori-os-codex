'use client';

import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@ori-os/ui';

const DOCS_SECTIONS = [
    { title: 'Getting Started', items: ['Installation', 'Configuration', 'First Steps'] },
    { title: 'CRM', items: ['Contacts', 'Companies', 'Deals & Pipeline'] },
    { title: 'Engagement', items: ['Campaigns', 'Sequences', 'Templates'] },
    { title: 'SEO Studio', items: ['Projects', 'Keywords', 'Backlinks', 'GSC Integration'] },
    { title: 'Automation', items: ['Workflows', 'Triggers', 'Actions'] },
    { title: 'API Reference', items: ['Authentication', 'Endpoints', 'Webhooks'] },
];

export default function DocsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-foreground mb-2">Documentation</h1>
                <p className="text-muted-foreground">Comprehensive guides and API references for Ori-OS</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
                {DOCS_SECTIONS.map((section, i) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {section.items.map(item => (
                                    <div key={item} className="flex items-center justify-between py-1.5 px-2 rounded-none hover:bg-muted/50 cursor-pointer group transition-colors">
                                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Full API Reference</p>
                        <p className="text-sm text-muted-foreground">Explore the complete REST API documentation</p>
                    </div>
                    <a href="https://docs.ori-os.com/api" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                        Open Docs <ExternalLink className="h-4 w-4" />
                    </a>
                </CardContent>
            </Card>
        </div>
    );
}
