'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ori-os/ui';
import { Bell, AlertCircle, AlertTriangle, Info, Check, X } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Alert {
    id: string;
    type: 'rank_drop' | 'rank_gain' | 'new_issue' | 'backlink_lost' | 'competitor_change';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    status: 'read' | 'unread' | 'dismissed';
    createdAt: string;
    metadata?: any;
}

export function AlertsPanel() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, [projectId, filter]);

    const fetchAlerts = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (filter === 'unread') queryParams.append('status', 'unread');
            if (filter === 'critical') queryParams.append('severity', 'critical');

            const response = await fetch(
                `/api/seo/projects/${projectId}/alerts?${queryParams.toString()}`
            );

            if (response.ok) {
                const data = await response.json();
                setAlerts(data.data || []);
                setStats(data.stats || {});
            }
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (alertId: string) => {
        try {
            await fetch(`/api/seo/projects/${projectId}/alerts/${alertId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'read' }),
            });
            fetchAlerts();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleDismiss = async (alertId: string) => {
        try {
            await fetch(`/api/seo/projects/${projectId}/alerts/${alertId}`, {
                method: 'DELETE',
            });
            fetchAlerts();
        } catch (error) {
            console.error('Failed to dismiss alert:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch(`/api/seo/projects/${projectId}/alerts/mark-all-read`, {
                method: 'POST',
            });
            fetchAlerts();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const severityConfig = {
        critical: {
            icon: AlertCircle,
            className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
            borderColor: 'border-l-red-500',
        },
        warning: {
            icon: AlertTriangle,
            className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
            borderColor: 'border-l-yellow-500',
        },
        info: {
            icon: Info,
            className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            borderColor: 'border-l-blue-500',
        },
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-none h-4 w-4 border-b-2 border-primary" />
                    <span className="text-sm text-muted-foreground">Loading alerts...</span>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Alerts</h2>
                    {stats && stats.unread > 0 && (
                        <Badge variant="destructive" className="ml-2">
                            {stats.unread}
                        </Badge>
                    )}
                </div>

                {stats && stats.unread > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Filter Tabs */}
            {stats && (
                <div className="flex gap-2 mb-4">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All ({stats.total})
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({stats.unread})
                    </Button>
                    <Button
                        variant={filter === 'critical' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('critical')}
                    >
                        Critical ({stats.critical})
                    </Button>
                </div>
            )}

            {/* Alerts List */}
            <div className="space-y-3">
                {alerts.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No alerts to show</p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const config = severityConfig[alert.severity];
                        const Icon = config.icon;

                        return (
                            <div
                                key={alert.id}
                                className={`p-4 rounded-none border-l-4 ${config.borderColor} ${alert.status === 'unread'
                                        ? 'bg-accent/50'
                                        : 'bg-background opacity-75'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-3 flex-1">
                                        <Icon className={`h-5 w-5 mt-0.5 ${config.className}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-sm">{alert.title}</h3>
                                                <Badge variant="outline" className={config.className}>
                                                    {alert.severity}
                                                </Badge>
                                                {alert.status === 'unread' && (
                                                    <Badge variant="default" className="text-xs">
                                                        NEW
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {alert.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {alert.status === 'unread' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkAsRead(alert.id)}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDismiss(alert.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
}
