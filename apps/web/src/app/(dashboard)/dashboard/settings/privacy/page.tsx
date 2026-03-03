'use client';

import { motion } from 'framer-motion';
import { Database, Download, Trash2, Shield, Eye, ChevronLeft, Save, Globe, EyeOff } from 'lucide-react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    useToast,
    Label,
    Separator,
    Switch,
    Badge
} from '@ori-os/ui';
import { useState } from 'react';
import Link from 'next/link';

export default function PrivacySettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Privacy Settings Saved",
                description: "Your data preferences have been updated.",
            });
        }, 800);
    };

    const handleExport = () => {
        toast({
            title: "Export Requested",
            description: "Your data is being prepared. You will receive an email shortly.",
        });
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
                    Data & Privacy
                </h1>
                <p className="text-muted-foreground">
                    Control how your information is used and manage your data footprint
                </p>
            </motion.div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Eye className="w-5 h-5 text-tangerine" />
                            Data Visibility
                        </CardTitle>
                        <CardDescription>Manage how your data is displayed across the platform</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Public Profile</Label>
                                <p className="text-sm text-muted-foreground">Allow others in your organization to see your profile details</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Activity Logging</Label>
                                <p className="text-sm text-muted-foreground">Log your actions for collaboration and audit trails</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Database className="w-5 h-5 text-blue-500" />
                            AI & Research
                        </CardTitle>
                        <CardDescription>Control how AI models interact with your data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Training Contribution</Label>
                                <p className="text-sm text-muted-foreground">Allow your data to be used for improving our enrichment models (Anonymized)</p>
                            </div>
                            <Switch />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Personalized Intelligence</Label>
                                <p className="text-sm text-muted-foreground">Enable AI to learn from your search patterns to improve ICP matching</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Download className="w-5 h-5 text-green-500" />
                            Data Portability
                        </CardTitle>
                        <CardDescription>Download a copy of your data for your own records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-6 rounded-none border border-border bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-semibold mb-1 text-sm">Download your information</h4>
                                <p className="text-xs text-muted-foreground">Get a JSON container of your contacts, companies, and campaign history.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleExport} className="shrink-0">
                                <Download className="w-4 h-4 mr-2" />
                                Export My Data
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
                        {loading ? "Saving..." : "Save Privacy Settings"}
                        {!loading && <Save className="ml-2 w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
