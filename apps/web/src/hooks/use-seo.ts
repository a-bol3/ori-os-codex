'use client';

import { useSEOProjects } from './use-seo-projects';
import { useCrawls, useCrawlIssues } from './use-crawls';
import { useState, useEffect } from 'react';

export function useSEO() {
    const { projects, isLoading: projectsLoading, refresh: refreshProjects } = useSEOProjects();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);

    const { crawls, isLoading: crawlsLoading } = useCrawls(selectedProject?.id);
    const latestCrawl = crawls && crawls.length > 0 ? crawls.find(c => c.status === 'completed') || crawls[0] : null;

    const { issues, summary: issuesSummary, isLoading: issuesLoading } = useCrawlIssues(latestCrawl?.id);

    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    const startCrawl = async (projectId: string) => {
        try {
            const response = await fetch(`/api/seo/projects/${projectId}/crawl`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maxPages: 1 }), // MVP: Homepage only
            });
            if (!response.ok) throw new Error('Crawl failed to start');
            return await response.json();
        } catch (err) {
            console.error('Start crawl error:', err);
            throw err;
        }
    };

    const addKeyword = async (projectId: string, keyword: string, targetUrl?: string) => {
        try {
            const response = await fetch(`/api/seo/keywords`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, keyword, targetUrl }),
            });
            if (!response.ok) throw new Error('Failed to add keyword');
            return await response.json();
        } catch (err) {
            console.error('Add keyword error:', err);
            throw err;
        }
    };

    return {
        projects,
        selectedProject,
        setSelectedProjectId,
        latestCrawl,
        issues,
        issuesSummary,
        isLoading: projectsLoading || (selectedProject && (crawlsLoading || issuesLoading)),
        refreshProjects,
        startCrawl,
        addKeyword,
    };
}
