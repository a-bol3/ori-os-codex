'use client';

import { motion } from 'framer-motion';
import { Search, FileText, ChevronRight, BookOpen } from 'lucide-react';
import { Card, CardContent, Input } from '@ori-os/ui';
import { useState } from 'react';

const ARTICLES = [
    { id: '1', title: 'Getting Started with Ori-OS', category: 'Basics', readTime: '5 min' },
    { id: '2', title: 'Setting Up Your First Campaign', category: 'Engagement', readTime: '8 min' },
    { id: '3', title: 'Importing Contacts from CSV', category: 'CRM', readTime: '3 min' },
    { id: '4', title: 'Connecting Google Search Console', category: 'SEO', readTime: '6 min' },
    { id: '5', title: 'Understanding Analytics Dashboards', category: 'Analytics', readTime: '10 min' },
    { id: '6', title: 'Creating Automation Workflows', category: 'Automation', readTime: '12 min' },
    { id: '7', title: 'Managing Team Members & Roles', category: 'Settings', readTime: '4 min' },
    { id: '8', title: 'Billing & Subscription FAQ', category: 'Billing', readTime: '5 min' },
];

export default function KnowledgeBasePage() {
    const [search, setSearch] = useState('');
    const filtered = ARTICLES.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
                <p className="text-muted-foreground">Search our library of helpful articles and guides</p>
            </motion.div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search articles..."
                    className="pl-10"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="grid gap-3">
                {filtered.map((article, i) => (
                    <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-none bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                            {article.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {article.category} · {article.readTime} read
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>No articles found for "{search}"</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
