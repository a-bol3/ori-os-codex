'use client';

import { useState, useEffect, useCallback } from 'react';

export interface EnrichmentJob {
    id: string;
    targetType: 'COMPANY' | 'CONTACT';
    targetId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    provider: string;
    createdAt: string;
    updatedAt: string;
}

export function useEnrichmentJobs() {
    const [jobs, setJobs] = useState<EnrichmentJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intelligence/enrich/jobs`);
            if (!response.ok) throw new Error('Failed to fetch enrichment jobs');
            const data = await response.json();
            setJobs(data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching enrichment jobs:', err);
            setError(err.message);
            // Fallback to empty array on error for safety
            setJobs([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
        // Set up polling for job status updates (every 10 seconds)
        const interval = setInterval(fetchJobs, 10000);
        return () => clearInterval(interval);
    }, [fetchJobs]);

    return { jobs, isLoading, error, refresh: fetchJobs };
}
