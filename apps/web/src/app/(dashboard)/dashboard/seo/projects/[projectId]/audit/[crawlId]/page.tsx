'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@ori-os/ui';
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { useCrawl, useCrawlIssues } from '@/hooks/use-crawls';
import { CrawlStatusBadge } from '@/components/seo/crawl-status-badge';
import { CrawlIssuesList } from '@/components/seo/crawl-issues-list';

export default function CrawlDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const crawlId = params.crawlId as string;

    const { crawl, isLoading: loadingCrawl } = useCrawl(crawlId);
    const { issues, summary, isLoading: loadingIssues } = useCrawlIssues(crawlId);

    if (loadingCrawl || loadingIssues) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">Loading crawl details...</p>
                </div>
            </div>
        );
    }

    if (!crawl) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Crawl Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The crawl you're looking for doesn't exist.
                    </p>
                    <Link href={`/dashboard/seo/projects/${projectId}/audit`}>
                        <Button>Back to Audits</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <Link href={`/dashboard/seo/projects/${projectId}/audit`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Audits
                    </Button>
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Site Audit Details</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <CrawlStatusBadge status={crawl.status} />
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(crawl.createdAt).toLocaleDateString()}
                            </span>
                            {crawl.completedAt && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Duration:{' '}
                                    {Math.round(
                                        (new Date(crawl.completedAt).getTime() -
                                            new Date(crawl.startedAt || crawl.createdAt).getTime()) /
                                        1000
                                    )}
                                    s
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Pages Crawled</p>
                    <p className="text-3xl font-bold">{crawl.pagesCrawled}</p>
                    <p className="text-xs text-muted-foreground">of {crawl.pagesFound} found</p>
                </Card>

                <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Issues</p>
                    <p className="text-3xl font-bold">{crawl.issuesFound}</p>
                    <p className="text-xs text-muted-foreground">across all pages</p>
                </Card>

                <Card className="p-4 bg-red-50 dark:bg-red-950">
                    <p className="text-sm text-muted-foreground mb-1">Critical Issues</p>
                    <p className="text-3xl font-bold text-red-600">{crawl.criticalIssues}</p>
                    <p className="text-xs text-red-600">needs immediate attention</p>
                </Card>

                <Card className="p-4 bg-yellow-50 dark:bg-yellow-950">
                    <p className="text-sm text-muted-foreground mb-1">Warnings</p>
                    <p className="text-3xl font-bold text-yellow-600">{crawl.warnings}</p>
                    <p className="text-xs text-yellow-600">should be addressed</p>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="issues" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="issues">Issues ({issues.length})</TabsTrigger>
                    <TabsTrigger value="pages">Pages ({crawl.pagesCrawled})</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="issues">
                    <CrawlIssuesList issues={issues} summary={summary} />
                </TabsContent>

                <TabsContent value="pages">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Crawled Pages</h2>
                        <p className="text-muted-foreground">
                            Page details view coming soon. This will show all {crawl.pagesCrawled}{' '}
                            crawled pages with their metrics.
                        </p>
                    </Card>
                </TabsContent>

                <TabsContent value="overview">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Crawl Overview</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Crawl Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Started: </span>
                                        <span className="font-medium">
                                            {crawl.startedAt
                                                ? new Date(crawl.startedAt).toLocaleString()
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Completed: </span>
                                        <span className="font-medium">
                                            {crawl.completedAt
                                                ? new Date(crawl.completedAt).toLocaleString()
                                                : 'In progress'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {crawl.errorMessage && (
                                <div>
                                    <h3 className="font-medium mb-2 text-red-600">Error</h3>
                                    <p className="text-sm text-muted-foreground">{crawl.errorMessage}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="font-medium mb-2">Issue Breakdown</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Critical Issues:</span>
                                        <span className="font-medium text-red-600">
                                            {summary.critical}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Warnings:</span>
                                        <span className="font-medium text-yellow-600">
                                            {summary.warning}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Info:</span>
                                        <span className="font-medium text-blue-600">{summary.info}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
