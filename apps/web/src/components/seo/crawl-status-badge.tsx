'use client';

import { Badge } from '@ori-os/ui';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

interface CrawlStatusBadgeProps {
    status: 'pending' | 'running' | 'completed' | 'failed';
}

export function CrawlStatusBadge({ status }: CrawlStatusBadgeProps) {
    const config = {
        pending: {
            label: 'Pending',
            variant: 'secondary' as const,
            icon: Clock,
            className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        },
        running: {
            label: 'Running',
            variant: 'default' as const,
            icon: Clock,
            className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 animate-pulse',
        },
        completed: {
            label: 'Completed',
            variant: 'default' as const,
            icon: CheckCircle2,
            className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        },
        failed: {
            label: 'Failed',
            variant: 'destructive' as const,
            icon: XCircle,
            className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        },
    };

    const { label, icon: Icon, className } = config[status];

    return (
        <Badge variant="outline" className={className}>
            <Icon className="mr-1 h-3 w-3" />
            {label}
        </Badge>
    );
}
