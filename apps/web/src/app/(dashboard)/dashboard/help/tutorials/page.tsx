'use client';

import { motion } from 'framer-motion';
import { Video, Play, Clock } from 'lucide-react';
import { Card, CardContent, Badge } from '@ori-os/ui';

const TUTORIALS = [
    { id: '1', title: 'Ori-OS Platform Overview', duration: '12:30', category: 'Getting Started', level: 'Beginner' },
    { id: '2', title: 'Setting Up Your CRM', duration: '18:45', category: 'CRM', level: 'Beginner' },
    { id: '3', title: 'Building Your First Campaign', duration: '22:10', category: 'Engagement', level: 'Intermediate' },
    { id: '4', title: 'Advanced Workflow Automation', duration: '35:20', category: 'Automation', level: 'Advanced' },
    { id: '5', title: 'SEO Studio Deep Dive', duration: '28:00', category: 'SEO', level: 'Intermediate' },
    { id: '6', title: 'Analytics & Reporting', duration: '15:30', category: 'Analytics', level: 'Beginner' },
];

const levelVariant: Record<string, any> = {
    Beginner: 'success',
    Intermediate: 'accent',
    Advanced: 'destructive',
};

export default function TutorialsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-foreground mb-2">Video Tutorials</h1>
                <p className="text-muted-foreground">Step-by-step video walkthroughs to help you get the most out of Ori-OS</p>
            </motion.div>

            <div className="grid gap-4">
                {TUTORIALS.map((tutorial, i) => (
                    <motion.div
                        key={tutorial.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-16 h-12 rounded-none bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                    <Play className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                        {tutorial.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">{tutorial.category}</span>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" /> {tutorial.duration}
                                        </span>
                                    </div>
                                </div>
                                <Badge variant={levelVariant[tutorial.level] || 'secondary'}>{tutorial.level}</Badge>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
