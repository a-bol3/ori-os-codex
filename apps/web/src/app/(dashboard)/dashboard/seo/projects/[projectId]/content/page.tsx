'use client';

import { useState } from 'react';
import { Card, Button, Input, Label } from '@ori-os/ui';
import { Search, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ContentAnalysisPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [pageUrl, setPageUrl] = useState('');
    const [targetKeyword, setTargetKeyword] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!pageUrl || !targetKeyword) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch(`/api/seo/projects/${projectId}/content/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    pageUrl,
                    targetKeyword,
                    includeCompetitors: true,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysis(data);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Content Analysis</h1>
                <p className="text-muted-foreground mt-1">
                    Analyze your content and compare with top-ranking competitors
                </p>
            </div>

            {/* Analysis Form */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="pageUrl">Page URL</Label>
                        <Input
                            id="pageUrl"
                            type="url"
                            placeholder="https://example.com/page"
                            value={pageUrl}
                            onChange={(e) => setPageUrl(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="keyword">Target Keyword</Label>
                        <Input
                            id="keyword"
                            type="text"
                            placeholder="best seo tools"
                            value={targetKeyword}
                            onChange={(e) => setTargetKeyword(e.target.value)}
                        />
                    </div>

                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                        {isAnalyzing ? (
                            'Analyzing...'
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Analyze Content
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* Results */}
            {analysis && (
                <div className="space-y-6">
                    {/* SEO Score */}
                    <Card className="p-6">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold mb-4">SEO Score</h2>
                            <div className="relative inline-flex items-center justify-center">
                                <div
                                    className={`text-6xl font-bold ${analysis.score >= 80
                                        ? 'text-green-600'
                                        : analysis.score >= 60
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                        }`}
                                >
                                    {analysis.score}
                                </div>
                                <span className="text-2xl text-muted-foreground ml-1">/100</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {analysis.score >= 80
                                    ? 'Excellent optimization!'
                                    : analysis.score >= 60
                                        ? 'Good, but room for improvement'
                                        : 'Needs significant optimization'}
                            </p>
                        </div>
                    </Card>

                    {/* Your Page Metrics */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Your Page Analysis</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Word Count</p>
                                <p className="text-2xl font-bold">{analysis.yourPage.wordCount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Keyword Density</p>
                                <p className="text-2xl font-bold">
                                    {analysis.yourPage.keywordDensity}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Images</p>
                                <p className="text-2xl font-bold">{analysis.yourPage.hasImages}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Internal Links</p>
                                <p className="text-2xl font-bold">
                                    {analysis.yourPage.hasInternalLinks}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Keyword in Title</span>
                                {analysis.yourPage.keywordInTitle ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4" /> Yes
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" /> No
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Keyword in Meta Description</span>
                                {analysis.yourPage.keywordInMeta ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4" /> Yes
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" /> No
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Keyword in H1</span>
                                {analysis.yourPage.keywordInH1 ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4" /> Yes
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" /> No
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Recommendations */}
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
                            <div className="space-y-3">
                                {analysis.recommendations.map((rec: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-none border-l-4 ${rec.priority === 'high'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                            : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className={`text-xs font-medium px-2 py-1 rounded ${rec.priority === 'high'
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                            }`}
                                                    >
                                                        {rec.priority.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {rec.category}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-sm">{rec.issue}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    💡 {rec.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Competitors Comparison */}
                    {analysis.competitors && analysis.competitors.length > 0 && (
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">
                                Top Competitors ({analysis.competitors.length})
                            </h2>
                            <div className="space-y-3">
                                {analysis.competitors.map((comp: any, index: number) => (
                                    <div key={index} className="p-4 border rounded-none">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">#{comp.position}</span>
                                                    <a
                                                        href={comp.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        {comp.title}
                                                    </a>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {comp.url}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                                            <div>
                                                <span className="text-muted-foreground">Words:</span>{' '}
                                                <span className="font-medium">{comp.wordCount}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Density:</span>{' '}
                                                <span className="font-medium">
                                                    {comp.keywordDensity}%
                                                </span>
                                            </div>
                                            <div>
                                                {comp.keywordInTitle && comp.keywordInMeta ? (
                                                    <span className="text-green-600 text-xs">
                                                        ✓ Well optimized
                                                    </span>
                                                ) : (
                                                    <span className="text-yellow-600 text-xs">
                                                        ⚠ Partially optimized
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
