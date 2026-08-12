'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Badge,
    ScrollArea,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Button,
    useToast
} from '@ori-os/ui';
import {
    Mail,
    Users,
    Send,
    MessageSquare,
    BarChart3,
    Clock,
    Edit2,
    Plus,
    Loader2,
    Calendar
} from 'lucide-react';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

interface SequenceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sequence: any;
}

type CampaignRecipient = {
    id: string;
    status: string;
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
    configJson: Record<string, any>;
};

type CampaignDetail = {
    id: string;
    name: string;
    objective?: string | null;
    status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
    createdAt?: string;
    updatedAt?: string;
    sent?: number;
    opened?: number;
    replies?: number;
    recipientsCount?: number;
    recipients?: CampaignRecipient[];
    sequenceSteps?: CampaignStep[];
    sendWindowJson?: {
        days?: number[];
        start?: string;
        end?: string;
        tz?: string;
    } | null;
};

export function SequenceDetailsModal({ isOpen, onClose, sequence }: SequenceDetailsModalProps) {
    const { toast } = useToast();
    const [campaignDetail, setCampaignDetail] = useState<CampaignDetail | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadCampaignDetail = async () => {
            if (!isOpen || !sequence?.id) {
                return;
            }

            setIsLoadingDetail(true);
            setDetailError(null);

            try {
                const response = await apiFetch(`/engagement/campaigns/${sequence.id}`);
                const data = await response.json();

                if (!cancelled) {
                    setCampaignDetail(data);
                }
            } catch (error) {
                if (!cancelled) {
                    setCampaignDetail(null);
                    setDetailError(getErrorMessage(error, 'Could not load campaign details.'));
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingDetail(false);
                }
            }
        };

        loadCampaignDetail();

        return () => {
            cancelled = true;
        };
    }, [isOpen, sequence?.id]);

    const activeSequence = campaignDetail ?? sequence ?? {};
    const enrolledCount = Number(activeSequence.recipientsCount ?? activeSequence.contacts ?? activeSequence.recipients ?? 0);
    const sentCount = Number(activeSequence.sent ?? 0);
    const openedCount = Number(activeSequence.opened ?? 0);
    const repliedCount = Number(activeSequence.replied ?? activeSequence.replies ?? 0);
    const sequenceStatus = String(activeSequence.status ?? 'DRAFT').toUpperCase();
    const openRate = sentCount > 0 ? `${Math.round((openedCount / sentCount) * 100)}%` : '0%';
    const replyRate = sentCount > 0 ? `${Math.round((repliedCount / sentCount) * 100)}%` : '0%';

    const scheduleSummary = useMemo(() => {
        const sendWindow = activeSequence.sendWindowJson;

        if (!sendWindow?.days?.length || !sendWindow?.start || !sendWindow?.end) {
            return 'No sending window configured';
        }

        return `${sendWindow.start}–${sendWindow.end} (${sendWindow.tz || 'UTC'}) · Days ${sendWindow.days.join(', ')}`;
    }, [activeSequence.sendWindowJson]);

    const stats = [
        { label: 'Enrolled', value: enrolledCount, icon: Users, color: 'text-blue-500' },
        { label: 'Sent', value: sentCount, icon: Send, color: 'text-purple-500' },
        { label: 'Opened', value: openedCount, icon: Mail, color: 'text-green-500' },
        { label: 'Replied', value: repliedCount, icon: MessageSquare, color: 'text-tangerine' },
    ];

    if (!sequence) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex h-full max-w-[96vw] flex-col overflow-hidden p-0 sm:max-w-[700px]">
                <DialogHeader className="shrink-0 p-6 pb-2">
                    <div className="flex items-center justify-between pr-8">
                        <div className="flex items-center gap-3">
                            <div className="rounded-none bg-tangerine/10 p-2 text-tangerine">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">{activeSequence.name}</DialogTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {activeSequence.objective || 'No campaign objective defined yet.'}
                                </p>
                            </div>
                        </div>
                        <Badge variant={sequenceStatus === 'RUNNING' ? 'success' : sequenceStatus === 'PAUSED' ? 'warning' : 'secondary'}>
                            {sequenceStatus}
                        </Badge>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
                    <div className="shrink-0 border-b border-border px-6">
                        <TabsList className="h-12 gap-6 bg-transparent p-0">
                            <TabsTrigger value="overview" className="h-full rounded-none border-b-2 border-transparent px-1 font-semibold shadow-none data-[state=active]:border-tangerine data-[state=active]:bg-transparent">Overview</TabsTrigger>
                            <TabsTrigger value="steps" className="h-full rounded-none border-b-2 border-transparent px-1 font-semibold shadow-none data-[state=active]:border-tangerine data-[state=active]:bg-transparent">Steps</TabsTrigger>
                            <TabsTrigger value="contacts" className="h-full rounded-none border-b-2 border-transparent px-1 font-semibold shadow-none data-[state=active]:border-tangerine data-[state=active]:bg-transparent">Contacts</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="min-h-0 flex-1 p-6">
                        <TabsContent value="overview" className="mt-0 space-y-6">
                            {detailError && (
                                <div className="rounded-none border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {detailError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="rounded-none border border-border bg-muted/20 p-4">
                                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                                            <stat.icon className={`h-3 w-3 ${stat.color}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                                        </div>
                                        <div className="text-xl font-bold">{Number(stat.value ?? 0).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-none border border-border bg-muted/20 p-4">
                                    <h4 className="mb-3 text-sm font-bold">Campaign Snapshot</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-muted-foreground">Created</span>
                                            <span className="text-right">
                                                {activeSequence.createdAt ? new Date(activeSequence.createdAt).toLocaleString() : 'Not available'}
                                            </span>
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-muted-foreground">Last updated</span>
                                            <span className="text-right">
                                                {activeSequence.updatedAt ? new Date(activeSequence.updatedAt).toLocaleString() : 'Not available'}
                                            </span>
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-muted-foreground">Open rate</span>
                                            <span className="text-right">{openRate}</span>
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-muted-foreground">Reply rate</span>
                                            <span className="text-right">{replyRate}</span>
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Send window
                                            </span>
                                            <span className="max-w-[260px] text-right">{scheduleSummary}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-none border border-border bg-muted/20 p-4">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold">
                                        <Clock className="h-4 w-4" /> Live Summary
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="rounded-none border border-border/60 p-3">
                                            <p className="font-semibold text-foreground">Campaign health</p>
                                            <p className="mt-1 text-muted-foreground">
                                                {sequenceStatus === 'RUNNING'
                                                    ? 'This campaign is actively sending based on its configured schedule.'
                                                    : sequenceStatus === 'PAUSED'
                                                        ? 'This campaign is paused and can be resumed when the sequence is ready again.'
                                                        : 'This campaign is not actively sending yet.'}
                                            </p>
                                        </div>
                                        <div className="rounded-none border border-border/60 p-3">
                                            <p className="font-semibold text-foreground">Audience coverage</p>
                                            <p className="mt-1 text-muted-foreground">
                                                {enrolledCount > 0
                                                    ? `${enrolledCount.toLocaleString()} recipients are currently enrolled in this campaign.`
                                                    : 'No recipients are enrolled in this campaign yet.'}
                                            </p>
                                        </div>
                                        <div className="rounded-none border border-border/60 p-3">
                                            <p className="font-semibold text-foreground">Conversation signal</p>
                                            <p className="mt-1 text-muted-foreground">
                                                {repliedCount > 0
                                                    ? `${repliedCount.toLocaleString()} replies have been recorded so far.`
                                                    : 'No replies have been recorded yet.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="steps" className="mt-0">
                            <div className="space-y-4">
                                {isLoadingDetail ? (
                                    <div className="flex h-40 items-center justify-center rounded-none border border-border">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : (campaignDetail?.sequenceSteps?.length ?? 0) === 0 ? (
                                    <div className="rounded-none border border-border p-6 text-center text-muted-foreground">
                                        No sequence steps configured yet.
                                    </div>
                                ) : campaignDetail!.sequenceSteps!.map((step) => (
                                    <div key={step.id} className="flex items-center justify-between gap-4 rounded-none border border-border p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-muted text-sm font-bold">
                                                {step.order}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">
                                                    {step.stepType === 'EMAIL'
                                                        ? step.configJson?.subject || 'Untitled email step'
                                                        : step.stepType === 'WAIT'
                                                            ? `Wait ${step.configJson?.days || 0} days`
                                                            : 'Conditional branch'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {step.stepType === 'EMAIL'
                                                        ? 'Email step'
                                                        : step.stepType === 'WAIT'
                                                            ? 'Delay step'
                                                            : 'Condition step'}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => toast({ title: 'Edit Step', description: 'Full sequence editing lives in the campaign editor.' })}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed"
                                    onClick={() => toast({ title: 'Add Step', description: 'Opening step builder...' })}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Step
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="contacts" className="mt-0">
                            {isLoadingDetail ? (
                                <div className="flex h-40 items-center justify-center rounded-none border border-border">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : (campaignDetail?.recipients?.length ?? 0) === 0 ? (
                                <div className="py-12 text-center italic text-muted-foreground">
                                    No contacts are enrolled in this campaign yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {campaignDetail!.recipients!.map((recipient) => {
                                        const fullName = `${recipient.contact.firstName || ''} ${recipient.contact.lastName || ''}`.trim();

                                        return (
                                            <div key={recipient.id} className="flex items-center justify-between rounded-none border border-border p-4">
                                                <div>
                                                    <p className="text-sm font-semibold">{fullName || recipient.contact.email}</p>
                                                    <p className="text-xs text-muted-foreground">{recipient.contact.email}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {recipient.contact.company?.name || 'No company assigned'}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">{recipient.status}</Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <div className="shrink-0 border-t border-border bg-muted/20 p-4">
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button
                            variant="accent"
                            onClick={() => toast({ title: 'Enroll contacts', description: 'Opening contact selector...' })}
                        >
                            Enroll Contacts
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
