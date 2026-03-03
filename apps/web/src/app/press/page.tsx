'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge, Button, CardHeader, CardTitle, CardDescription } from '@ori-os/ui';
import { Newspaper, MessageSquare, Download, Share2, Globe, Building2 } from 'lucide-react';

export default function PressPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-20">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">Press <span className="gradient-text">Kit</span></h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Everything you need to tell the Ori-OS story. Logos, brand guidelines, and latest news.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-12">
                                <section>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Newspaper className="h-6 w-6 text-tangerine" /> Latest News
                                    </h2>
                                    <div className="space-y-6">
                                        {[
                                            { date: 'Jan 20, 2026', title: 'Ori-OS Raises $50M Series B to Accelerate AI Innovation', outlet: 'TechCrunch' },
                                            { date: 'Dec 15, 2025', title: 'The Future of GTM is Unified: An Interview with Alex Rivera', outlet: 'Forbes' },
                                            { date: 'Nov 02, 2025', title: 'Ori-OS Named Top Sales Tool for High-Velocity Teams', outlet: 'G2 Reports' },
                                        ].map((news, i) => (
                                            <Card key={i} hover="lift" className="cursor-pointer">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-tangerine font-medium">{news.outlet}</span>
                                                        <span className="text-sm text-muted-foreground">{news.date}</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold">{news.title}</h3>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold mb-6">About Ori-OS</h2>
                                    <p className="text-lg text-muted-foreground mb-6">
                                        Ori-OS is the first unified operating system for go-to-market teams. We provide a single platform that integrates CRM, lead intelligence, workflow automation, and multi-channel engagement.
                                    </p>
                                    <p className="text-lg text-muted-foreground">
                                        Founded in 2024, our mission is to eliminate the fragmentation of sales and marketing tools, allowing teams to focus on building relationships and closing deals.
                                    </p>
                                </section>
                            </div>

                            <div className="space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Download className="h-5 w-5 text-tangerine" /> Brand Assets
                                        </CardTitle>
                                        <CardDescription>Download our visual assets</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Globe className="h-4 w-4 mr-2" /> All-in-one Kit (.zip)
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Building2 className="h-4 w-4 mr-2" /> Logo Files (SVG/PNG)
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-muted/30 border-none">
                                    <CardHeader>
                                        <CardTitle>Press Contact</CardTitle>
                                        <CardDescription>For media inquiries only</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm font-medium">press@ori-os.com</p>
                                        <p className="text-xs text-muted-foreground mt-1">Average response within 24 hours.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <MarketingFooter />
        </div>
    );
}

