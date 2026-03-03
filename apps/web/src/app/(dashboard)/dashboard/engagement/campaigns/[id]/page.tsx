'use client';

import { useState, use } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    useToast
} from '@ori-os/ui';
import {
    ChevronLeft,
    Mail,
    Users,
    MousePointer2,
    MessageSquare,
    Play,
    Pause,
    Edit,
    BarChart3,
    Clock,
    Plus,
    MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const mockPerformance = [
    { day: 'Mon', sent: 20, opened: 15, replied: 2 },
    { day: 'Tue', sent: 35, opened: 28, replied: 4 },
    { day: 'Wed', sent: 25, opened: 20, replied: 3 },
    { day: 'Thu', sent: 45, opened: 38, replied: 5 },
    { day: 'Fri', sent: 30, opened: 22, replied: 2 },
];

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const [status, setStatus] = useState('RUNNING');

    const campaign = {
        id: id,
        name: 'SaaS Founders Q1',
        description: 'Cold outreach sequence targeting Series A founders.',
        created: 'Jan 12, 2026',
        recipients: 142,
        sent: 85,
        replies: 12,
        openRate: '68%',
        replyRate: '14%',
        steps: [
            { id: 1, type: 'Email', title: 'Initial Outreach', delay: 'Day 1', sent: 142, open: '72%' },
            { id: 2, type: 'Wait', duration: '3 Days' },
            { id: 3, type: 'Email', title: 'Follow up #1', delay: 'Day 4', sent: 110, open: '54%' },
            { id: 4, type: 'Wait', duration: '5 Days' },
            { id: 5, type: 'Email', title: 'Final Breakup', delay: 'Day 9', sent: 85, open: '42%' },
        ]
    };

    const toggleStatus = () => {
        const newStatus = status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
        setStatus(newStatus);
        toast({
            title: `Campaign ${newStatus === 'RUNNING' ? 'Resumed' : 'Paused'}`,
            description: `${campaign.name} is now ${newStatus.toLowerCase()}.`
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/engagement">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
                            <Badge variant={status === 'RUNNING' ? 'default' : 'secondary'}>{status}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{campaign.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={toggleStatus}>
                        {status === 'RUNNING' ? (
                            <><Pause className="mr-2 h-4 w-4" /> Pause</>
                        ) : (
                            <><Play className="mr-2 h-4 w-4" /> Resume</>
                        )}
                    </Button>
                    <Button variant="accent" asChild>
                        <Link href={`/dashboard/engagement/campaigns/${id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Sequence
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Recipients</p>
                        <p className="text-2xl font-bold">{campaign.recipients}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Sent</p>
                        <p className="text-2xl font-bold">{campaign.sent}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Open Rate</p>
                        <p className="text-2xl font-bold text-success">{campaign.openRate}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Reply Rate</p>
                        <p className="text-2xl font-bold text-success">{campaign.replyRate}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sequence">Sequence Steps</TabsTrigger>
                    <TabsTrigger value="recipients">Recipients</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="sent" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
                                        <Area type="monotone" dataKey="opened" stackId="2" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sequence" className="space-y-4">
                    <div className="max-w-3xl mx-auto space-y-4 py-4">
                        {campaign.steps.map((step, idx) => (
                            <div key={idx} className="relative flex gap-6">
                                {idx < campaign.steps.length - 1 && (
                                    <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                                )}
                                <div className={`w-12 h-12 rounded-none flex items-center justify-center shrink-0 z-10 ${step.type === 'Email' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {step.type === 'Email' ? <Mail className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                                </div>
                                <Card className="flex-1">
                                    <CardHeader className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Badge variant="outline" className="mb-1">{step.type}</Badge>
                                                <CardTitle className="text-base">{step.title || `Wait ${step.duration}`}</CardTitle>
                                            </div>
                                            {step.type === 'Email' && (
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">{step.sent} sent</p>
                                                    <p className="text-xs text-muted-foreground">{step.open} open</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                </Card>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed">
                            <Plus className="mr-2 h-4 w-4" /> Add Step
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
