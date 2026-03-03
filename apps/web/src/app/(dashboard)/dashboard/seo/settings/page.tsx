'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Badge,
    Switch,
    Label,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@ori-os/ui';
import { Save, Search, Globe, Shield, Zap, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SEOSettingsPage() {
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
        }, 1000);
    };

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">SEO Studio Settings</h1>
                    <p className="text-muted-foreground">Configure your SEO monitoring, crawling, and API settings.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                    {!saving && <Save className="ml-2 h-4 w-4" />}
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="crawling">Crawling</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monitoring Preferences</CardTitle>
                            <CardDescription>Global settings for rank tracking and analysis.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Automatic Rank Tracking</Label>
                                    <p className="text-sm text-muted-foreground">Check keyword positions automatically every day.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Competitor Monitoring</Label>
                                    <p className="text-sm text-muted-foreground">Track ranking changes for your saved competitors.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Default Search Location</Label>
                                <Select defaultValue="us-en">
                                    <SelectTrigger id="location">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="us-en">United States (English)</SelectItem>
                                        <SelectItem value="uk-en">United Kingdom (English)</SelectItem>
                                        <SelectItem value="de-de">Germany (German)</SelectItem>
                                        <SelectItem value="pl-pl">Poland (Polish)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="crawling" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Crawl Configuration</CardTitle>
                            <CardDescription>Manage how Ori-OS audits your websites.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="frequency">Default Crawl Frequency</Label>
                                <Select defaultValue="weekly">
                                    <SelectTrigger id="frequency">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="max-pages">Max Pages per Project</Label>
                                <Input id="max-pages" type="number" defaultValue="500" />
                                <p className="text-xs text-muted-foreground">Total pages audited per crawl. Higher limits require premium plans.</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Respect Robots.txt</Label>
                                    <p className="text-sm text-muted-foreground">Always follow exclusion rules in your robots.txt file.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="integrations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>External Connections</CardTitle>
                            <CardDescription>Connect to third-party SEO tools for more data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-none bg-muted/30">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-none border text-blue-600">
                                        <Globe className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Google Search Console</p>
                                        <p className="text-sm text-muted-foreground">Import real search traffic and impressions data.</p>
                                    </div>
                                </div>
                                <Button variant="outline">Connect</Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-none bg-muted/30 opacity-60">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-none border text-orange-600">
                                        <Zap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Ahrefs API</p>
                                        <p className="text-sm text-muted-foreground">Detailed backlink and authority metrics.</p>
                                    </div>
                                </div>
                                <Badge variant="outline">Coming Soon</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Alerts</CardTitle>
                            <CardDescription>Control when and how you get notified about SEO changes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Rank Drop Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Notify me when a keyword drops more than 5 positions.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Weekly SEO Summary</Label>
                                    <p className="text-sm text-muted-foreground">Send a weekly performance report to your email.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Critical Audit Issues</Label>
                                    <p className="text-sm text-muted-foreground">Immediate alerts for indexation or high-severity crawl errors.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
