'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
    Card,
    Button,
    Badge,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@ori-os/ui';
import {
    AlertCircle,
    CheckCircle,
    Info,
    TrendingDown,
    TrendingUp,
    ExternalLink,
    Filter,
} from 'lucide-react';
import { useSEOAlerts } from '@/hooks/use-seo-alerts';
import { cn } from '@ori-os/ui';
import { Skeleton } from '@ori-os/ui';

interface AlertsListProps {
    projectId: string;
    limit?: number;
    compact?: boolean;
}

export function AlertsList({ projectId, limit, compact = false }: AlertsListProps) {
    const [filter, setFilter] = useState('all'); // all, unread, critical
    const { alerts, isLoading, markAsRead, markAllAsRead } = useSEOAlerts(projectId);

    const filteredAlerts = alerts?.filter((alert: any) => {
        if (filter === 'unread') return alert.status === 'unread';
        if (filter === 'critical') return alert.severity === 'critical';
        return true;
    }).slice(0, limit || undefined);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        );
    }

    if (!alerts?.length) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>No alerts found for this project.</p>
            </div>
        );
    }

    const getIcon = (type: string, severity: string) => {
        if (type === 'rank_drop') return <TrendingDown className="h-5 w-5 text-red-500" />;
        if (type === 'rank_gain') return <TrendingUp className="h-5 w-5 text-green-500" />;
        if (severity === 'critical') return <AlertCircle className="h-5 w-5 text-red-500" />;
        if (severity === 'warning') return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        return <Info className="h-5 w-5 text-blue-500" />;
    };

    return (
        <div className="space-y-4">
            {!compact && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Alerts</SelectItem>
                                <SelectItem value="unread">Unread</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
                        Mark all read
                    </Button>
                </div>
            )}

            <div className="space-y-2">
                {filteredAlerts?.map((alert: any) => (
                    <Card
                        key={alert.id}
                        className={cn(
                            'p-4 transition-colors',
                            alert.status === 'unread' ? 'bg-muted/30 border-l-4 border-l-primary' : ''
                        )}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">{getIcon(alert.type, alert.severity)}</div>
                                <div>
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        {alert.title || 'Notification'}
                                        {alert.status === 'unread' && (
                                            <Badge variant="secondary" className="text-[10px] h-4">
                                                New
                                            </Badge>
                                        )}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {alert.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {format(new Date(alert.createdAt), 'MMM d, h:mm a')}
                                    </p>
                                </div>
                            </div>
                            {alert.status === 'unread' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => markAsRead(alert.id)}
                                    title="Mark as read"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {compact && filteredAlerts?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No matching alerts</p>
            )}
        </div>
    );
}
