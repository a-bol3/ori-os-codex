'use client';

import { Card, Badge } from '@ori-os/ui';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { CrawlIssue } from '../../hooks/use-crawls';

interface CrawlIssuesListProps {
    issues: CrawlIssue[];
    summary?: {
        critical: number;
        warning: number;
        info: number;
    };
}

export function CrawlIssuesList({ issues, summary }: CrawlIssuesListProps) {
    const severityConfig = {
        critical: {
            icon: AlertCircle,
            label: 'Critical',
            className: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
            badgeClassName: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        },
        warning: {
            icon: AlertTriangle,
            label: 'Warning',
            className: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400',
            badgeClassName: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        },
        info: {
            icon: Info,
            label: 'Info',
            className: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
            badgeClassName: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        },
    };

    const groupedIssues = issues.reduce((acc, issue) => {
        if (!acc[issue.severity]) {
            acc[issue.severity] = [];
        }
        acc[issue.severity].push(issue);
        return acc;
    }, {} as Record<string, CrawlIssue[]>);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {(['critical', 'warning', 'info'] as const).map((severity) => {
                        const count = summary[severity] || 0;
                        const config = severityConfig[severity];
                        const Icon = config.icon;

                        return (
                            <Card key={severity} className={`p-4 ${config.className}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{config.label}</span>
                                    </div>
                                    <span className="text-2xl font-bold">{count}</span>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Issues by Severity */}
            <div className="space-y-4">
                {(['critical', 'warning', 'info'] as const).map((severity) => {
                    const severityIssues = groupedIssues[severity] || [];
                    if (severityIssues.length === 0) return null;

                    const config = severityConfig[severity];
                    const Icon = config.icon;

                    return (
                        <div key={severity}>
                            <div className="mb-3 flex items-center gap-2">
                                <Icon className={`h-5 w-5 ${config.className}`} />
                                <h3 className="text-lg font-semibold">
                                    {config.label} Issues ({severityIssues.length})
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {severityIssues.map((issue) => (
                                    <Card key={issue.id} className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className={config.badgeClassName}>
                                                            {issue.type.replace(/_/g, ' ')}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {issue.category}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {issue.description}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {issue.pageUrl}
                                                    </p>
                                                </div>

                                                <Badge
                                                    variant={issue.status === 'fixed' ? 'default' : 'outline'}
                                                    className={
                                                        issue.status === 'fixed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : ''
                                                    }
                                                >
                                                    {issue.status}
                                                </Badge>
                                            </div>

                                            <div className="pl-4 border-l-2 border-muted">
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Recommendation:</span>{' '}
                                                    {issue.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {issues.length === 0 && (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                        No issues found in this crawl. Great job!
                    </p>
                </Card>
            )}
        </div>
    );
}
