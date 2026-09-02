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
                const data = await response.json();
                setCrawls(data.data || []);
                setError(null);
            } catch (err) {
                setCrawls([]);
                setError(getErrorMessage(err, 'Failed to fetch crawls'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchCrawls();
    }, [projectId]);

    return { crawls, isLoading, error };
}

export function useCrawl(projectId?: string, crawlId?: string) {
    const [crawl, setCrawl] = useState<Crawl | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId || !crawlId) {
            setCrawl(null);
            setIsLoading(false);
            return;
        }

        const fetchCrawl = async () => {
            try {
                setIsLoading(true);
                const response = await apiFetch(`/seo/projects/${projectId}/crawl/${crawlId}`);

                const data = await response.json();
                setCrawl(data);
                setError(null);
            } catch (err) {
                setCrawl(null);
                setError(getErrorMessage(err, 'Failed to fetch crawl'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchCrawl();
    }, [projectId, crawlId]);

    return { crawl, isLoading, error };
}

export function useCrawlIssues(projectId?: string, crawlId?: string) {
    const [issues, setIssues] = useState<CrawlIssue[]>([]);
    const [summary, setSummary] = useState({ critical: 0, warning: 0, info: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId || !crawlId) {
            setIssues([]);
            setSummary({ critical: 0, warning: 0, info: 0 });
            setIsLoading(false);
            return;
        }

        const fetchIssues = async () => {
            try {
                setIsLoading(true);
                const response = await apiFetch(`/seo/projects/${projectId}/crawl/${crawlId}/issues`);

                const data = await response.json();
                setIssues(data.data || []);
                setSummary(data.summary || { critical: 0, warning: 0, info: 0 });
                setError(null);
            } catch (err) {
                setIssues([]);
                setSummary({ critical: 0, warning: 0, info: 0 });
                setError(getErrorMessage(err, 'Failed to fetch crawl issues'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchIssues();
    }, [projectId, crawlId]);

    return { issues, summary, isLoading, error };
}
