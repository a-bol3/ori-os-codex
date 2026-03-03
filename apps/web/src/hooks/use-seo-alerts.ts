'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@ori-os/ui';

// Mock hook implementation until we have the real API client generated or generic fetcher
// In a real app, this would use SWR or React Query
export function useSEOAlerts(projectId: string) {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchAlerts = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token'); // Simplistic auth
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/seo/projects/${projectId}/alerts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch alerts', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchAlerts();
        }
    }, [projectId]);

    const markAsRead = async (alertId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/seo/projects/${projectId}/alerts/${alertId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'read' })
            });

            if (response.ok) {
                setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'read' } : a));
                toast({ title: 'Alert marked as read' });
            }
        } catch (error) {
            toast({ title: 'Failed to update alert', variant: 'destructive' });
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/seo/projects/${projectId}/alerts/mark-all-read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setAlerts(prev => prev.map(a => ({ ...a, status: 'read' })));
                toast({ title: 'All alerts marked as read' });
            }
        } catch (error) {
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
