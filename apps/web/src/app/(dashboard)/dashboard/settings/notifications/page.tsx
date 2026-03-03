'use client';

import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, Globe, Save } from 'lucide-react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    useToast,
    Switch,
    Label,
    Separator
} from '@ori-os/ui';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NotificationsSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Settings Saved",
                description: "Your notification preferences have been updated.",
            });
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors">
                    <Link href="/dashboard/settings" className="flex items-center gap-1 text-sm font-medium">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Settings
                    </Link>
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                    Notifications
                </h1>
                <p className="text-muted-foreground">
                    Control how and when you receive updates from Ori-OS
                </p>
            </motion.div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Mail className="w-5 h-5 text-tangerine" />
                            Email Notifications
                        </CardTitle>
                        <CardDescription>Manage the emails we send to your inbox</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Security Alerts</Label>
                                <p className="text-sm text-muted-foreground">Receive alerts about new logins and security updates</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Campaign Updates</Label>
                                <p className="text-sm text-muted-foreground">Daily summaries of your active engagement campaigns</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Weekly Reports</Label>
                                <p className="text-sm text-muted-foreground">Comprehensive analytics report every Monday morning</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Globe className="w-5 h-5 text-blue-500" />
                            In-App Notifications
                        </CardTitle>
                        <CardDescription>Real-time updates within the dashboard</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">New Lead Generated</Label>
                                <p className="text-sm text-muted-foreground">Notify when the enrichment service finds a new ICP match</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Workflow Completions</Label>
                                <p className="text-sm text-muted-foreground">Notify when a multi-step automation finishes execution</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <MessageSquare className="w-5 h-5 text-green-500" />
                            Slack Integration
                        </CardTitle>
                        <CardDescription>Send notifications to your connected Slack workspace</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-8 border border-dashed border-border rounded-none bg-muted/20 flex flex-col items-center justify-center text-center">
                            <div className="p-3 rounded-none bg-green-500/10 mb-4">
                                <MessageSquare className="w-8 h-8 text-green-500" />
                            </div>
                            <h4 className="font-semibold mb-2">Connect to Slack</h4>
                            <p className="text-sm text-muted-foreground max-w-xs mb-6">
                                Streamline your workflow by sending real-time alerts directly to your team's Slack channels.
                            </p>
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/settings/integrations">
                                    Manage Integrations
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button
                        variant="accent"
                        size="lg"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Preferences"}
                        {!loading && <Save className="ml-2 w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
