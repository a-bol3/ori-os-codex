'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Input,
    useToast,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@ori-os/ui';
import {
    ChevronLeft,
    Mail,
    Users,
    MessageSquare,
    Play,
    Pause,
    Edit,
    Clock,
    Plus,
    Loader2,
    RefreshCw,
    Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

type CampaignRecipient = {
    id: string;
    status: string;
    lastStepOrder?: number;
    nextStepOrder?: number | null;
    nextStepAt?: string | null;
    contact: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        email: string;
        company?: { name?: string | null } | null;
    };
};

type CampaignStep = {
    id: string;
    order: number;
    stepType: 'EMAIL' | 'WAIT' | 'CONDITION';
    configJson: Record<string, unknown>;
};

type RecipientProgressStep = CampaignStep & {
    state: 'completed' | 'current' | 'pending';
    stateLabel: string;
};

type CampaignDetail = {
    id: string;
    name: string;
    objective?: string | null;
    status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
    createdAt: string;
    updatedAt: string;
    sent: number;
    opened: number;
    replies: number;
    recipientsCount: number;
    recentEvents?: Array<{
        id: string;
        eventType: 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'SPAM_COMPLAINT' | 'REPLY';
        createdAt: string;
        rawPayloadJson?: Record<string, unknown> | null;
        contact?: {
            id: string;
            firstName?: string | null;
            lastName?: string | null;
            email: string;
        } | null;
    }>;
    sendWindowJson?: {
        days?: number[];
        start?: string;
        end?: string;
        tz?: string;
    } | null;
    recipients: CampaignRecipient[];
    sequenceSteps: CampaignStep[];
};

type CampaignAction = 'launch' | 'pause' | 'resume';

type ContactOption = {
    id: string;
    name: string;
    email: string;
    jobTitle?: string;
    company?: string;
};

function getStepLabel(step?: CampaignStep | null) {
    if (!step) {
        return 'Unknown step';
    }

    if (step.stepType === 'WAIT') {
        const days = Number(step.configJson?.days || 0);
        return days > 0 ? `Wait ${days} day${days === 1 ? '' : 's'}` : 'Wait step';
    }

    return typeof step.configJson?.subject === 'string' && step.configJson.subject.trim()
        ? step.configJson.subject
        : 'Email step';
}

function getEventLabel(eventType: 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'SPAM_COMPLAINT' | 'REPLY') {
    switch (eventType) {
        case 'SENT':
            return 'Email sent';
        case 'DELIVERED':
            return 'Email delivered';
        case 'OPENED':
            return 'Email opened';
        case 'CLICKED':
            return 'Link clicked';
        case 'BOUNCED':
            return 'Email bounced';
        case 'SPAM_COMPLAINT':
            return 'Spam complaint';
        case 'REPLY':
            return 'Reply received';
        default:
            return 'Campaign event';
    }
}

function getRecipientNextAction(recipient: CampaignRecipient, sequenceSteps: CampaignStep[]) {
    if (!recipient.nextStepOrder) {
        if (recipient.status === 'REPLIED') return 'Sequence complete after reply';
        if (recipient.status === 'BOUNCED') return 'Delivery issue detected';
        if (recipient.status === 'OPTED_OUT') return 'Contact unsubscribed';
        if (recipient.status === 'COMPLETED') return 'Sequence completed';
        return 'No further steps scheduled';
    }

    const nextStep = sequenceSteps.find((step) => step.order === recipient.nextStepOrder);
    const stepLabel = nextStep ? getStepLabel(nextStep) : `Step ${recipient.nextStepOrder}`;

    if (recipient.nextStepAt) {
        const nextStepAt = new Date(recipient.nextStepAt);
        if (!Number.isNaN(nextStepAt.getTime())) {
            return `Next: ${stepLabel} · ${nextStepAt.toLocaleString()}`;
        }
    }

    return `Next: ${stepLabel}`;
}

function buildRecipientProgression(recipient: CampaignRecipient, sequenceSteps: CampaignStep[]) {
    const lastCompletedOrder = recipient.lastStepOrder ?? 0;
    const nextStepOrder = recipient.nextStepOrder ?? lastCompletedOrder + 1;

    return sequenceSteps.map((step) => {
        const isCompleted = step.order <= lastCompletedOrder;
        const isCurrent = step.order === nextStepOrder;
        const state: RecipientProgressStep['state'] = isCompleted ? 'completed' : isCurrent ? 'current' : 'pending';
        const stateLabel = isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Pending';

        return {
            ...step,
            state,
            stateLabel,
        };
    });
}

