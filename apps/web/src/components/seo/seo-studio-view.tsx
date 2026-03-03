'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    TrendingUp,
    Globe,
    AlertCircle,
    CheckCircle2,
    BarChart3,
    Plus,
    RefreshCw,
    Target,
    FileText,
    Activity,
    Loader2,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Progress,
    Skeleton,
} from '@ori-os/ui';
import { useSEO } from '@/hooks/use-seo';
import { CrawlIssuesList } from './crawl-issues-list';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function SEOStudioView() {
    const [activeTab, setActiveTab] = useState('overview');
    const {
        projects,
        selectedProject,
        setSelectedProjectId,
        latestCrawl,
        issues,
        issuesSummary,
        isLoading,
        startCrawl,
        addKeyword,
    } = useSEO();

    const [isCrawling, setIsCrawling] = useState(false);
    const [newKeyword, setNewKeyword] = useState('');

    const handleRunAudit = async () => {
        if (!selectedProject) return;
        setIsCrawling(true);
        toast.info(`Starting audit for ${selectedProject.domain}...`);
        try {
            await startCrawl(selectedProject.id);
            toast.success('Audit enqueued successfully. Results will appear shortly.');
        } catch (err) {
            toast.error('Failed to start audit.');
        } finally {
            setIsCrawling(false);
        }
    };

    const handleAddKeyword = async () => {
        if (!selectedProject || !newKeyword) return;
        try {
            await addKeyword(selectedProject.id, newKeyword);
            setNewKeyword('');
            toast.success(`Keyword "${newKeyword}" added.`);
        } catch (err) {
            toast.error('Failed to add keyword.');
        }
    };

    if (projects.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <Globe className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-bold">No SEO Projects Found</h2>
                <p className="text-muted-foreground max-w-sm">
                    Create your first SEO project to start monitoring your search performance and technical health.
                </p>
                <Button className="bg-vivid-tangerine hover:bg-tangerine-dark">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">SEO Studio</h1>
                    <p className="text-muted-foreground">Manage inbound growth and technical SEO</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => toast.info('GSC Sync coming soon.')}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync GSC
                    </Button>
                    <Button
                        size="sm"
                        className="bg-vivid-tangerine hover:bg-tangerine-dark"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>
            </div>

            {/* Project Selector */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => setSelectedProjectId(project.id)}
                                className={`flex items-center gap-3 px-4 py-2 border transition whitespace-nowrap ${selectedProject?.id === project.id
                                        ? 'border-vivid-tangerine bg-vivid-tangerine/10'
                                        : 'border-border hover:bg-muted/50'
                                    }`}
                            >
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <div className="text-left">
                                    <p className="font-medium text-sm">{project.name}</p>
                                    <p className="text-xs text-muted-foreground">{project.domain}</p>
                                </div>
                                {project.gscConnected ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="issues">Technical Issues</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-8 w-8 text-vivid-tangerine" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Organic Clicks</p>
                                        <p className="text-xl font-bold">--</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Search className="h-8 w-8 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Keywords</p>
                                        <p className="text-xl font-bold">{selectedProject?.keywords || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-8 w-8 text-green-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Avg Position</p>
                                        <p className="text-xl font-bold">{selectedProject?.avgPosition || '--'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Audit Issues</p>
                                        <p className="text-xl font-bold">{latestCrawl?.issuesFound || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Performance Chart Placeholder */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Organic Performance</CardTitle>
                                    <CardDescription>Last 30 days click and impression trends</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center bg-muted/30 border border-border">
                                        <div className="text-center">
                                            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">Performance chart data pending GSC connection</p>
                                            <Button
                                                variant="link"
                                                className="text-vivid-tangerine mt-2"
                                            >
                                                Connect GSC for live data
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Last Audit</CardTitle>
                                    <CardDescription>
                                        {latestCrawl?.completedAt ? formatDistanceToNow(new Date(latestCrawl.completedAt), { addSuffix: true }) : 'Never audited'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Health Score</span>
                                        <span className="font-bold text-green-500">92/100</span>
                                    </div>
                                    <Progress value={92} className="h-2" />
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="p-3 bg-muted/50 rounded-none text-center">
                                            <p className="text-xs text-muted-foreground uppercase">Pages</p>
                                            <p className="text-lg font-bold">{latestCrawl?.pagesCrawled || 0}</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-none text-center">
                                            <p className="text-xs text-muted-foreground uppercase">Errors</p>
                                            <p className="text-lg font-bold text-destructive">{latestCrawl?.criticalIssues || 0}</p>
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline" onClick={handleRunAudit} disabled={isCrawling}>
                                        {isCrawling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                        Run New Audit
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="keywords" className="space-y-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Enter keyword to track..."
                                    className="flex-1"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                />
                                <Button className="bg-vivid-tangerine hover:bg-tangerine-dark" onClick={handleAddKeyword}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Keyword
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tracked Keywords</CardTitle>
                            <CardDescription>Monitoring {selectedProject?.domain || 'project'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border">
                                <Search className="h-10 w-10 mx-auto mb-4 opacity-50" />
                                <p>Keyword rank tracking is being processed.</p>
                                <p className="text-sm">Real SERP data will appear as soon as the first check completes.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="issues" className="space-y-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    ) : (
                        <CrawlIssuesList issues={issues} summary={issuesSummary} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
