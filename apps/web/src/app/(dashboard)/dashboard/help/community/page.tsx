'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@ori-os/ui';

const COMMUNITY_LINKS = [
    {
        icon: MessageCircle,
        title: 'Community Forum',
        description: 'Ask questions, share tips, and connect with other Ori-OS users',
        href: 'https://community.ori-os.com',
        cta: 'Join Forum',
    },
    {
        icon: Users,
        title: 'Slack Community',
        description: 'Real-time chat with the Ori-OS community and team',
        href: 'https://slack.ori-os.com',
        cta: 'Join Slack',
    },
    {
        icon: TrendingUp,
        title: 'Feature Requests',
        description: 'Vote on upcoming features and suggest new ideas',
        href: 'https://feedback.ori-os.com',
        cta: 'Submit Idea',
    },
];

export default function CommunityPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-foreground mb-2">Community</h1>
                <p className="text-muted-foreground">Connect with other Ori-OS users and the team</p>
            </motion.div>

            <div className="grid gap-4">
                {COMMUNITY_LINKS.map((link, i) => (
                    <motion.div
                        key={link.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="hover:border-primary/30 transition-colors">
                            <CardContent className="p-6 flex items-center gap-6">
                                <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                                    <link.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground">{link.title}</p>
                                    <p className="text-sm text-muted-foreground mt-0.5">{link.description}</p>
                                </div>
                                <a href={link.href} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        {link.cta} <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-base">Share Your Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        We're constantly improving Ori-OS based on your feedback. Let us know what you think!
                    </p>
                    <a href="mailto:feedback@ori-os.com">
                        <Button>Send Feedback</Button>
                    </a>
                </CardContent>
            </Card>
        </div>
    );
}
