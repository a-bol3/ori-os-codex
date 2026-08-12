'use client';

import { use, useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Badge, useToast } from '@ori-os/ui';
import { ChevronLeft, Save, Loader2, Mail, Clock, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/api-client';

type StepType = 'EMAIL' | 'WAIT' | 'CONDITION';

type SequenceStep = {
    id: string;
    stepType: StepType;
    order: number;
    configJson: Record<string, string | number>;
};

export default function CampaignEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const [campaignName, setCampaignName] = useState('');
    const [objective, setObjective] = useState('');
    const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const moveStep = (stepId: string, direction: 'up' | 'down') => {
        setSequenceSteps((prev) => {
            const index = prev.findIndex((step) => step.id === stepId);
            if (index === -1) return prev;

            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= prev.length) return prev;

            const next = [...prev];
            const [moved] = next.splice(index, 1);
            next.splice(targetIndex, 0, moved);

            return next.map((step, orderIndex) => ({ ...step, order: orderIndex + 1 }));
        });
    };

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
                    throw new Error(typeof payload?.message === 'string' ? payload.message : typeof payload?.error === 'string' ? payload.error : 'Unable to load campaign editor right now.');
                }
                const campaign = await response.json() as {
                    name?: string;
                    objective?: string | null;
                    sequenceSteps?: SequenceStep[];
                };

                setCampaignName(campaign.name || '');
                setObjective(campaign.objective || '');
                setSequenceSteps(campaign.sequenceSteps || []);
                setError(null);
            } catch (err) {
                console.error('Edit load failed:', err);
                setError(getErrorMessage(err, 'Unable to load campaign editor right now.'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaign();
    }, [id]);

    const addStep = (stepType: StepType) => {
        const nextOrder = sequenceSteps.length + 1;
        setSequenceSteps((prev) => [
            ...prev,
            {
                id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                stepType,
                order: nextOrder,
                configJson: stepType === 'WAIT'
                    ? { days: 2 }
                    : { subject: '', body: '' },
            },
        ]);
    };

    const removeStep = (idToRemove: string) => {
        setSequenceSteps((prev) =>
            prev
                .filter((step) => step.id !== idToRemove)
                .map((step, index) => ({ ...step, order: index + 1 }))
        );
    };

    const updateStep = (stepId: string, patch: Record<string, string | number>) => {
        setSequenceSteps((prev) =>
            prev.map((step) =>
                step.id === stepId
                    ? {
                        ...step,
                        configJson: {
                            ...step.configJson,
                            ...patch,
                        },
                    }
                    : step
            )
        );
    };

    const handleSave = async () => {
        const trimmedName = campaignName.trim();
        if (!trimmedName) {
            toast({
                title: 'Campaign name required',
                description: 'Give the campaign a clear name before saving.',
                variant: 'destructive',
            });
            return;
        }

        const invalidEmailStep = sequenceSteps.find((step) =>
            step.stepType === 'EMAIL' &&
            (
                typeof step.configJson?.subject !== 'string' ||
                !step.configJson.subject.trim() ||
                typeof step.configJson?.body !== 'string' ||
                !step.configJson.body.trim()
            )
        );

        if (invalidEmailStep) {
            toast({
                title: 'Complete all email steps',
                description: 'Every email step needs both a subject and a body before saving.',
                variant: 'destructive',
            });
            return;
        }

        const invalidWaitStep = sequenceSteps.find((step) =>
            step.stepType === 'WAIT' &&
            (
                typeof step.configJson?.days !== 'number' ||
                !Number.isFinite(step.configJson.days) ||
                step.configJson.days < 1
            )
        );

        if (invalidWaitStep) {
            toast({
                title: 'Invalid wait step',
                description: 'Wait steps must use at least 1 full day.',
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
                    name: trimmedName,
                    objective: objective.trim(),
                    sequenceSteps: sequenceSteps.map((step, index) => ({
                        stepType: step.stepType,
                        order: index + 1,
                        configJson: step.configJson,
                    })),
                }),
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => ({ error: null }));
                throw new Error(typeof payload?.message === 'string' ? payload.message : typeof payload?.error === 'string' ? payload.error : 'Could not save campaign changes.');
            }

            toast({
                title: 'Campaign updated',
                description: 'Sequence and campaign details saved successfully.',
            });
        } catch (err) {
            toast({
                title: 'Save failed',
                description: getErrorMessage(err, 'Could not save campaign changes.'),
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container max-w-4xl py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/engagement/campaigns/${id}`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Campaign</h1>
                        <p className="text-sm text-muted-foreground">Update campaign details and sequence steps.</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving || isLoading || !campaignName.trim()}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            {error && (
                <div className="rounded-none border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Campaign Basics</CardTitle>
                    <CardDescription>Edit the core campaign data already stored in ORI-OS.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="campaign-name">Campaign Name</Label>
                        <Input id="campaign-name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="campaign-objective">Objective</Label>
                        <Input id="campaign-objective" value={objective} onChange={(e) => setObjective(e.target.value)} disabled={isLoading} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Sequence Editor</CardTitle>
                        <CardDescription>Basic editor for live campaign steps. Drag-and-drop versioning can come later.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => addStep('WAIT')} disabled={isLoading}>
                            <Clock className="mr-2 h-4 w-4" /> Add Wait
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addStep('EMAIL')} disabled={isLoading}>
                            <Mail className="mr-2 h-4 w-4" /> Add Email
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : sequenceSteps.length === 0 ? (
                        <div className="rounded-none border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                            No steps defined yet. Add the first step to build the sequence.
                        </div>
                    ) : (
                        sequenceSteps.map((step, index) => (
                            <Card key={step.id} className="border-l-4 border-l-primary">
                                <CardHeader className="py-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline">Step {index + 1}</Badge>
                                            <Badge variant="secondary">{step.stepType}</Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => moveStep(step.id, 'up')} disabled={index === 0}>
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => moveStep(step.id, 'down')} disabled={index === sequenceSteps.length - 1}>
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {step.stepType === 'EMAIL' ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Subject</Label>
                                                <Input
                                                    value={typeof step.configJson?.subject === 'string' ? step.configJson.subject : ''}
                                                    onChange={(e) => updateStep(step.id, { subject: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Body</Label>
                                                <textarea
                                                    className="min-h-[140px] w-full rounded-none border border-input bg-background px-3 py-2 text-sm"
                                                    value={typeof step.configJson?.body === 'string' ? step.configJson.body : ''}
                                                    onChange={(e) => updateStep(step.id, { body: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label>Wait Days</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={typeof step.configJson?.days === 'number' ? step.configJson.days : 1}
                                                onChange={(e) => updateStep(step.id, { days: Number(e.target.value || 1) })}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}

                    <div className="rounded-none border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        This editor now saves real campaign data. Advanced branching logic and visual drag-and-drop orchestration are still pending.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
