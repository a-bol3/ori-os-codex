import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
} from '@ori-os/ui';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    DollarSign,
    Mail,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { DashboardData } from '../hooks/use-dashboard';

interface DashboardStatsProps {
    loading: boolean;
    data: DashboardData | null;
}

export function DashboardStats({ loading, data }: DashboardStatsProps) {
    const stats = useMemo(() => {
        if (!data) return [];

        return [
            {
                title: 'Total Contacts',
                value: data.contacts.total.toLocaleString(),
                change: data.contacts.growth ? `${data.contacts.growth > 0 ? '+' : ''}${data.contacts.growth}%` : '0%',
                trend: (data.contacts.growth || 0) >= 0 ? 'up' : 'down',
                icon: Users
            },
            {
                title: 'Companies',
                value: data.companies.total.toLocaleString(),
                change: `+${data.companies.thisMonth}`,
                trend: 'up',
                icon: Building2
            },
            {
                title: 'Active Deals',
                value: `$${(data.deals.value / 1000).toFixed(1)}k`,
                change: data.deals.total.toString(),
                trend: 'up',
                icon: DollarSign
            },
            {
                title: 'Emails Sent',
                value: data.campaigns.sent.toLocaleString(),
                change: `${((data.campaigns.opened / (data.campaigns.sent || 1)) * 100).toFixed(1)}% open`,
                trend: 'up',
                icon: Mail
            },
        ];
    }, [data]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-muted rounded" />
                                    <div className="h-8 w-16 bg-muted rounded" />
                                </div>
                                <div className="h-10 w-10 bg-muted rounded" />
                            </div>
                            <div className="h-4 w-32 bg-muted rounded mt-4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <Card className="group">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                                </div>
                                <div className="p-2 rounded-none bg-muted group-hover:bg-tangerine/10 transition-colors">
                                    <stat.icon className="h-5 w-5 text-tangerine transition-transform duration-300 group-hover:-translate-y-0.5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-4">
                                {stat.trend === 'up' ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                                <span className={stat.trend === 'up' ? 'text-success' : 'text-destructive'}>{stat.change}</span>
                                <span className="text-muted-foreground text-sm">vs last month</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
