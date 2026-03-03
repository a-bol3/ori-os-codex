
'use client';

import React, { useState } from 'react';
import { Button, Input, Label, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Badge } from '@ori-os/ui';
import { Plus, Target, Trash2, Edit2, Loader2 } from 'lucide-react';
import { useIcpProfiles } from '@/hooks/use-icp-profiles';
import { useToast } from '@ori-os/ui';

export function IcpProfileManager() {
    const { profiles, isLoading, error, refresh } = useIcpProfiles();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleAddProfile = async () => {
        if (!newName.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intelligence/icp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    criteriaJson: { industry: 'Any', employees: 'Any' },
                    blacklistPersonasJson: {},
                    regionsJson: {}
                })
            });
            if (!res.ok) throw new Error('Failed to create ICP Profile');

            toast({ title: 'ICP Profile Created', description: `Successfully created ${newName}` });
            setNewName('');
            setIsCreating(false);
            refresh();
        } catch (err) {
            toast({ title: 'Failed to create', description: 'Could not create ICP Profile', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeProfile = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the ICP Profile "${name}"?`)) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intelligence/icp/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast({ title: 'Profile Deleted', description: 'ICP Profile has been removed.' });
            refresh();
        } catch (err) {
            toast({ title: 'Failed to delete', description: 'Could not delete ICP Profile', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-tangerine" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Your ICP Profiles</h3>
                    <p className="text-sm text-muted-foreground">Define your target audience to improve AI search results.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Profile
                </Button>
            </div>

            {isCreating && (
                <Card className="border-tangerine/30 bg-tangerine/5 border-dashed">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Create New ICP Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Profile Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Mid-Market E-commerce"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddProfile();
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Industry</Label>
                                <Input placeholder="Software, Healthcare..." disabled />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Company Size</Label>
                                <Input placeholder="50-500..." disabled />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleAddProfile} disabled={isSubmitting || !newName.trim()}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Profile
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {profiles.map((profile) => (
                    <Card key={profile.id} className="relative group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span className="flex items-center">
                                    <Target className="mr-2 h-4 w-4 text-tangerine" />
                                    {profile.name}
                                </span>
                                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6" onClick={() => removeProfile(profile.id, profile.name)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="outline">{profile.criteriaJson?.industry || 'Any'}</Badge>
                                <Badge variant="outline">{profile.criteriaJson?.employees || 'Any'} employees</Badge>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 border-t text-[10px] text-muted-foreground flex justify-between items-center">
                            <span>Created {new Date(profile.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center text-tangerine cursor-pointer hover:underline">
                                <Edit2 className="mr-1 h-3 w-3" />
                                Edit
                            </span>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {profiles.length === 0 && !isCreating && (
                <div className="col-span-full py-10 text-center border-2 border-dashed rounded-none text-muted-foreground bg-muted/20">
                    No profiles defined. Create one to get started.
                </div>
            )}
        </div>
    );
}
