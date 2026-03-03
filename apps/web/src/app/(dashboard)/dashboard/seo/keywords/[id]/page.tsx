'use client';

import { useState } from 'react';
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
} from '@ori-os/ui';
import {
    TrendingUp,
    TrendingDown,
    Search,
    ChevronLeft,
    ExternalLink,
    BarChart3,
    Target,
    Zap,
    Globe,
    MousePointer2,
} from 'lucide-react';
import Link from 'next/link';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

// Mock ranking data
const rankingHistory = [
    { date: '2026-01-15', position: 18 },
    { date: '2026-01-22', position: 16 },
    { date: '2026-01-29', position: 18 },
    { date: '2026-02-05', position: 15 },
    { date: '2026-02-12', position: 12 },
];

export default async function KeywordDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // In a real app, we'd fetch this based on the resolved id
    const keyword = {
        id: id,
        keyword: 'web development services',
        position: 12,
        prevPosition: 15,
        searchVolume: 8100,
        difficulty: 65,
        url: '/services/web-development',
        project: 'Main Website',
        projectId: 'project-1',
        cpc: '$12.40',
        competition: 'High',
        lastUpdated: '2 hours ago',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/seo/keywords">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{keyword.keyword}</h1>
                        <Badge variant="secondary">{keyword.project}</Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        Monitoring rankings for: <span className="text-foreground">{keyword.url}</span>
                        <ExternalLink className="h-3 w-3" />
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Current Rank</p>
                                <p className="text-3xl font-bold text-foreground mt-1">#{keyword.position}</p>
                            </div>
                            <div className="p-2 rounded-none bg-success/10 text-success">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-xs text-success font-medium mt-2 flex items-center gap-1">
                            Improved 3 positions <span className="text-muted-foreground font-normal">vs last week</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Search Volume</p>
                                <p className="text-3xl font-bold text-foreground mt-1">{keyword.searchVolume.toLocaleString()}</p>
                            </div>
                            <div className="p-2 rounded-none bg-primary/10 text-primary">
                                <Search className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Monthly searches in <span className="text-foreground font-medium">United States</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Keyword Difficulty</p>
                                <p className="text-3xl font-bold text-foreground mt-1">{keyword.difficulty}/100</p>
                            </div>
                            <div className="p-2 rounded-none bg-orange-500/10 text-orange-500">
                                <Zap className="h-5 w-5" />
                            </div>
                        </div>
                        <Progress value={keyword.difficulty} className="h-1.5 mt-4" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Estimated CPC</p>
                                <p className="text-3xl font-bold text-foreground mt-1">{keyword.cpc}</p>
                            </div>
                            <div className="p-2 rounded-none bg-muted text-muted-foreground">
                                <Globe className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Competition: <span className="text-foreground font-medium">{keyword.competition}</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Ranking History</CardTitle>
                        <CardDescription>Position tracking over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={rankingHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis
                                        reversed
                                        domain={[1, 'auto']}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        itemStyle={{ color: 'hsl(var(--primary))' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="position"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPos)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">SERP Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: 'Featured Snippet', value: 'Not found', status: 'missing' },
                                    { label: 'Related Questions', value: 'Present', status: 'present' },
                                    { label: 'Image Pack', value: 'Present', status: 'present' },
                                    { label: 'Video Pack', value: 'Not found', status: 'missing' },
                                    { label: 'Ads (Top)', value: '3 found', status: 'present' },
                                ].map((feature) => (
                                    <div key={feature.label} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{feature.label}</span>
                                        {feature.status === 'present' ? (
                                            <Badge variant="outline" className="bg-success/5 text-success border-success/20">
                                                {feature.value}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">
                                                {feature.value}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base text-destructive flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 border-destructive/20">
                                Stop Tracking Keyword
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Progress({ value, className }: { value: number; className?: string }) {
    return (
        <div className={`w-full bg-muted rounded-none overflow-hidden ${className}`}>
            <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

function AlertTriangle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}
