'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, Button } from '@ori-os/ui';
import { Plus, TrendingUp, TrendingDown, AlertCircle, Search, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';
import { useSEOProjects } from '@/hooks/use-seo-projects';
import { useCrawls } from '@/hooks/use-crawls';
import { AlertsList } from '@/components/seo/alerts-list';

export default function ProjectDashboardPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const { projects, isLoading: loadingProjects } = useSEOProjects();
    const { crawls, isLoading: loadingCrawls } = useCrawls(projectId);

    const project = projects.find((p) => p.id === projectId);
    const latestCrawl = crawls[0];

    const stats = [
        {
            label: 'Tracked Keywords',
            value: project?.keywords || 0,
            change: '+3',
            trend: 'up' as const,
            icon: Search,
        },
        {
            label: 'Avg. Position',
            value: project?.avgPosition || 0,
            change: '-2',
            trend: 'up' as const,
            icon: TrendingUp,
        },
        {
            label: 'Critical Issues',
            value: latestCrawl?.criticalIssues || 0,
            change: '-1',
            trend: 'up' as const,
            icon: AlertCircle,
        },
        {
            label: 'Pages Crawled',
            value: latestCrawl?.pagesCrawled || 0,
            change: '+5',
            trend: 'up' as const,
            icon: ExternalLink,
        },
    ];

    if (loadingProjects || loadingCrawls) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">Loading project data...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
                    <p className="text-muted-foreground mb-4">The SEO project you're looking for doesn't exist.</p>
                    <Link href="/dashboard/seo">
                        <Button>Back to Projects</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    <p className="text-muted-foreground mt-1">{project.domain}</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/seo/projects/${projectId}/audit`}>
                        <Button variant="outline">
                            <Search className="mr-2 h-4 w-4" />
                            Audits
                        </Button>
                    </Link>
                    <Link href={`/dashboard/seo/projects/${projectId}/content`}>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Content
                        </Button>
                    </Link>
                    <Link href={`/dashboard/seo/projects/${projectId}/backlinks`}>
                        <Button variant="outline">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Backlinks
                        </Button>
                    </Link>
                    <Link href={`/dashboard/seo/projects/${projectId}/competitors`}>
                        <Button variant="outline">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Competitors
                        </Button>
                    </Link>
                    <Link href={`/dashboard/seo/keywords`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Keywords
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </span>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{stat.value}</span>
                                    <span
                                        className={`text-sm font-medium ${stat.trend === 'up'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}
                                    >
                                        {stat.change}
                                    </span>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Latest Crawl */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Latest Site Audit</h2>
                        <Link href={`/dashboard/seo/projects/${projectId}/audit`}>
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>

                    {latestCrawl ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <span className="text-sm font-medium capitalize">{latestCrawl.status}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Pages Crawled</span>
                                <span className="text-sm font-medium">{latestCrawl.pagesCrawled}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Issues Found</span>
                                <span className="text-sm font-medium">{latestCrawl.issuesFound}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Critical Issues</span>
                                <span className="text-sm font-medium text-red-600">
                                    {latestCrawl.criticalIssues}
                                </span>
                            </div>
                            <Link href={`/dashboard/seo/projects/${projectId}/audit/${latestCrawl.id}`}>
                                <Button className="w-full mt-2">View Crawl Details</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-4">No crawls yet</p>
                            <Link href={`/dashboard/seo/projects/${projectId}/audit`}>
                                <Button>Run First Audit</Button>
                            </Link>
                        </div>
                    )}
                </Card>

                {/* Keywords Overview */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Keywords Overview</h2>
                        <Link href="/dashboard/seo/keywords">
                            <Button variant="ghost" size="sm">
                                Manage
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Keywords</span>
                            <span className="text-sm font-medium">{project.keywords}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Avg. Position</span>
                            <span className="text-sm font-medium">{project.avgPosition}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Top 10 Rankings</span>
                            <span className="text-sm font-medium">12</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">This Week</span>
                            <span className="text-sm font-medium text-green-600">+3 improved</span>
                        </div>
                        <Link href="/dashboard/seo/keywords">
                            <Button className="w-full mt-2">Track Keywords</Button>
                        </Link>
                    </div>
                </Card>

                {/* Recent Alerts */}
                <Card className="p-6 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Recent Alerts</h2>
                        <Link href={`/dashboard/seo/projects/${projectId}/alerts`}>
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>

                    <AlertsList projectId={projectId} limit={3} compact />
                </Card>
            </div>
        </div>
    );
}
