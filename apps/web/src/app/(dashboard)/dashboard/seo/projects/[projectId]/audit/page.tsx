'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, Button } from '@ori-os/ui';
import { Plus, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import { useCrawls } from '@/hooks/use-crawls';
import { CrawlStatusBadge } from '@/components/seo/crawl-status-badge';

export default function AuditOverviewPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const { crawls, isLoading } = useCrawls(projectId);

    const handleStartCrawl = async () => {
        try {
            const response = await fetch(`/api/seo/projects/${projectId}/crawl`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, maxPages: 500 }),
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to start crawl:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">Loading crawls...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Site Audits</h1>
                    <p className="text-muted-foreground mt-1">
                        Technical SEO analysis and issue detection
                    </p>
                </div>
                <Button onClick={handleStartCrawl}>
                    <Plus className="mr-2 h-4 w-4" />
                    Run New Audit
                </Button>
            </div>

            {/* Latest Crawl Summary */}
            {crawls[0] && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Latest Audit</h2>
                            <CrawlStatusBadge status={crawls[0].status} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Pages Crawled</p>
                                <p className="text-2xl font-bold">{crawls[0].pagesCrawled}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Issues Found</p>
                                <p className="text-2xl font-bold">{crawls[0].issuesFound}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Critical</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {crawls[0].criticalIssues}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Warnings</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {crawls[0].warnings}
                                </p>
                            </div>
                        </div>

                        <Link href={`/dashboard/seo/projects/${projectId}/audit/${crawls[0].id}`}>
                            <Button className="w-full">View Details & Issues</Button>
                        </Link>
                    </Card>
                </motion.div>
            )}

            {/* Crawl History */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Audit History</h2>

                {crawls.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Audits Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Run your first site audit to discover technical SEO issues
                        </p>
                        <Button onClick={handleStartCrawl}>
                            <Plus className="mr-2 h-4 w-4" />
                            Run First Audit
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {crawls.map((crawl, index) => (
                            <motion.div
                                key={crawl.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CrawlStatusBadge status={crawl.status} />
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(crawl.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Pages: </span>
                                                    <span className="font-medium">{crawl.pagesCrawled}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Issues: </span>
                                                    <span className="font-medium">{crawl.issuesFound}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Critical: </span>
                                                    <span className="font-medium text-red-600">
                                                        {crawl.criticalIssues}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/dashboard/seo/projects/${projectId}/audit/${crawl.id}`}
                                        >
                                            <Button variant="ghost">View Details</Button>
                                        </Link>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
