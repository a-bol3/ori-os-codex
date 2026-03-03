'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Input,
    Label,
    Avatar,
    AvatarFallback,
    AvatarImage,
    useToast,
    Separator,
} from '@ori-os/ui';
import { User, Mail, Shield, Camera, Loader2 } from 'lucide-react';

export default function ProfileSettingsPage() {
    const { data: session, update } = useSession();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const user = session?.user || {
        name: 'John Doe',
        email: 'john@company.com',
        image: null,
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: 'Profile Updated',
            description: 'Your profile information has been saved successfully.',
        });
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your personal information and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Your Photo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                            <Avatar className="h-32 w-32 border-4 border-muted">
                                <AvatarImage src={user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                                <AvatarFallback className="text-2xl">{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                            Click image to upload. Recommended: 400x400px JPG or PNG.
                        </p>
                        <Button variant="outline" size="sm" className="mt-4 w-full">Change Avatar</Button>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your name and primary email address.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" defaultValue={user.name?.split(' ')[0]} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" defaultValue={user.name?.split(' ')[1]} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Input id="email" type="email" defaultValue={user.email || ''} readOnly className="pl-10 bg-muted/50" />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-2xs text-muted-foreground italic">Email changes require admin approval.</p>
                                </div>
                                <Button type="submit" variant="accent" disabled={isLoading} className="w-full sm:w-auto">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Security</CardTitle>
                            <CardDescription>Manage your password and security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-medium">Password</div>
                                    <div className="text-xs text-muted-foreground">Change your current account password.</div>
                                </div>
                                <Button variant="outline" size="sm">Change Password</Button>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-medium">Two-factor Authentication</div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">Add an extra layer of security.</div>
                                </div>
                                <Button variant="outline" size="sm">Enable</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
