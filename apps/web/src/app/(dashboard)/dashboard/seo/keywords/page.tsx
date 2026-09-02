'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Badge,
    Input,
} from '@ori-os/ui';
import {
    TrendingUp,
    TrendingDown,
    Search,
    Plus,
    Download,
    Filter,
    BarChart3,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSEOProjects } from '@/hooks/use-seo-projects';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

interface Keyword {
    id: string;
    keyword: string;
    position: number | null;
    prevPosition: number | null;
    searchVolume: number | null;
    difficulty: number | null;
    url: string;
    project: string;
}

export default function KeywordsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { projects, isLoading: projectsLoading, error: projectsError } = useSEOProjects();

    useEffect(() => {
        if (projectsLoading) return;
        if (projectsError) {
            setError(projectsError);
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        const fetchKeywords = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const results = await Promise.all(projects.map(async (project) => {
                    const response = await apiFetch(`/seo/keywords?projectId=${encodeURIComponent(project.id)}`);
                    const data = await response.json() as Array<{
                        id: string;
                        keyword: string;
                        targetUrl?: string | null;
                        searchVolume?: number | null;
                        difficulty?: number | null;
                        lastPosition?: number | null;
                        rankings?: Array<{ position: number; prevPosition?: number | null }>;
                    }>;
                    return (Array.isArray(data) ? data : []).map((item) => ({
                        id: item.id,
                        keyword: item.keyword,
                        position: item.rankings?.[0]?.position ?? item.lastPosition ?? null,
                        prevPosition: item.rankings?.[0]?.prevPosition ?? null,
                        searchVolume: item.searchVolume ?? null,
                        difficulty: item.difficulty ?? null,
                        url: item.targetUrl || '—',
                        project: project.name,
                    }));
                }));
                if (!cancelled) setKeywords(results.flat());
            } catch (err) {
                if (!cancelled) {
                    setKeywords([]);
                    setError(getErrorMessage(err, 'Failed to load keywords.'));
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchKeywords();
        return () => { cancelled = true; };
    }, [projects, projectsLoading, projectsError]);

    const filteredKeywords = keywords.filter((kw) =>
        kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const rankedKeywords = keywords.filter((keyword) => keyword.position !== null);

    const getRankChange = (current: number | null, prev: number | null) => {
        if (current === null || prev === null) return { value: 0, trend: 'same' as const };
        const change = prev - current;
        return {
            value: Math.abs(change),
            trend: (change > 0 ? 'up' : change < 0 ? 'down' : 'same') as 'up' | 'down' | 'same',
        };
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (error) {
        return <div role="alert" className="p-6 text-destructive">Unable to load keywords: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Keyword Tracking</h1>
                    <p className="text-muted-foreground">Monitor keyword rankings across all projects</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="accent" asChild>
                        <Link href="/dashboard/seo/keywords/add">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Keywords
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Total Keywords</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{keywords.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Avg. Position</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                            {rankedKeywords.length > 0
                                ? (rankedKeywords.reduce((sum, keyword) => sum + (keyword.position ?? 0), 0) / rankedKeywords.length).toFixed(1)
                                : '—'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Top 3</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                            {keywords.filter((k) => k.position !== null && k.position <= 3).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Top 10</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                            {keywords.filter((k) => k.position !== null && k.position <= 10).length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Keywords</CardTitle>
                            <CardDescription>{filteredKeywords.length} keywords tracked</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                            <div className="col-span-4">Keyword</div>
                            <div className="col-span-2">Project</div>
                            <div className="col-span-1 text-center">Position</div>
                            <div className="col-span-1 text-center">Change</div>
                            <div className="col-span-2 text-right">Volume</div>
                            <div className="col-span-1 text-right">Difficulty</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Rows */}
                        {filteredKeywords.map((keyword, index) => {
                            const rankChange = getRankChange(keyword.position, keyword.prevPosition);
                            return (
                                <motion.div
                                    key={keyword.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="grid grid-cols-12 gap-4 px-4 py-3 rounded-none hover:bg-muted/50 transition-colors"
                                >
                                    <div className="col-span-4">
                                        <p className="font-medium text-foreground">{keyword.keyword}</p>
                                        <p className="text-xs text-muted-foreground">{keyword.url}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant="secondary">{keyword.project}</Badge>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <span className="font-semibold text-foreground">{keyword.position ?? '—'}</span>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        {rankChange.trend === 'up' && (
                                            <div className="flex items-center gap-1 text-success">
                                                <TrendingUp className="h-4 w-4" />
                                                <span className="text-sm font-medium">{rankChange.value}</span>
                                            </div>
                                        )}
                                        {rankChange.trend === 'down' && (
                                            <div className="flex items-center gap-1 text-destructive">
                                                <TrendingDown className="h-4 w-4" />
                                                <span className="text-sm font-medium">{rankChange.value}</span>
                                            </div>
                                        )}
                                        {rankChange.trend === 'same' && (
                                            <span className="text-sm text-muted-foreground">-</span>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-right text-muted-foreground">
                                        {keyword.searchVolume !== null ? `${keyword.searchVolume.toLocaleString()}/mo` : '—'}
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <Badge
                                            variant={
                                                (keyword.difficulty ?? 0) > 70
                                                    ? 'destructive'
                                                    : (keyword.difficulty ?? 0) > 50
                                                        ? 'default'
                                                        : 'secondary'
                                            }
                                        >
                                            {keyword.difficulty ?? '—'}
                                        </Badge>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/seo/keywords/${keyword.id}`}>
                                                <BarChart3 className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
