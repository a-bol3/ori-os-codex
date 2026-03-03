'use client';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge } from '@ori-os/ui';
import { Calendar, MapPin, Briefcase, Rocket, Sparkles, Globe } from 'lucide-react';

const openings = [
    { title: 'Senior Frontend Engineer', team: 'Product', location: 'Remote (US/EU)', type: 'Full-time' },
    { title: 'Product Designer', team: 'Design', location: 'Remote (Global)', type: 'Full-time' },
    { title: 'AI Research Engineer', team: 'Intelligence', location: 'San Francisco / Remote', type: 'Full-time' },
    { title: 'Growth Marketing Manager', team: 'Marketing', location: 'Remote (EU)', type: 'Full-time' },
    { title: 'Customer Success Lead', team: 'Success', location: 'Remote (US)', type: 'Full-time' },
];

export default function CareersPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 bg-background pt-24">
                <section className="py-24 bg-gunmetal text-white text-center">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Badge variant="accent" className="mb-6">We're Hiring</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Build the future of <span className="text-tangerine">GTM</span></h1>
                        <p className="text-xl text-white/70">
                            Join our remote-first team and help us build the first unified operating system for growth teams.
                        </p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
                            {[
                                { title: 'Remote First', icon: Globe, desc: 'Work from anywhere in the world. We believe in results, not hours.' },
                                { title: 'Fast Growth', icon: Rocket, desc: 'We are scaling quickly and offer massive opportunities for ownership.' },
                                { title: 'Modern Stack', icon: Sparkles, desc: 'Work with the latest and greatest technologies in AI and web dev.' },
                            ].map((v, i) => (
                                <Card key={i} className="bg-muted/30 border-none">
                                    <CardContent className="p-8 text-center">
                                        <div className="p-4 rounded-none bg-background w-fit mx-auto mb-6">
                                            <v.icon className="h-8 w-8 text-tangerine" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                                        <p className="text-muted-foreground">{v.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-8">Open Roles</h2>
                            <div className="space-y-4">
                                {openings.map((job, i) => (
                                    <Card key={i} hover="lift" className="cursor-pointer">
                                        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Briefcase className="h-4 w-4" /> {job.team}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" /> {job.location}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">{job.type}</Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
