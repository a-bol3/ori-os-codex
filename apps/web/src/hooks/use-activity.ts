"use client"

import { useState, useEffect, useCallback } from "react"
import { getErrorMessage } from "@/lib/api-client";

export interface Activity {
    id: string;
    type: 'lead' | 'deal' | 'sequence' | 'task' | 'system';
    title: string;
    description: string;
    time: string;
    status: 'unread' | 'read';
    createdAt: string;
}

interface ActivityApiItem {
    id: string;
    type?: Activity['type'] | string;
    title?: string;
    description?: string;
    status?: Activity['status'];
    createdAt?: string;
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
            const response = await fetch("/api/workspace/activities", {
                credentials: "same-origin",
                cache: "no-store",
            });
            if (!response.ok) {
                throw new Error("Unable to load workspace activity");
            }
            const data: ActivityApiItem[] = await response.json();

            const normalized: Activity[] = data.map((a) => ({
                id: a.id,
                title: a.title || 'Activity logged',
                description: a.description || 'No description provided.',
                time: a.createdAt ? formatRelativeTime(a.createdAt) : 'just now',
                status: a.status || 'read',
                type: a.type === 'lead' || a.type === 'deal' || a.type === 'sequence' || a.type === 'task' || a.type === 'system'
                    ? a.type
                    : 'system',
                createdAt: a.createdAt || new Date().toISOString(),
            }));

            setActivities(normalized);
        } catch (err) {
            console.error('Fetch activity failed:', err);
            setActivities([]);
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
            const response = await fetch(`/api/workspace/activities/${id}/read`, {
                method: 'PUT',
                credentials: "same-origin",
            });
            if (!response.ok) {
                throw new Error("Unable to update activity status");
            }
            setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'read' } : a));
        } catch (err) {
            console.error('Failed to mark as read:', getErrorMessage(err, 'Failed to mark as read'));
        }
    };

    return { activities, isLoading, refresh: fetchActivity, markAsRead };
}
