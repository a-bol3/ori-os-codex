'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Input, Badge } from '@ori-os/ui';
import { Mail, MessageSquare, MapPin, Phone, Github, Linkedin, Twitter } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in <span className="gradient-text">touch</span></h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Have questions about Ori-OS? Our team is here to help you scale your go-to-market.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Contact Info */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-none bg-muted">
                                                <Mail className="h-5 w-5 text-tangerine" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Email</p>
                                                <p className="text-sm text-muted-foreground">hello@ori-os.com</p>
                                                <p className="text-sm text-muted-foreground">support@ori-os.com</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-none bg-muted">
                                                <MessageSquare className="h-5 w-5 text-tangerine" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Live Chat</p>
                                                <p className="text-sm text-muted-foreground">Available Mon-Fri, 9am-6pm EST</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-none bg-muted">
                                                <MapPin className="h-5 w-5 text-tangerine" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Office</p>
                                                <p className="text-sm text-muted-foreground">Level 42, Cloud Tower</p>
                                                <p className="text-sm text-muted-foreground">San Francisco, CA 94105</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                                    <div className="flex items-center gap-4">
                                        {[Twitter, Linkedin, Github].map((Icon, i) => (
                                            <Button key={i} variant="outline" size="icon" className="group">
                                                <Icon className="h-5 w-5 group-hover:text-tangerine transition-colors" />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <Card className="lg:col-span-2 shadow-xl border-tangerine/10">
                                <CardContent className="p-8">
                                    <form className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">First Name</label>
                                                <Input placeholder="John" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Last Name</label>
                                                <Input placeholder="Doe" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Work Email</label>
                                            <Input type="email" placeholder="john@company.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Subject</label>
                                            <Input placeholder="How can we help?" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Message</label>
                                            <textarea
                                                className="w-full min-h-[150px] p-3 rounded-none bg-background border border-border focus:ring-2 focus:ring-tangerine focus:outline-none text-sm"
                                                placeholder="Tell us more about your needs..."
                                            />
                                        </div>
                                        <Button className="w-full" variant="accent" size="lg">
                                            Send Message
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <MarketingFooter />
        </div>
    );
}
