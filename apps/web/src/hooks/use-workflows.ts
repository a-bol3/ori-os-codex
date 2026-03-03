'use client';

import { useEffect, useState } from 'react';

export type WorkflowStatus = 'active' | 'paused' | 'draft';

export interface Workflow {
    id: string;
    name: string;
    description: string;
    status: WorkflowStatus;
    lastRun?: string;
    executions?: number;
}

export function useWorkflows() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const normalize = (w: any): Workflow => {
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
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/automations/workflows`, {
                cache: 'no-store',
            });

            if (!res.ok) throw new Error(`Failed to fetch workflows (${res.status})`);

            const data = await res.json();
            const list = Array.isArray(data) ? data.map(normalize) : [];

            if (list.length > 0) {
                setWorkflows(list);
            } else {
                setWorkflows([
                    {
                        id: '1',
                        name: 'Auto-reply to New Leads',
                        description: 'Send a personalized email when a new contact is added',
                        status: 'active',
                        lastRun: '2 hours ago',
                        executions: 42,
                    },
                    {
                        id: '2',
                        name: 'Slack Notify: Big Deal',
                        description: 'Post to #sales when a deal over $50k is created',
                        status: 'active',
                        lastRun: '1 day ago',
                        executions: 7,
                    },
                    {
                        id: '3',
                        name: 'Monthly Report Sync',
                        description: 'Export monthly performance to Google Sheets',
                        status: 'paused',
                        executions: 3,
                    },
                ]);
            }
        } catch (err) {
            console.error('Fetch workflows failed:', err);
            setWorkflows([
                {
                    id: '1',
                    name: 'Auto-reply to New Leads',
                    description: 'Send a personalized email when a new contact is added',
                    status: 'active',
                    lastRun: '2 hours ago',
                    executions: 42,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { workflows, isLoading, refresh: fetchWorkflows };
}
