'use client';

import { motion } from 'framer-motion';
import { Shield, Key, Smartphone, LogOut, ChevronLeft, Save, AlertTriangle } from 'lucide-react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    useToast,
    Label,
    Input,
    Separator,
    Badge
} from '@ori-os/ui';
import { useState } from 'react';
import Link from 'next/link';

export default function SecuritySettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Security Updated",
                description: "Your security settings have been saved.",
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
                    Security
                </h1>
                <p className="text-muted-foreground">
                    Manage your password, two-factor authentication and active sessions
                </p>
            </motion.div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Key className="w-5 h-5 text-tangerine" />
                            Change Password
                        </CardTitle>
                        <CardDescription>Ensure your account is protected with a strong password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" placeholder="••••••••" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" placeholder="••••••••" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" placeholder="••••••••" />
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                            <Button variant="outline" size="sm" onClick={handleSave}>
                                Update Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Smartphone className="w-5 h-5 text-blue-500" />
                                    Two-Factor Authentication
                                </CardTitle>
                                <CardDescription>Add an extra layer of security to your account</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5">
                                Disabled
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-none border border-border bg-muted/10">
                            <div className="flex gap-4">
                                <div className="p-2 h-fit rounded-none bg-blue-500/10">
                                    <Shield className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-semibold">Authenticator App</p>
                                    <p className="text-sm text-muted-foreground">Use an app like Google Authenticator or Authy to generate codes</p>
                                </div>
                            </div>
                            <Button variant="accent" size="sm">
                                Setup 2FA
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <LogOut className="w-5 h-5 text-destructive" />
                            Active Sessions
                        </CardTitle>
                        <CardDescription>View and manage where you are currently logged in</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex gap-4">
                                <div className="p-2 h-fit rounded-none bg-muted">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Web</p>
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Chrome on Windows (Current)</p>
                                    <p className="text-xs text-muted-foreground">Warsaw, Poland • Last active now</p>
                                </div>
                            </div>
                            <Badge variant="outline">Current Session</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between py-2 opacity-60">
                            <div className="flex gap-4">
                                <div className="p-2 h-fit rounded-none bg-muted">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Mob</p>
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Safari on iPhone 15</p>
                                    <p className="text-xs text-muted-foreground">Warsaw, Poland • Last active 2 days ago</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive h-8">Revoke</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-none">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-destructive mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-bold text-destructive mb-1">Deactivate Account</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Once you deactivate your account, there is no going back. Please be certain.
                            </p>
                            <Button variant="destructive" size="sm">
                                Deactivate Account
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
