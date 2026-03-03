'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Bell, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    Settings
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage your account preferences and system configuration
                </p>
            </motion.div>

            <div className="grid gap-6">
                {[
                    { icon: User, title: 'Profile', description: 'Update your personal information and preferences', href: '/dashboard/settings/profile' },
                    { icon: Bell, title: 'Notifications', description: 'Configure email and system notifications', href: '/dashboard/settings/notifications' },
                    { icon: Shield, title: 'Security', description: 'Manage password and two-factor authentication', href: '/dashboard/settings/security' },
                    { icon: Database, title: 'Data & Privacy', description: 'Control your data and privacy settings', href: '/dashboard/settings/privacy' },
                ].map((item, i) => (
                    <Link key={item.title} href={item.href}>
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 border border-border rounded-none bg-card hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-none bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <item.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
