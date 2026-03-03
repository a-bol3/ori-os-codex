"use client"

import { useState, useEffect, useCallback } from "react"

export interface Activity {
    id: string;
    type: 'lead' | 'deal' | 'sequence' | 'task' | 'system';
    title: string;
    description: string;
    time: string;
    status: 'unread' | 'read';
    createdAt: string;
}

function formatRelativeTime(date: string | Date) {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return then.toLocaleDateString();
}

export function useActivity() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchActivity = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities`);
            if (!response.ok) throw new Error("Failed to fetch activity");
            const data = await response.json();

            const normalized = data.map((a: any) => ({
                ...a,
                time: a.createdAt ? formatRelativeTime(a.createdAt) : 'just now',
                status: a.status || 'read'
            }));

            setActivities(normalized);
        } catch (err) {
            console.error('Fetch activity failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivity();

        const interval = setInterval(fetchActivity, 60000);
        return () => clearInterval(interval);
    }, [fetchActivity]);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${id}/read`, { method: 'PUT' });
            setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'read' } : a));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    return { activities, isLoading, refresh: fetchActivity, markAsRead };
}
