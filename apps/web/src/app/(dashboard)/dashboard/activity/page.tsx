'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@ori-os/ui';
import { Mail, Users, Zap, Filter, Download, RefreshCw, ListChecks, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

type ActivityType = 'email' | 'lead' | 'deal' | 'task' | 'system';

type Activity = {
    id: string;
    type: ActivityType | string;
    title: string;
    description: string;
    createdAt: string;
    status: 'read' | 'unread' | string;
};

function formatActivityTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown time';

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function ActivityIcon({ type }: { type: ActivityType | string }) {
    if (type === 'email') return <Mail className="h-4 w-4" aria-hidden="true" />;
    if (type === 'lead') return <Users className="h-4 w-4" aria-hidden="true" />;
    if (type === 'deal') return <Handshake className="h-4 w-4" aria-hidden="true" />;
    if (type === 'task') return <ListChecks className="h-4 w-4" aria-hidden="true" />;
    return <Zap className="h-4 w-4" aria-hidden="true" />;
}

function activityTone(type: ActivityType | string) {
    if (type === 'email') return 'bg-blue-500/10 text-blue-500';
    if (type === 'lead' || type === 'deal') return 'bg-tangerine/10 text-tangerine';
    if (type === 'task') return 'bg-green-500/10 text-green-500';
    return 'bg-purple-500/10 text-purple-500';
}

export default function ActivityPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    const loadActivities = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch('/activities?limit=100&offset=0');
            const payload = await response.json() as unknown;
            if (!Array.isArray(payload)) {
                throw new Error('The activity feed returned an invalid response.');
            }
            setActivities(payload as Activity[]);
        } catch (loadError) {
            setActivities([]);
            setError(getErrorMessage(loadError, 'Unable to load activity.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadActivities();
    }, [loadActivities]);

    const visibleActivities = useMemo(
        () => showUnreadOnly
            ? activities.filter((activity) => activity.status === 'unread')
            : activities,
        [activities, showUnreadOnly],
    );

    const exportActivities = useCallback(() => {
        if (visibleActivities.length === 0) return;

        const header = ['Title', 'Description', 'Type', 'Status', 'Created at'];
        const rows = visibleActivities.map((activity) => [
            activity.title,
            activity.description,
            activity.type,
            activity.status,
            activity.createdAt,
        ]);
        const csv = [header, ...rows]
            .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
            .join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `ori-os-activity-${new Date().toISOString().slice(0, 10)}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    }, [visibleActivities]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Activity Feed</h1>
                    <p className="text-muted-foreground">Real-time updates across all modules</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportActivities}
                        disabled={loading || visibleActivities.length === 0}
                    >
                        <Download className="mr-2 h-4 w-4" />Export
                    </Button>
                    <Button
                        variant={showUnreadOnly ? 'accent' : 'outline'}
                        size="sm"
                        aria-pressed={showUnreadOnly}
                        onClick={() => setShowUnreadOnly((current) => !current)}
                        disabled={loading || activities.length === 0}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {showUnreadOnly ? 'Unread only' : 'Filter'}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Updates</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Refresh activity"
                        onClick={() => void loadActivities()}
                        disabled={loading}
                    >
                        <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && (
                        <div className="space-y-px" role="status" aria-label="Loading activity">
                            {[0, 1, 2].map((row) => (
                                <div key={row} className="flex items-start gap-4 p-4">
                                    <div className="h-8 w-8 animate-pulse bg-muted" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-2/3 animate-pulse bg-muted" />
                                        <div className="h-3 w-1/2 animate-pulse bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex flex-col items-center gap-3 p-10 text-center" role="alert">
                            <p className="text-sm text-destructive">{error}</p>
                            <Button variant="outline" size="sm" onClick={() => void loadActivities()}>
                                Retry
                            </Button>
                        </div>
                    )}

                    {!loading && !error && visibleActivities.length === 0 && (
                        <div className="p-10 text-center text-sm text-muted-foreground">
                            {showUnreadOnly
                                ? 'No unread activity.'
                                : 'No activity has been recorded yet.'}
                        </div>
                    )}

                    {!loading && !error && visibleActivities.length > 0 && (
                        <div className="divide-y divide-border">
                            {visibleActivities.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/30"
                                >
                                    <div className={`rounded-none p-2 ${activityTone(activity.type)}`}>
                                        <ActivityIcon type={activity.type} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm font-bold text-foreground">{activity.title}</p>
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {formatActivityTime(activity.createdAt)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs font-medium text-foreground/80">{activity.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
