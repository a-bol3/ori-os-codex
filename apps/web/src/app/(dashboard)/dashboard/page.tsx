'use client';

import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Badge,
    Progress,
} from '@ori-os/ui';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    DollarSign,
    Mail,
    ArrowRight,
    Sparkles,
    BarChart3,
    Target,
    Clock,
    Beaker,
} from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';
import { useMemo } from 'react';
import Link from 'next/link';
import { DashboardStats } from '@/components/dashboard-stats';

return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
    >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here's what's happening with your business.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2 rounded-none h-10 px-4 border-border/60" asChild>
                    <Link href="/dashboard/analytics">
                        <BarChart3 className="h-4 w-4" />
                        Reports
                    </Link>
                </Button>
                <Button variant="accent" size="sm" className="gap-2 rounded-none h-10 px-6 shadow-lg shadow-tangerine/20" asChild>
                    <Link href="/dashboard/intelligence">
                        <Sparkles className="h-4 w-4" />
                        Quick Enrich
                    </Link>
                </Button>
            </div>
        </div>

        <DashboardStats loading={isLoading} data={dashboardData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <Card className="lg:col-span-2 rounded-none border-border/40 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-4">
                    <div>
                        <CardTitle className="text-lg">Activity Feed</CardTitle>
                        <CardDescription className="text-xs">Latest updates from your workspace</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-tangerine hover:text-tangerine hover:bg-tangerine/5" asChild>
                        <Link href="/dashboard/activity" className="flex items-center gap-2">
                            View all
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 animate-pulse">
                                    <div className="h-10 w-10 bg-muted rounded-none" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 bg-muted rounded-none" />
                                        <div className="h-3 w-1/2 bg-muted rounded-none" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            activities.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="flex items-start gap-4 p-3 rounded-none hover:bg-muted/50 transition-all duration-300 group border border-transparent hover:border-border/40"
                                >
                                    <div className="p-2.5 rounded-none bg-tangerine/10 shadow-sm border border-tangerine/20">
                                        <div className="h-4 w-4 text-tangerine transition-transform duration-300 group-hover:scale-110">
                                            {activity.type === 'contact' ? <Users className="h-4 w-4" /> : activity.type === 'deal' ? <Target className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-foreground text-sm">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.description}</p>
                                    </div>
                                    <div className="text-[10px] font-medium text-muted-foreground/60 whitespace-nowrap bg-muted px-2 py-1 rounded-none uppercase tracking-wider">
                                        {activity.time.split('T')[0]}
                                    </div>
                                </motion.div>
                            ))
                        )}
                        {!isLoading && activities.length === 0 && (
                            <div className="text-muted-foreground text-sm py-12 text-center border border-dashed border-border/60 bg-muted/5">
                                <div className="flex flex-col items-center gap-2">
                                    <Beaker className="h-8 w-8 opacity-20" />
                                    <p>No recent activity detected.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Module Summaries */}
            <div className="space-y-6">
                <Card className="rounded-none border-border/40 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 border-b border-border/40">
                        <CardTitle className="text-lg">Module Overviews</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid divide-y divide-border/40">
                            <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-none border border-blue-500/20">
                                        <Building2 className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-wider">CRM</span>
                                </div>
                                <div className="text-xs font-bold text-foreground bg-blue-500/5 px-2 py-1 border border-blue-500/10">
                                    {isLoading ? '...' : `${dashboardData?.deals.total} ACTIVE DEALS`}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-tangerine/10 rounded-none border border-tangerine/20">
                                        <Mail className="h-4 w-4 text-tangerine" />
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-wider">Engagement</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-foreground bg-tangerine/5 px-2 py-1 border border-tangerine/10">
                                        {isLoading ? '...' : `${dashboardData?.campaigns.active} RUNNING`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-none border border-purple-500/20">
                                        <Clock className="h-4 w-4 text-purple-500" />
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-wider">Automation</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-foreground bg-purple-500/5 px-2 py-1 border border-purple-500/10">
                                        {isLoading ? '...' : `${dashboardData?.workflows.runs} TOTAL RUNS`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-none border border-green-500/20">
                                        <Target className="h-4 w-4 text-green-500" />
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-wider">SEO STUDIO</span>
                                </div>
                                <div className="text-xs font-bold text-foreground bg-green-500/5 px-2 py-1 border border-green-500/10">
                                    {isLoading ? '...' : `${dashboardData?.seo.projects} PROJECTS`}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-tangerine/20 bg-tangerine/[0.02] relative overflow-hidden group shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-tangerine/5 blur-3xl -mr-16 -mt-16 group-hover:bg-tangerine/10 transition-colors" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-2 text-tangerine mb-3">
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Intelligence Insight</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                            Your deal pipeline is <strong>23% larger</strong> than last month.
                            Consider enlisting 4 more companies for enrichment to maintain momentum.
                        </p>
                        <Button size="sm" className="w-full mt-6 bg-tangerine hover:bg-tangerine/90 text-white border-none shadow-lg shadow-tangerine/20 rounded-none font-bold uppercase tracking-wider h-10 group" asChild>
                            <Link href="/dashboard/intelligence">
                                Enrich Now
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </motion.div>
);
}
