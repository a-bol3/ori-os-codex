'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { ArrowRight, Search, Calendar, User } from 'lucide-react';

const posts = [
    {
        title: 'The Future of AI in Sales Operations',
        excerpt: 'How large language models are transforming how we find and engage with leads.',
        author: 'Alex Rivera',
        date: 'Feb 1, 2026',
        category: 'AI & Machine Learning',
        image: 'bg-gunmetal',
    },
    {
        title: 'Unified Go-To-Market: Why Now?',
        excerpt: 'The hidden cost of fragmented sales tools and how to solve it.',
        author: 'Sarah Chen',
        date: 'Jan 28, 2026',
        category: 'Strategy',
        image: 'bg-coffee-bean',
    },
    {
        title: 'Ori-OS Release: Automations 2.0',
        excerpt: 'Introducing conditional branching, native Slack alerts, and more.',
        author: 'Michael Torres',
        date: 'Jan 15, 2026',
        category: 'Product Updates',
        image: 'bg-tangerine',
    },
];

export default function BlogPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <div className="container mx-auto px-4 py-16">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Ori-OS <span className="gradient-text">Insights</span></h1>
                        <p className="text-lg text-muted-foreground">
                            Thoughts on sales, marketing, and the future of go-to-market.
                        </p>
                    </div>

                    {/* Featured Post */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-20"
                    >
                        <Card className="overflow-hidden border-none bg-gunmetal text-white group cursor-pointer hover:shadow-2xl transition-all">
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    <div className="h-64 lg:h-auto bg-gradient-to-br from-tangerine to-orange-600" />
                                    <div className="p-8 lg:p-16 flex flex-col justify-center">
                                        <Badge variant="accent" className="mb-6 w-fit">Featured Post</Badge>
                                        <h2 className="text-3xl font-bold mb-4 group-hover:text-tangerine transition-colors">How we grew our pipeline by 300% using Ori-OS intelligence</h2>
                                        <p className="text-white/70 mb-8 text-lg">
                                            A deep dive into the exact playbooks and automation workflows we used to scale our own go-to-market engine.
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-none bg-white/10" />
                                                <div className="text-sm italic">by Alex Rivera • Feb 5, 2026</div>
                                            </div>
                                            <Button variant="accent">Read More</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {posts.map((post, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card hover="lift" className="h-full group cursor-pointer border-none shadow-sm hover:shadow-md">
                                    <div className={`h-48 ${post.image} group-hover:opacity-90 transition-opacity`} />
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Badge variant="secondary" className="text-2xs">{post.category}</Badge>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-tangerine transition-colors">{post.title}</h3>
                                        <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                                                <User className="h-3 w-3" /> {post.author}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                                                <Calendar className="h-3 w-3" /> {post.date}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" disabled>Previous</Button>
                        <Button variant="accent">1</Button>
                        <Button variant="outline">2</Button>
                        <Button variant="outline">3</Button>
                        <Button variant="outline">Next</Button>
                    </div>
                </div>
            </main>
            <MarketingFooter />
        </div>
    );
}
