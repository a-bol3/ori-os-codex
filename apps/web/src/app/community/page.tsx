'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Badge } from '@ori-os/ui';
import { Users, MessageSquare, Github, Twitter, Youtube, ArrowRight, Sparkles, type LucideIcon } from 'lucide-react';

export default function CommunityPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-coffee-bean text-white text-center">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Badge variant="accent" className="mb-6">Join Us</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">A community of <span className="text-tangerine">builders</span></h1>
                        <p className="text-xl text-white/70">
                            Connect with thousands of GTM professionals, developers, and creators scaling with Ori-OS.
                        </p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                            {[
                                { name: 'Discord', desc: 'Join for real-time support and community chats.', icon: MessageSquare, color: 'bg-[#5865F2]' },
                                { name: 'GitHub', desc: 'Contribute to our open-source tools and community SDKs.', icon: Github, color: 'bg-black' },
                                { name: 'Twitter', desc: 'Follow us for the latest GTM insights and product news.', icon: Twitter, color: 'bg-[#1DA1F2]' },
                                { name: 'YouTube', desc: 'Watch tutorials and case studies on how to use Ori-OS.', icon: Youtube, color: 'bg-[#FF0000]' },
                            ].map((social, i) => (
                                <Card key={i} hover="lift" className="cursor-pointer border-none shadow-sm">
                                    <CardContent className="p-8 text-center">
                                        <div className={`p-4 rounded-none ${social.color} text-white w-fit mx-auto mb-6`}>
                                            <social.icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{social.name}</h3>
                                        <p className="text-sm text-muted-foreground">{social.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <h2 className="text-3xl font-bold">Share your playbooks</h2>
                                <p className="text-lg text-muted-foreground">
                                    Our community marketplace allows you to share and discover proven automation workflows and email sequences. Learn from the best in the industry.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        'Export/Import workflow recipes with one click',
                                        'Earn rewards for popular community contributions',
                                        'Join weekly live strategy sessions with our founders',
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Sparkles className="h-5 w-5 text-tangerine" />
                                            <span className="font-medium text-foreground">{text}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="accent" size="lg">Join the Discord</Button>
                            </div>
                            <div className="bg-muted/30 aspect-video rounded-none flex items-center justify-center p-12">
                                <Users className="h-32 w-32 text-muted-foreground/20" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}

