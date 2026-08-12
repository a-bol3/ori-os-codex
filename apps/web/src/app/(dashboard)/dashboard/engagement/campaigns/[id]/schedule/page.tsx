'use client';

import { use, useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Checkbox, useToast } from '@ori-os/ui';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/api-client';

const WEEK_DAYS = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
];

export default function CampaignSchedulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [campaignName, setCampaignName] = useState('Campaign');
    const [timeZone, setTimeZone] = useState('UTC');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            setIsLoading(true);

            try {
                const response = await fetch(`/api/workspace/engagement/campaign?id=${encodeURIComponent(id)}`, {
                    credentials: 'same-origin',
                    cache: 'no-store',
                });
                if (!response.ok) {
                    const payload = await response.json().catch(() => ({ error: null }));
                    throw new Error(typeof payload?.message === 'string' ? payload.message : typeof payload?.error === 'string' ? payload.error : 'Unable to load campaign schedule right now.');
                }
                const campaign = await response.json() as {
                    name?: string;
                    sendWindowJson?: {
                        tz?: string;
                        start?: string;
                        end?: string;
                        days?: number[];
                    } | null;
                };

                setCampaignName(campaign.name || 'Campaign');
                setTimeZone(campaign.sendWindowJson?.tz || 'UTC');
                setStartTime(campaign.sendWindowJson?.start || '09:00');
                setEndTime(campaign.sendWindowJson?.end || '17:00');
                setSelectedDays(campaign.sendWindowJson?.days?.length ? campaign.sendWindowJson.days : [1, 2, 3, 4, 5]);
                setError(null);
            } catch (err) {
                console.error('Schedule load failed:', err);
                setError(getErrorMessage(err, 'Unable to load campaign schedule right now.'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaign();
    }, [id]);

    const toggleDay = (value: number) => {
        setSelectedDays((prev) =>
            prev.includes(value) ? prev.filter((day) => day !== value) : [...prev, value].sort()
        );
    };

    const handleSave = async () => {
        if (selectedDays.length === 0) {
            toast({
                title: 'Select at least one day',
                variant: 'destructive',
            });
            return;
        }

        if (!startTime || !endTime) {
            toast({
                title: 'Start and end time required',
                description: 'Choose both edges of the sending window before saving.',
                variant: 'destructive',
            });
            return;
        }

        if (startTime >= endTime) {
            toast({
                title: 'Invalid sending window',
                description: 'The end time must be later than the start time.',
                variant: 'destructive',
            });
            return;
        }

        if (!timeZone.trim()) {
            toast({
                title: 'Time zone required',
                description: 'Add a valid time zone such as Europe/Warsaw.',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(`/api/workspace/engagement/campaign?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    sendWindowJson: {
                        days: selectedDays,
                        start: startTime,
                        end: endTime,
                        tz: timeZone.trim(),
                    },
                }),
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => ({ error: null }));
                throw new Error(typeof payload?.message === 'string' ? payload.message : typeof payload?.error === 'string' ? payload.error : 'Could not save the campaign schedule.');
            }

            toast({
                title: 'Schedule updated',
                description: `Sending window saved for ${campaignName}.`,
            });
        } catch (err) {
            toast({
                title: 'Save failed',
                description: getErrorMessage(err, 'Could not save the campaign schedule.'),
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container max-w-2xl py-10 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/engagement/campaigns/${id}`}>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Schedule Campaign</h1>
                    <p className="text-sm text-muted-foreground">{campaignName}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Delivery Settings</CardTitle>
                    <CardDescription>Configure the sending window that Ori-OS should respect for this campaign.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="rounded-none border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start-time">Start Time</Label>
                                    <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-time">End Time</Label>
                                    <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Time Zone</Label>
                                <Input id="timezone" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} placeholder="UTC or Europe/Warsaw" />
                            </div>

                            <div className="space-y-3">
                                <Label>Active Sending Days</Label>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {WEEK_DAYS.map((day) => (
                                        <label key={day.value} className="flex items-center gap-2 rounded-none border px-3 py-2 text-sm">
                                            <Checkbox checked={selectedDays.includes(day.value)} onCheckedChange={() => toggleDay(day.value)} />
                                            <span>{day.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-none border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                                This saves the campaign send window in ORI-OS. Advanced timezone automation, throttling policies and queue-aware scheduling are still being expanded.
                            </div>

                            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Schedule
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