function formatScheduleMoment(value?: string | null) {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const now = Date.now();
    const diffMs = date.getTime() - now;
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    if (Math.abs(diffMinutes) < 60) {
        if (diffMinutes <= 0) return `due now`;
        return `in ${diffMinutes} min`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 48) {
        if (diffHours <= 0) return `${Math.abs(diffHours)} h ago`;
        return `in ${diffHours} h`;
    }

    const diffDays = Math.round(diffHours / 24);
    if (diffDays <= 0) return `${Math.abs(diffDays)} d ago`;
    return `in ${diffDays} d`;
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allContacts, setAllContacts] = useState<ContactOption[]>([]);
    const [contactsLoading, setContactsLoading] = useState(false);
    const [recipientMutationLoading, setRecipientMutationLoading] = useState(false);
    const [recipientSearch, setRecipientSearch] = useState('');
    const [selectedContactId, setSelectedContactId] = useState('');
    const [recipientPendingRemoval, setRecipientPendingRemoval] = useState<CampaignRecipient | null>(null);

    const fetchCampaignResponse = useCallback(async () => {
        const response = await fetch(`/api/workspace/engagement/campaign?id=${encodeURIComponent(id)}`, {
            credentials: 'same-origin',
            cache: 'no-store',
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => ({ error: null }));
            throw new Error(
                typeof payload?.message === 'string'
                    ? payload.message
                    : typeof payload?.error === 'string'
                        ? payload.error
                        : 'Unable to load campaign right now.',
            );
        }

        return response;
    }, [id]);

    const fetchCampaign = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await fetchCampaignResponse();
            const data = await response.json() as CampaignDetail;
            setCampaign(data);
            setError(null);
        } catch (err) {
            console.error('Campaign detail load failed:', err);
            setCampaign(null);
            setError(getErrorMessage(err, 'Unable to load campaign right now.'));
        } finally {
            setIsLoading(false);
        }
    }, [fetchCampaignResponse]);

    const fetchContacts = useCallback(async () => {
        setContactsLoading(true);

        try {
            const response = await fetch('/api/workspace/crm/contacts/options', {
                credentials: 'same-origin',
                cache: 'no-store',
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => ({ error: null }));
                throw new Error(typeof payload?.error === 'string' ? payload.error : 'Could not load contacts.');
            }
            const payload = await response.json() as Array<{
                id: string;
                firstName?: string | null;
                lastName?: string | null;
                email: string;
                jobTitle?: string | null;
                company?: { name?: string | null } | null;
                organization?: { name?: string | null } | null;
            }> | {
                items: Array<{
                    id: string;
                    firstName?: string | null;
                    lastName?: string | null;
                    email: string;
                    jobTitle?: string | null;
                    company?: { name?: string | null } | null;
                    organization?: { name?: string | null } | null;
                }>;
            };

            const items = Array.isArray(payload) ? payload : payload.items;

            setAllContacts(
                items.map((contact) => ({
                    id: contact.id,
                    name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
                    email: contact.email,
                    jobTitle: contact.jobTitle ?? undefined,
                    company: contact.company?.name || contact.organization?.name || undefined,
                })),
            );
        } catch (err) {
            console.error('Campaign contacts load failed:', err);
        } finally {
            setContactsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaign();
    }, [fetchCampaign]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const openRate = useMemo(() => {
        if (!campaign || campaign.sent === 0) return '0%';
        return `${Math.round((campaign.opened / campaign.sent) * 100)}%`;
    }, [campaign]);

    const replyRate = useMemo(() => {
        if (!campaign || campaign.sent === 0) return '0%';
        return `${Math.round((campaign.replies / campaign.sent) * 100)}%`;
    }, [campaign]);

    const scheduleSummary = useMemo(() => {
        const sendWindow = campaign?.sendWindowJson;
        if (!sendWindow?.days?.length || !sendWindow?.start || !sendWindow?.end) {
            return 'No sending window configured';
        }

        return `${sendWindow.start}-${sendWindow.end} (${sendWindow.tz || 'UTC'}) on ${sendWindow.days.join(', ')}`;
    }, [campaign]);

    const defaultTab = useMemo(() => {
        const tab = searchParams.get('tab');
        if (tab === 'people') return 'recipients';
        if (tab === 'analytics') return 'analytics';
        return 'sequence';
    }, [searchParams]);

    const recipientStatusBreakdown = useMemo(() => {
        if (!campaign) return [];

        const counts = campaign.recipients.reduce<Record<string, number>>((acc, recipient) => {
            const key = recipient.status || 'UNKNOWN';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [campaign]);

    const deliveryRate = useMemo(() => {
        if (!campaign || campaign.recipientsCount === 0) return '0%';
        return `${Math.round((campaign.sent / campaign.recipientsCount) * 100)}%`;
    }, [campaign]);

    const campaignHealth = useMemo(() => {
        if (!campaign) return 'No data yet';
        if (campaign.replies > 0) return 'Healthy reply activity detected';
        if (campaign.opened > 0) return 'Audience is opening but not replying yet';
        if (campaign.sent > 0) return 'Campaign is delivering but still warming up';
        return 'Campaign has not started delivering yet';
    }, [campaign]);

    const availableContacts = useMemo(() => {
        if (!campaign) return [];

        const linkedIds = new Set(campaign.recipients.map((recipient) => recipient.contact.id));
        return allContacts.filter((contact) => !linkedIds.has(contact.id));
    }, [allContacts, campaign]);

    const filteredRecipients = useMemo(() => {
        if (!campaign) return [];

        const query = recipientSearch.trim().toLowerCase();
        if (!query) return campaign.recipients;

        return campaign.recipients.filter((recipient) => {
            const fullName = [recipient.contact.firstName, recipient.contact.lastName].filter(Boolean).join(' ').toLowerCase();
            const email = recipient.contact.email.toLowerCase();
            const company = recipient.contact.company?.name?.toLowerCase() || '';
            return fullName.includes(query) || email.includes(query) || company.includes(query);
        });
    }, [campaign, recipientSearch]);

    const scheduledRecipientsCount = useMemo(() => {
        if (!campaign) return 0;
        return campaign.recipients.filter((recipient) => recipient.status === "SCHEDULED").length;
    }, [campaign]);
    const recipientProgressions = useMemo(() => {
        if (!campaign) return [];

        return campaign.recipients.map((recipient) => ({
            recipient,
            progression: buildRecipientProgression(recipient, campaign.sequenceSteps),
        }));
    }, [campaign]);

    const recipientProgressionById = useMemo(() => {
        return new Map(
            recipientProgressions.map(({ recipient, progression }) => [recipient.id, progression]),
        );
    }, [recipientProgressions]);

    const getPrimaryAction = useMemo<CampaignAction | null>(() => {
        if (!campaign) return null;

        if (campaign.status === 'RUNNING') return 'pause';
        if (campaign.status === 'PAUSED') return 'resume';
        if (campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') return 'launch';
        return null;
    }, [campaign]);

    const runCampaignAction = async (action: CampaignAction) => {
        if (!campaign) return;

        setIsUpdating(true);

        try {
            if (action === 'launch') {
                await apiFetch(`/engagement/campaigns/${campaign.id}/launch`, {
                    method: 'POST',
                });
            } else {
                await apiFetch(`/engagement/campaigns/${campaign.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: action === 'pause' ? 'PAUSED' : 'RUNNING',
                    }),
                });
            }

            toast({
                title:
                    action === 'launch'
                        ? 'Campaign launched'
                        : action === 'resume'
                            ? 'Campaign resumed'
                            : 'Campaign paused',
            });
            await fetchCampaign();
        } catch (err) {
            toast({
                title: 'Action failed',
                description: getErrorMessage(err, 'Could not update campaign status.'),
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const addRecipient = async () => {
        if (!selectedContactId) return;

        setRecipientMutationLoading(true);

        try {
            const response = await fetch(`/api/workspace/engagement/campaigns/${id}/recipients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contactIds: [selectedContactId],
                }),
                cache: 'no-store',
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({ error: null, message: null }));
                throw new Error(
                    typeof payload?.message === 'string'
                        ? payload.message
                        : typeof payload?.error === 'string'
                            ? payload.error
                            : 'Could not add recipient.',
                );
            }

            setSelectedContactId('');
            toast({
                title: 'Recipient added',
                description: 'The contact is now part of this campaign.',
            });
            await fetchCampaign();
        } catch (err) {
            toast({
                title: 'Could not add recipient',
                description: getErrorMessage(err, 'Could not add recipient.'),
                variant: 'destructive',
            });
        } finally {
            setRecipientMutationLoading(false);
        }
    };

    const removeRecipient = async (contactId: string) => {
        setRecipientMutationLoading(true);

        try {
            const response = await fetch(`/api/workspace/engagement/campaigns/${id}/recipients`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contactId }),
                cache: 'no-store',
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({ error: null, message: null }));
                throw new Error(
                    typeof payload?.message === 'string'
                        ? payload.message
                        : typeof payload?.error === 'string'
                            ? payload.error
                            : 'Could not remove recipient.',
                );
            }

            toast({
                title: 'Recipient removed',
                description: 'The contact was removed from this campaign.',
            });
            await fetchCampaign();
        } catch (err) {
            toast({
                title: 'Could not remove recipient',
                description: getErrorMessage(err, 'Could not remove recipient.'),
                variant: 'destructive',
            });
        } finally {
            setRecipientMutationLoading(false);
        }
    };

    const confirmRecipientRemoval = async () => {
        if (!recipientPendingRemoval) {
            return;
        }

        const recipientToRemove = recipientPendingRemoval;
        setRecipientPendingRemoval(null);
        await removeRecipient(recipientToRemove.contact.id);
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/engagement">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Campaign not available</h1>
                </div>

                <Card>
                    <CardContent className="space-y-4 py-10 text-center">
                        <p className="text-sm text-destructive">{error || 'Campaign not found.'}</p>
                        <Button onClick={fetchCampaign}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/engagement">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
                            <Badge variant={campaign.status === 'RUNNING' ? 'default' : 'secondary'}>{campaign.status}</Badge>
                        </div>
                        <p className="mt-1 text-muted-foreground">{campaign.objective || 'No campaign objective defined yet.'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getPrimaryAction && (
                        <Button
                            variant={getPrimaryAction === 'pause' ? 'outline' : 'default'}
                            onClick={() => runCampaignAction(getPrimaryAction)}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : getPrimaryAction === 'pause' ? (
                                <Pause className="mr-2 h-4 w-4" />
                            ) : (
                                <Play className="mr-2 h-4 w-4" />
                            )}
                            {getPrimaryAction === 'launch'
                                ? 'Launch'
                                : getPrimaryAction === 'resume'
                                    ? 'Resume'
                                    : 'Pause'}
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/engagement/campaigns/${id}/schedule`}>
                            <Calendar className="mr-2 h-4 w-4" /> Schedule
                        </Link>
                    </Button>
                    <Button variant="accent" asChild>
                        <Link href={`/dashboard/engagement/campaigns/${id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Sequence
                        </Link>
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-none border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Recipients</p>
                        <p className="text-2xl font-bold">{campaign.recipientsCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Sent</p>
                        <p className="text-2xl font-bold">{campaign.sent}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Open Rate</p>
                        <p className="text-2xl font-bold text-success">{openRate}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Reply Rate</p>
                        <p className="text-2xl font-bold text-success">{replyRate}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Send Window</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    {scheduleSummary}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign cadence</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>{campaign.sequenceSteps.length} total step{campaign.sequenceSteps.length === 1 ? "" : "s"}</p>
                        <p>{campaign.sequenceSteps.filter((step) => step.stepType === "EMAIL").length} email step{campaign.sequenceSteps.filter((step) => step.stepType === "EMAIL").length === 1 ? "" : "s"}</p>
                        <p>{campaign.sequenceSteps.filter((step) => step.stepType === "WAIT").length} wait step{campaign.sequenceSteps.filter((step) => step.stepType === "WAIT").length === 1 ? "" : "s"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recipients in progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>{scheduledRecipientsCount} scheduled right now</p>
                        <p>{campaign.recipients.filter((recipient) => recipient.status === "SENT").length} waiting after a sent email</p>
                        <p>{campaign.recipients.filter((recipient) => recipient.status === "REPLIED").length} replied</p>
                        <p>{campaign.recipients.filter((recipient) => recipient.status === "COMPLETED").length} completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Recipient progression</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Live view of where every recipient is inside this campaign flow.
                            </p>
                        </div>
                        <Badge variant="outline">
                            {campaign.recipients.length} recipient{campaign.recipients.length === 1 ? "" : "s"}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recipientProgressions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Add at least one recipient to start tracking real step progression.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                {recipientProgressions.map(({ recipient, progression }) => {
                                    const name =
                                        [recipient.contact.firstName, recipient.contact.lastName].filter(Boolean).join(" ") ||
                                        recipient.contact.email;

                                    return (
                                        <div key={recipient.id} className="rounded-none border border-border p-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground">{name}</p>
                                                    <p className="text-sm text-muted-foreground">{recipient.contact.email}</p>
                                                    {recipient.contact.company?.name ? (
                                                        <p className="mt-1 text-xs text-muted-foreground">{recipient.contact.company.name}</p>
                                                    ) : null}
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        recipient.status === 'REPLIED' || recipient.status === 'COMPLETED'
                                                            ? 'border-success/40 text-success'
                                                            : recipient.status === 'SCHEDULED' || recipient.status === 'SENT'
                                                                ? 'border-primary/40 text-primary'
                                                                : recipient.status === 'BOUNCED' || recipient.status === 'OPTED_OUT'
                                                                    ? 'border-destructive/40 text-destructive'
                                                                    : undefined
                                                    }
                                                >
                                                    {recipient.status}
                                                </Badge>
                                            </div>

                                            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                                                <div className="rounded-none border border-border bg-card/40 p-3">
                                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Current flow</p>
                                                    <p className="mt-1 font-medium text-foreground">
                                                        {getRecipientNextAction(recipient, campaign.sequenceSteps)}
                                                    </p>
                                                </div>
                                                <div className="rounded-none border border-border bg-card/40 p-3">
                                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Next campaign step</p>
                                                    <p className="mt-1 font-medium text-foreground">
                                                        {recipient.nextStepOrder
                                                            ? getStepLabel(campaign.sequenceSteps.find((step) => step.order === recipient.nextStepOrder) || campaign.sequenceSteps[0] || {
                                                                id: '',
                                                                order: recipient.nextStepOrder,
                                                                stepType: 'EMAIL',
                                                                configJson: {},
                                                            })
                                                            : 'No remaining steps'}
                                                    </p>
                                                </div>
                                                <div className="rounded-none border border-border bg-card/40 p-3">
                                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Expected execution</p>
                                                    <p className="mt-1 font-medium text-foreground">
                                                        {recipient.nextStepAt ? formatScheduleMoment(recipient.nextStepAt) : 'Waiting for the next trigger'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Recipient progression</p>
                                                <div className="space-y-2">
                                                    {progression.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground">No sequence steps defined yet.</p>
                                                    ) : (
                                                        progression.slice(0, 4).map((step) => (
                                                            <div key={`${recipient.id}-summary-${step.order}`} className="flex items-center gap-3 rounded-none border border-border px-3 py-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        step.state === 'completed'
                                                                            ? 'border-success/40 text-success'
                                                                            : step.state === 'current'
                                                                                ? 'border-primary/40 text-primary'
                                                                                : 'border-muted-foreground/30 text-muted-foreground'
                                                                    }
                                                                >
                                                                    {step.stateLabel}
                                                                </Badge>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-medium text-foreground">
                                                                        Step {step.order}: {getStepLabel(step)}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {step.stepType === 'WAIT'
                                                                            ? `${Number(step.configJson?.days || 0)} day wait`
                                                                            : 'Email scheduled in sequence'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sequence">Sequence Steps</TabsTrigger>
                    <TabsTrigger value="recipients">People</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="sequence" className="space-y-4">
                    <div className="mx-auto max-w-3xl space-y-4 py-4">
                        {campaign.sequenceSteps.length === 0 ? (
                            <Card>
                                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                    This campaign does not have any sequence steps yet.
                                </CardContent>
                            </Card>
                        ) : (
                            campaign.sequenceSteps.map((step, idx) => (
                                <div key={step.id} className="relative flex gap-6">
                                    {idx < campaign.sequenceSteps.length - 1 && (
                                        <div className="absolute bottom-0 left-6 top-12 w-px bg-border" />
                                    )}
                                    <div className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-none ${step.stepType === 'EMAIL' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {step.stepType === 'EMAIL' ? <Mail className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                                    </div>
                                    <Card className="flex-1">
                                        <CardHeader className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Badge variant="outline" className="mb-1">{step.stepType}</Badge>
                                                    <CardTitle className="text-base">{getStepLabel(step)}</CardTitle>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </div>
                            ))
                        )}
                        <Button variant="outline" className="w-full border-dashed" asChild>
                            <Link href={`/dashboard/engagement/campaigns/${id}/edit`}>
                                <Plus className="mr-2 h-4 w-4" /> Manage Steps
                            </Link>
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="recipients" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recipient progression</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recipientProgressions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Add at least one recipient to start tracking real step progression.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                                    {recipientProgressions.map(({ recipient, progression }) => {
                                        const name =
                                            [recipient.contact.firstName, recipient.contact.lastName].filter(Boolean).join(' ') ||
                                            recipient.contact.email;

                                        return (
                                        <div key={recipient.id} className="rounded-none border border-border p-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground">{name}</p>
                                                    <p className="text-sm text-muted-foreground">{recipient.contact.email}</p>
                                                    {recipient.contact.company?.name ? (
                                                        <p className="mt-1 text-xs text-muted-foreground">{recipient.contact.company.name}</p>
                                                    ) : null}
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        recipient.status === 'REPLIED' || recipient.status === 'COMPLETED'
                                                            ? 'border-success/40 text-success'
                                                            : recipient.status === 'SCHEDULED' || recipient.status === 'SENT'
                                                                ? 'border-primary/40 text-primary'
                                                                : recipient.status === 'BOUNCED' || recipient.status === 'OPTED_OUT'
                                                                    ? 'border-destructive/40 text-destructive'
                                                                    : undefined
                                                    }
                                                >
                                                    {recipient.status}
                                                </Badge>
                                            </div>

                                            <div className="mt-4 space-y-2 text-sm">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-muted-foreground">Current flow</span>
                                                    <span className="text-right text-foreground">{getRecipientNextAction(recipient, campaign.sequenceSteps)}</span>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-muted-foreground">Next campaign step</span>
                                                    <span className="text-right text-foreground">
                                                        {recipient.nextStepOrder
                                                            ? getStepLabel(campaign.sequenceSteps.find((step) => step.order === recipient.nextStepOrder) || campaign.sequenceSteps[0] || {
                                                                id: '',
                                                                order: recipient.nextStepOrder,
                                                                stepType: 'EMAIL',
                                                                configJson: {},
                                                            })
                                                            : 'No remaining steps'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-muted-foreground">Expected execution</span>
                                                    <span className="text-right text-foreground">{formatScheduleMoment(recipient.nextStepAt) || 'Not scheduled'}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-2">
                                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Recipient progression</p>
                                                <div className="space-y-2">
                                                    {progression.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground">No sequence steps defined yet.</p>
                                                    ) : (
                                                        progression.map((step) => (
                                                            <div key={step.id} className="flex items-center gap-3 rounded-none border border-border px-3 py-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        step.state === 'completed'
                                                                            ? 'border-success/40 text-success'
                                                                            : step.state === 'current'
                                                                                ? 'border-primary/40 text-primary'
                                                                                : 'border-muted-foreground/30 text-muted-foreground'
                                                                    }
                                                                >
                                                                    {step.stateLabel}
                                                                </Badge>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-medium text-foreground">
                                                                        Step {step.order}: {getStepLabel(step)}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {step.stepType === 'WAIT'
                                                                            ? `${Number(step.configJson?.days || 0)} day wait`
                                                                            : 'Email scheduled in sequence'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Add recipients</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                                <select
                                    className="h-10 rounded-none border border-input bg-background px-3 text-sm"
                                    value={selectedContactId}
                                    onChange={(e) => setSelectedContactId(e.target.value)}
                                    disabled={recipientMutationLoading || contactsLoading || availableContacts.length === 0}
                                >
                                    <option value="">
                                        {contactsLoading
                                            ? 'Loading contacts...'
                                            : availableContacts.length === 0
                                                ? 'All contacts are already linked'
                                                : 'Select a contact to add'}
                                    </option>
                                    {availableContacts.map((contact) => (
                                        <option key={contact.id} value={contact.id}>
                                            {contact.name} â€” {contact.email}{contact.company ? ` â€” ${contact.company}` : ''}
                                        </option>
                                    ))}
                                </select>
                                <Button onClick={addRecipient} disabled={!selectedContactId || recipientMutationLoading}>
                                    {recipientMutationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Add Recipient
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Campaign Recipients
                                </CardTitle>
                                <Input
                                    value={recipientSearch}
                                    onChange={(e) => setRecipientSearch(e.target.value)}
                                    placeholder="Search recipients..."
                                    className="md:max-w-xs"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredRecipients.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {campaign.recipients.length === 0 ? 'No recipients have been added yet.' : 'No recipients match this search.'}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {filteredRecipients.map((recipient) => (
                                        <div key={recipient.id} className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                                            <div className="min-w-0 space-y-3">
                                                <p className="font-medium">
                                                    {[recipient.contact.firstName, recipient.contact.lastName].filter(Boolean).join(' ') || recipient.contact.email}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {recipient.contact.email}
                                                    {recipient.contact.company?.name ? ` â€” ${recipient.contact.company.name}` : ''}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {getRecipientNextAction(recipient, campaign.sequenceSteps)}
                                                </p>
                                                <div className="rounded-none border border-border bg-background/30 p-3">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                        Recipient progression
                                                    </p>
                                                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                                                        <div className="rounded-none border border-border bg-card/40 p-3">
                                                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Current flow</p>
                                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                                {recipient.lastStepOrder
                                                                    ? getStepLabel(
                                                                        campaign.sequenceSteps.find((step) => step.order === recipient.lastStepOrder) ?? null,
                                                                    )
                                                                    : 'Not started'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-none border border-border bg-card/40 p-3">
                                                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Next campaign step</p>
                                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                                {recipient.nextStepOrder
                                                                    ? `Step ${recipient.nextStepOrder}: ${
                                                                        getStepLabel(
                                                                            campaign.sequenceSteps.find((step) => step.order === recipient.nextStepOrder) ?? null,
                                                                        )
                                                                    }`
                                                                    : 'No future steps are scheduled yet.'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-none border border-border bg-card/40 p-3">
                                                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Expected execution</p>
                                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                                {recipient.nextStepAt
                                                                    ? formatScheduleMoment(recipient.nextStepAt)
                                                                    : 'Waiting for a new trigger or completion.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 space-y-2">
                                                        {(recipientProgressionById.get(recipient.id) ?? []).length === 0 ? (
                                                            <p className="text-xs text-muted-foreground">
                                                                No progression events recorded yet. The first step will appear here when delivery begins.
                                                            </p>
                                                        ) : (recipientProgressionById.get(recipient.id) ?? []).map((step) => (
                                                            <div
                                                                key={`${recipient.id}-progress-${step.order}`}
                                                                className="flex flex-col gap-2 rounded-none border border-border/80 bg-card/60 p-3 md:flex-row md:items-center md:justify-between"
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-foreground">
                                                                        Step {step.order}: {getStepLabel(step)}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {step.stepType === 'WAIT'
                                                                            ? `${Number(step.configJson?.days || 0)} day wait`
                                                                            : 'Email step'}
                                                                    </p>
                                                                </div>
                                                                <Badge
                                                                    variant={
                                                                        step.state === 'completed'
                                                                            ? 'default'
                                                                            : step.state === 'current'
                                                                                ? 'secondary'
                                                                                : 'outline'
                                                                    }
                                                                >
                                                                    {step.state === 'completed'
                                                                        ? 'Completed'
                                                                        : step.state === 'current'
                                                                            ? 'Current'
                                                                            : 'Pending'}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{recipient.status}</Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setRecipientPendingRemoval(recipient)}
                                                    disabled={recipientMutationLoading}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                                <p className="text-2xl font-bold">{deliveryRate}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {campaign.sent} sent out of {campaign.recipientsCount} recipients
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Open Rate</p>
                                <p className="text-2xl font-bold text-success">{openRate}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {campaign.opened} opens tracked
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Reply Rate</p>
                                <p className="text-2xl font-bold text-success">{replyRate}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {campaign.replies} replies tracked
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Sequence Steps</p>
                                <p className="text-2xl font-bold">{campaign.sequenceSteps.length}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Live steps in this campaign
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recipient progression</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recipientProgressions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Add recipients to see their live step progression here.</p>
                            ) : (
                                <div className="space-y-4">
                                    {recipientProgressions.map(({ recipient, progression }) => {
                                        const name =
                                            [recipient.contact.firstName, recipient.contact.lastName].filter(Boolean).join(' ') ||
                                            recipient.contact.email;

                                        return (
                                            <div key={recipient.id} className="rounded-none border border-border p-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="font-medium text-foreground">{name}</p>
                                                        <p className="text-sm text-muted-foreground">{recipient.contact.email}</p>
                                                    </div>
                                                    <Badge variant="outline">{recipient.status}</Badge>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                    {progression.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground">No sequence steps configured.</p>
                                                    ) : (
                                                        progression.map((step) => (
                                                            <div key={step.id} className="flex items-center gap-3">
                                                                <div
                                                                    className={`h-2.5 w-2.5 rounded-full ${
                                                                        step.state === 'completed'
                                                                            ? 'bg-success'
                                                                            : step.state === 'current'
                                                                                ? 'bg-primary'
                                                                                : 'bg-muted-foreground/40'
                                                                    }`}
                                                                />
                                                                <p className="text-sm text-muted-foreground">
                                                                    Step {step.order} · {step.stateLabel} · {getStepLabel(step)}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Campaign Snapshot
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>Created: {new Date(campaign.createdAt).toLocaleString()}</p>
                                <p>Last updated: {new Date(campaign.updatedAt).toLocaleString()}</p>
                                <p>Status: {campaign.status}</p>
                                <p>Send window: {scheduleSummary}</p>
                                <p className="pt-2 text-foreground">{campaignHealth}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recipient Status Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recipientStatusBreakdown.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No recipient activity yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {recipientStatusBreakdown.map(([status, count]) => (
                                            <div key={status} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                                                <span className="text-sm font-medium">{status}</span>
                                                <Badge variant="outline">{count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Recent Campaign Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {campaign.recentEvents?.length ? (
                                    <div className="space-y-3">
                                        {campaign.recentEvents.map((event) => {
                                            const contactName = [event.contact?.firstName, event.contact?.lastName]
                                                .filter(Boolean)
                                                .join(' ')
                                                .trim() || event.contact?.email || 'Unknown contact';

                                            const payloadText =
                                                typeof event.rawPayloadJson?.text === 'string'
                                                    ? event.rawPayloadJson.text
                                                    : typeof event.rawPayloadJson?.subject === 'string'
                                                        ? event.rawPayloadJson.subject
                                                        : null;

                                            return (
                                                <div key={event.id} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                                                    <div className="min-w-0">
                                                        <p className="font-medium">{getEventLabel(event.eventType)}</p>
                                                        <p className="text-sm text-muted-foreground">{contactName}</p>
                                                        {payloadText ? (
                                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{payloadText}</p>
                                                        ) : null}
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <Badge variant="outline">{event.eventType}</Badge>
                                                        <p className="mt-2 text-xs text-muted-foreground">
                                                            {new Date(event.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No campaign activity has been recorded yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={Boolean(recipientPendingRemoval)} onOpenChange={(open) => !open && setRecipientPendingRemoval(null)}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Remove recipient</DialogTitle>
                        <DialogDescription>
                            {recipientPendingRemoval
                                ? `Remove ${[recipientPendingRemoval.contact.firstName, recipientPendingRemoval.contact.lastName].filter(Boolean).join(' ') || recipientPendingRemoval.contact.email} from this campaign?`
                                : 'Remove this recipient from the campaign?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRecipientPendingRemoval(null)} disabled={recipientMutationLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmRecipientRemoval} disabled={recipientMutationLoading}>
                            {recipientMutationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Remove recipient
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
