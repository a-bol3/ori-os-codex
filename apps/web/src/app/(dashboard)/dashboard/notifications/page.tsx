'use client';

import { motion } from 'framer-motion';
import { Bell, CheckCircle2, Info, AlertTriangle, Loader2, Check } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Badge,
} from '@ori-os/ui';
import { useState, useEffect } from 'react';

interface Notification {
    id: string;
    title: string;
    body: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setNotifications(data);
        } catch {
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const getIcon = (type: string) => {
        return <Info className="h-5 w-5 text-tangerine transition-transform duration-300 group-hover:-translate-y-0.5" />;
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && (
                            <Badge variant="destructive">{unreadCount}</Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground">Stay up to date with your workspace activity</p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllRead}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-tangerine" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Bell className="h-12 w-12 mb-4 opacity-30" />
                            <p className="text-lg font-medium mb-2">You're all caught up!</p>
                            <p className="text-sm">No new notifications at this time.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification, i) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors group ${!notification.read ? 'bg-tangerine/5' : ''}`}
                                >
                                    <div className="mt-0.5 flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <div className="h-2 w-2 rounded-none bg-tangerine flex-shrink-0 shadow-[0_0_8px_rgba(247,127,0,0.5)]" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5">{notification.body}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
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
