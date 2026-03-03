'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, AvatarImage, Button } from '@ori-os/ui';
import { Mail, Users, Zap, Search, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const activities = [
    { id: 1, type: 'email', user: 'Jennifer Smith', action: 'opened an email', time: '2 mins ago', details: 'Campaign: Q1 Outreach' },
    { id: 2, type: 'crm', user: 'Alex Rivera', action: 'moved a deal to "Contract"', time: '15 mins ago', details: 'Deal: Acme Corp - Enterprise' },
    { id: 3, type: 'automation', user: 'System', action: 'triggered a workflow', time: '1 hour ago', details: 'Workflow: New Lead Nurture' },
    { id: 4, type: 'crm', user: 'Sarah Chen', action: 'created a new contact', time: '3 hours ago', details: 'Contact: Michael Wang (TechFlow)' },
    { id: 5, type: 'email', user: 'John Doe', action: 'clicked a link in your email', time: '5 hours ago', details: 'Campaign: Product Update' },
    { id: 6, type: 'automation', user: 'System', action: 'sent 52 emails', time: 'Yesterday', details: 'Workflow: Monthly Newsletter' },
];

export default function ActivityPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Activity Feed</h1>
                    <p className="text-muted-foreground">Real-time updates across all modules</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
                    <Button variant="accent" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Updates</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {activities.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors"
                            >
                                <div className={`p-2 rounded-none ${activity.type === 'email' ? 'bg-blue-500/10 text-blue-500' :
                                        activity.type === 'crm' ? 'bg-tangerine/10 text-tangerine' :
                                            'bg-purple-500/10 text-purple-500'
                                    }`}>
                                    {activity.type === 'email' ? <Mail className="h-4 w-4" /> :
                                        activity.type === 'crm' ? <Users className="h-4 w-4" /> :
                                            <Zap className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm">
                                            <span className="font-bold text-foreground">{activity.user}</span>
                                            {" "}
                                            <span className="text-muted-foreground">{activity.action}</span>
                                        </p>
                                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                                    </div>
                                    <p className="text-xs font-medium text-foreground/80 mt-1">{activity.details}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
