'use client';

import { useEffect, useState } from 'react';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

export interface Crawl {
    id: string;
    projectId: string;
    organizationId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    pagesFound: number;
    pagesCrawled: number;
    issuesFound: number;
    criticalIssues: number;
    warnings: number;
    errorMessage?: string;
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CrawlIssue {
    id: string;
    crawlId: string;
    severity: 'critical' | 'warning' | 'info';
    category: 'meta' | 'links' | 'images' | 'performance' | 'mobile' | 'schema';
    type: string;
    pageUrl: string;
    description: string;
    recommendation: string;
    status: 'open' | 'acknowledged' | 'fixed' | 'ignored';
    createdAt: Date;
}

export interface CrawlPage {
    id: string;
    crawlId: string;
    url: string;
    statusCode: number;
    loadTime: number;
    pageSize: number;
    title: string;
    metaDescription?: string;
    h1?: string;
    h2Count: number;
    wordCount: number;
    internalLinks: number;
    externalLinks: number;
    brokenLinks: number;
    imageCount: number;
    imagesWithoutAlt: number;
    createdAt: Date;
}

export function useCrawls(projectId?: string) {
    const [crawls, setCrawls] = useState<Crawl[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId) {
            setIsLoading(false);
            return;
        }

        const fetchCrawls = async () => {
            try {
                setIsLoading(true);
                const response = await apiFetch(`/seo/projects/${projectId}/crawl`);

                if (!response.ok) {
                    throw new Error('Failed to fetch crawls');
                }

                const data = await response.json();
                setCrawls(data.data || []);
                setError(null);
            } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[Crawls] API unavailable, using demo data');
                    setError(null);
                    setCrawls([{
                        id: 'crawl-1',
                        projectId: projectId || '',
                        organizationId: 'default-org-id',
                        status: 'completed',
                        pagesFound: 45,
                        pagesCrawled: 45,
                        issuesFound: 12,
                        criticalIssues: 3,
                        warnings: 9,
                        startedAt: new Date(Date.now() - 3600000),
                        completedAt: new Date(),
                        createdAt: new Date(Date.now() - 86400000),
                        updatedAt: new Date(),
                    }]);
                } else {
                    setCrawls([]);
                    setError(getErrorMessage(err, 'Failed to fetch crawls'));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCrawls();
    }, [projectId]);

    return { crawls, isLoading, error };
}

export function useCrawl(crawlId?: string) {
    const [crawl, setCrawl] = useState<Crawl | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!crawlId) {
            setIsLoading(false);
            return;
        }

        const fetchCrawl = async () => {
            try {
                setIsLoading(true);
                const response = await apiFetch(`/seo/projects/default/crawl/${crawlId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch crawl');
                }

                const data = await response.json();
                setCrawl(data);
                setError(null);
            } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[Crawl] API unavailable, using demo data');
                    setError(null);

                    if (crawlId === 'crawl-1' || crawlId === '1') {
                        setCrawl({
                            id: 'crawl-1',
                            projectId: '1',
                            organizationId: 'default-org-id',
                            status: 'completed',
                            pagesFound: 45,
                            pagesCrawled: 45,
                            issuesFound: 12,
                            criticalIssues: 3,
                            warnings: 9,
                            startedAt: new Date(Date.now() - 3600000),
                            completedAt: new Date(),
                            createdAt: new Date(Date.now() - 86400000),
                            updatedAt: new Date(),
                        });
                    } else {
                        setCrawl(null);
                    }
                } else {
                    setCrawl(null);
                    setError(getErrorMessage(err, 'Failed to fetch crawl'));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCrawl();
    }, [crawlId]);

    return { crawl, isLoading, error };
}

export function useCrawlIssues(crawlId?: string) {
    const [issues, setIssues] = useState<CrawlIssue[]>([]);
    const [summary, setSummary] = useState({ critical: 0, warning: 0, info: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!crawlId) {
            setIsLoading(false);
            return;
        }

        const fetchIssues = async () => {
            try {
                setIsLoading(true);
                const response = await apiFetch(`/seo/projects/default/crawl/${crawlId}/issues`);

                if (!response.ok) {
                    throw new Error('Failed to fetch issues');
                }

                const data = await response.json();
                setIssues(data.data || []);
                setSummary(data.summary || { critical: 0, warning: 0, info: 0 });
                setError(null);
            } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[Issues] API unavailable, using demo data');
                    setError(null);

                    if (crawlId === 'crawl-1' || crawlId === '1') {
                        setIssues([
                            {
                                id: 'issue-1',
                                crawlId: 'crawl-1',
                                severity: 'critical',
                                category: 'meta',
                                type: 'missing_title',
                                pageUrl: '/contact',
                                description: 'Missing meta title tag on the contact page.',
                                recommendation: 'Add a descriptive title tag between 50-60 characters.',
                                status: 'open',
                                createdAt: new Date(),
                            },
                            {
                                id: 'issue-2',
                                crawlId: 'crawl-1',
                                severity: 'warning',
                                category: 'performance',
                                type: 'slow_load',
                                pageUrl: '/products/ai',
                                description: 'Page load time is 3.2s, which exceeds the 2s target.',
                                recommendation: 'Optimize hero images and defer non-critical scripts.',
                                status: 'open',
                                createdAt: new Date(),
                            }
                        ]);
                        setSummary({ critical: 1, warning: 1, info: 0 });
                    } else {
                        setIssues([]);
                        setSummary({ critical: 0, warning: 0, info: 0 });
                    }
                } else {
                    setIssues([]);
                    setSummary({ critical: 0, warning: 0, info: 0 });
                    setError(getErrorMessage(err, 'Failed to fetch crawl issues'));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchIssues();
    }, [crawlId]);

    return { issues, summary, isLoading, error };
}
