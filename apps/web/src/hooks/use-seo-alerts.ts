'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@ori-os/ui';
import { getApiBaseUrl } from '@/lib/api-base';

interface SeoAlert {
    id: string;
    status?: string;
    [key: string]: unknown;
}

interface SeoAlertsResponse {
    data?: SeoAlert[];
}

export function useSEOAlerts(projectId: string) {
    const [alerts, setAlerts] = useState<SeoAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchAlerts = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${getApiBaseUrl()}/seo/projects/${projectId}/alerts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data: SeoAlertsResponse = await response.json();
                setAlerts(data.data ?? []);
            }
        } catch (error) {
            console.error('Failed to fetch alerts', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            fetchAlerts();
        }
    }, [projectId, fetchAlerts]);

    const markAsRead = async (alertId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${getApiBaseUrl()}/seo/projects/${projectId}/alerts/${alertId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'read' })
            });

            if (response.ok) {
                setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, status: 'read' } : alert));
                toast({ title: 'Alert marked as read' });
            }
        } catch {
            toast({ title: 'Failed to update alert', variant: 'destructive' });
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${getApiBaseUrl()}/seo/projects/${projectId}/alerts/mark-all-read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setAlerts(prev => prev.map(alert => ({ ...alert, status: 'read' })));
                toast({ title: 'All alerts marked as read' });
            }
        } catch {
            toast({ title: 'Failed to update alerts', variant: 'destructive' });
        }
    };

    return {
        alerts,
        isLoading,
        markAsRead,
        markAllAsRead,
        refetch: fetchAlerts
    };
}
