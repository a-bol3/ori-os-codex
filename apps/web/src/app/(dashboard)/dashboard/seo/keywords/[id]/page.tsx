'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    AlertTriangle,
    ChevronLeft,
    ExternalLink,
    Globe,
    Loader2,
    Search,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@ori-os/ui';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

interface Keyword {
    id: string;
    projectId: string;
    keyword: string;
    targetUrl?: string | null;
    searchVolume?: number | null;
    difficulty?: number | null;
    cpc?: number | null;
    lastPosition?: number | null;
}

interface Ranking {
    position: number;
    prevPosition?: number | null;
    hasSnippet?: boolean;
    hasPAA?: boolean;
    hasImages?: boolean;
    hasVideos?: boolean;
    createdAt: string;
}

export default function KeywordDetailPage() {
    const params = useParams();
    const id = String(params.id);
    const [keyword, setKeyword] = useState<Keyword | null>(null);
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [projectName, setProjectName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiFetch(`/seo/keywords/${encodeURIComponent(id)}/rankings`);
                const data = await response.json() as { keyword: Keyword; rankings: Ranking[] } | null;
                if (!data?.keyword) throw new Error('Keyword not found.');

                let resolvedProjectName: string | null = data.keyword.projectId;
                try {
                    const projectResponse = await apiFetch(`/seo/projects/${encodeURIComponent(data.keyword.projectId)}`);
                    const project = await projectResponse.json() as { name?: string };
                    resolvedProjectName = project.name || resolvedProjectName;
                } catch {
                    // The keyword data remains authoritative; the project label is optional context.
                }

                if (!cancelled) {
                    setKeyword(data.keyword);
                    setRankings(Array.isArray(data.rankings) ? data.rankings : []);
                    setProjectName(resolvedProjectName);
                }
            } catch (err) {
                if (!cancelled) {
                    setKeyword(null);
                    setRankings([]);
                    setError(getErrorMessage(err, 'Failed to load keyword details.'));
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [id]);

    const latestRanking = rankings[0];
    const currentPosition = keyword?.lastPosition ?? latestRanking?.position ?? null;
    const previousPosition = latestRanking?.prevPosition ?? null;
    const rankChange = currentPosition !== null && previousPosition !== null
        ? previousPosition - currentPosition
        : null;
    const rankingHistory = useMemo(
        () => [...rankings].reverse().map((ranking) => ({ date: ranking.createdAt, position: ranking.position })),
        [rankings],
    );

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (error || !keyword) {
        return (
            <div role="alert" className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-lg px-6">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Unable to load keyword</h2>
                    <p className="text-muted-foreground mb-4">{error || 'Keyword not found.'}</p>
                    <Link href="/dashboard/seo/keywords" className="text-primary hover:underline">Back to Keywords</Link>
                </div>
            </div>
        );
    }

    const rankingLabel = currentPosition === null ? 'Not ranked' : `#${currentPosition}`;
    const rankChangeLabel = rankChange === null
        ? 'No comparison data available'
        : rankChange > 0
            ? `Improved ${rankChange} position${rankChange === 1 ? '' : 's'}`
            : rankChange < 0
                ? `Dropped ${Math.abs(rankChange)} position${Math.abs(rankChange) === 1 ? '' : 's'}`
                : 'No change';
    const serpFeatures = latestRanking ? [
        { label: 'Featured Snippet', present: latestRanking.hasSnippet },
        { label: 'Related Questions', present: latestRanking.hasPAA },
        { label: 'Image Pack', present: latestRanking.hasImages },
        { label: 'Video Pack', present: latestRanking.hasVideos },
    ] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/seo/keywords" className="p-2 hover:bg-muted rounded-none">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{keyword.keyword}</h1>
                        {projectName && <Badge variant="secondary">{projectName}</Badge>}
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        Monitoring rankings for: <span className="text-foreground">{keyword.targetUrl || 'No target URL recorded'}</span>
                        {keyword.targetUrl && <ExternalLink className="h-3 w-3" />}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Current Rank</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{rankingLabel}</p>
                    <p className={`text-xs font-medium mt-2 ${rankChange !== null && rankChange > 0 ? 'text-success' : rankChange !== null && rankChange < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {rankChange !== null && rankChange > 0 && <TrendingUp className="inline h-3 w-3 mr-1" />}
                        {rankChange !== null && rankChange < 0 && <TrendingDown className="inline h-3 w-3 mr-1" />}
                        {rankChangeLabel}
                    </p>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Search Volume</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{keyword.searchVolume?.toLocaleString() || '—'}</p>
                    <p className="text-xs text-muted-foreground mt-2">Provider data</p>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Keyword Difficulty</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{keyword.difficulty ?? '—'}{keyword.difficulty !== null && keyword.difficulty !== undefined ? '/100' : ''}</p>
                    {keyword.difficulty !== null && keyword.difficulty !== undefined && <Progress value={keyword.difficulty} className="h-1.5 mt-4" />}
                </CardContent></Card>
                <Card><CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Estimated CPC</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{keyword.cpc !== null && keyword.cpc !== undefined ? `$${keyword.cpc.toFixed(2)}` : '—'}</p>
                    <p className="text-xs text-muted-foreground mt-2">Provider data</p>
                </CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Ranking History</CardTitle><CardDescription>Recorded ranking snapshots for this keyword</CardDescription></CardHeader>
                    <CardContent>
                        {rankingHistory.length === 0 ? <p className="py-16 text-center text-muted-foreground">No ranking data available yet.</p> : (
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={rankingHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                        <YAxis reversed domain={[1, 'auto']} axisLine={false} tickLine={false} />
                                        <Tooltip labelFormatter={(date) => new Date(date).toLocaleString()} />
                                        <Area type="monotone" dataKey="position" stroke="hsl(var(--primary))" strokeWidth={3} fill="hsl(var(--primary) / 0.15)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">SERP Features</CardTitle></CardHeader>
                    <CardContent>
                        {serpFeatures.length === 0 ? <p className="text-sm text-muted-foreground">No SERP snapshot available yet.</p> : (
                            <div className="space-y-4">
                                {serpFeatures.map((feature) => (
                                    <div key={feature.label} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{feature.label}</span>
                                        <Badge variant={feature.present ? 'outline' : 'secondary'}>{feature.present ? 'Present' : 'Not found'}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                            {latestRanking ? <Search className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                            {latestRanking ? `Last checked ${new Date(latestRanking.createdAt).toLocaleString()}` : 'Waiting for first ranking check'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Progress({ value, className }: { value: number; className?: string }) {
    return <div className={`w-full bg-muted rounded-none overflow-hidden ${className}`}><div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${value}%` }} /></div>;
}
