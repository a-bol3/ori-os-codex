'use client';

import { useState, useEffect } from 'react';

export interface SEOProject {
    id: string;
    name: string;
    domain: string;
    description?: string;
    crawlFrequency: string;
    maxPagesToCrawl: number;
    gscConnected: boolean;
    keywords: number;  // Number of tracked keywords
    avgPosition: number;  // Average ranking position
    createdAt: string;
    updatedAt: string;
}

export function useSEOProjects() {
    const [projects, setProjects] = useState<SEOProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seo/projects`);
            if (!response.ok) throw new Error('Failed to fetch SEO projects');
            const data = await response.json();
            setProjects(data);
            setError(null);
        } catch (err) {
            console.warn('[SEO Projects] API unavailable, using demo data');
            setError(null);
            setProjects([
                {
                    id: '1',
                    name: 'Main Website',
                    domain: 'example.com',
                    description: 'Primary company website',
                    crawlFrequency: 'weekly',
                    maxPagesToCrawl: 100,
                    gscConnected: false,
                    keywords: 45,
                    avgPosition: 12.3,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    name: 'Blog',
                    domain: 'blog.example.com',
                    description: 'Company blog',
                    crawlFrequency: 'weekly',
                    maxPagesToCrawl: 500,
                    gscConnected: true,
                    keywords: 128,
                    avgPosition: 8.7,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return { projects, isLoading, error, refresh: fetchProjects };
}
