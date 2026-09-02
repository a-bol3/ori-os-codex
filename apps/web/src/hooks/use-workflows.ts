'use client';

import { useEffect, useState } from 'react';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

export type WorkflowStatus = 'active' | 'paused' | 'draft';

export interface Workflow {
    id: string;
    name: string;
    description: string;
    status: WorkflowStatus;
    lastRun?: string;
    executions?: number;
}

interface WorkflowApiItem {
    id?: string;
    name?: string;
    description?: string;
    status?: string;
    lastRun?: string | null;
    executions?: number | null;
}

export function useWorkflows() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const normalize = (w: WorkflowApiItem): Workflow => {
        const raw = String(w?.status ?? 'draft').toLowerCase();
        const status: WorkflowStatus =
            raw === 'active' ? 'active' : raw === 'paused' ? 'paused' : 'draft';

        return {
            id: String(w?.id ?? ''),
            name: String(w?.name ?? 'Untitled Workflow'),
            description: String(w?.description ?? ''),
            status,
            lastRun: w?.lastRun ? String(w.lastRun) : undefined,
            executions: typeof w?.executions === 'number' ? w.executions : undefined,
        };
    };

    const fetchWorkflows = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiFetch('/automations/workflows');
            const data: WorkflowApiItem[] = await res.json();
            const list = Array.isArray(data) ? data.map(normalize) : [];
            setWorkflows(list);
        } catch (err) {
            console.error('Fetch workflows failed:', err);
            setWorkflows([]);
            setError(getErrorMessage(err, 'Failed to load workflows.'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { workflows, isLoading, error, refresh: fetchWorkflows };
}
