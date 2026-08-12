
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Badge,
    Checkbox,
} from '@ori-os/ui';
import {
    Trash2,
    Mail,
    Clock,
    Rocket,
    AlertCircle,
    Target,
    ShieldCheck,
    Globe,
    ShieldAlert,
    Search,
    Loader
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useIcpProfiles } from '@/hooks/use-icp-profiles';
import { useMailboxes } from '@/hooks/use-mailboxes';
import { useContacts } from '@/hooks/use-contacts';
import { useToast } from '@ori-os/ui';
import { useRouter } from 'next/navigation';
import { fetchWorkspaceJson, getErrorMessage } from '@/lib/api-client';

type StepType = 'EMAIL' | 'WAIT' | 'CONDITION';

type SendWindowDay = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type EmailStepConfig = {
    subject: string;
    body?: string;
};

type WaitStepConfig = {
    days: number;
};

type ConditionStepConfig = Record<string, never>;

type SequenceStepConfig = EmailStepConfig | WaitStepConfig | ConditionStepConfig;

type SequenceStep = {
    id: string;
    type: StepType;
    config: SequenceStepConfig;
    order: number;
};

type SendWindow = {
    tz: string;
    start: string;
    end: string;
    days: SendWindowDay[];
};

type WizardMailbox = {
    id: string;
    email: string;
    isActive: boolean;
    provider?: string;
    dailyLimit?: number;
    domain?: {
        lastAuditScore?: number | null;
    } | null;
};

const PREFERRED_MAILBOX_EMAIL = 'business@ori-craftlabs.com';
const DEFAULT_SEND_WINDOW = {
    tz: 'Europe/Warsaw',
    start: '09:00',
    end: '16:30',
    days: [1, 2, 3, 4, 5],
} as const satisfies SendWindow;

const SEND_WINDOW_DAY_OPTIONS: Array<{ value: SendWindowDay; label: string }> = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' },
];

type CreatedCampaign = {
    id: string;
};

function isWaitStep(step: SequenceStep): step is SequenceStep & { config: WaitStepConfig } {
    return step.type === 'WAIT';
}

function isEmailStep(step: SequenceStep): step is SequenceStep & { config: EmailStepConfig } {
    return step.type === 'EMAIL';
}

function formatSendWindow(sendWindow: SendWindow) {
    const dayLabels = SEND_WINDOW_DAY_OPTIONS
        .filter((day) => sendWindow.days.includes(day.value))
        .map((day) => day.label)
        .join(', ');

    return `${sendWindow.start}-${sendWindow.end} (${sendWindow.tz}) on ${dayLabels}`;
}

function toggleSendWindowDay(currentDays: SendWindowDay[], day: SendWindowDay): SendWindowDay[] {
    const nextDays = currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : [...currentDays, day];

    return [...nextDays].sort((left, right) => left - right) as SendWindowDay[];
}

function selectPreferredMailbox(mailboxes: WizardMailbox[]): WizardMailbox | null {
    if (!mailboxes.length) {
        return null;
    }

    const activeMailboxes = mailboxes.filter((mailbox) => mailbox.isActive);
    const candidateMailboxes = activeMailboxes.length ? activeMailboxes : mailboxes;

    return (
        candidateMailboxes.find((mailbox) => mailbox.email.toLowerCase() === PREFERRED_MAILBOX_EMAIL) ??
        candidateMailboxes.find((mailbox) => mailbox.email.toLowerCase().endsWith('@ori-craftlabs.com')) ??
        candidateMailboxes[0] ??
        null
    );
}

const WIZARD_STEPS = [
    { id: 1, title: 'Objective & ICP', description: 'Define goal and target profile' },
    { id: 2, title: 'Audience & Data', description: 'Select and validate leads' },
    { id: 3, title: 'Sending Setup', description: 'Domain & mailbox choice' },
    { id: 4, title: 'Sequence Design', description: 'Write content and rules' },
    { id: 5, title: 'Compliance & Safety', description: 'GDPR and legal checks' },
    { id: 6, title: 'Review & Launch', description: 'Final pre-flight checks' }
];

export function CampaignWizard() {
    const router = useRouter();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreatingIcpProfile, setIsCreatingIcpProfile] = useState(false);
    const [newIcpProfileName, setNewIcpProfileName] = useState('');
    const [isSavingIcpProfile, setIsSavingIcpProfile] = useState(false);

    // Form data
    const [campaignName, setCampaignName] = useState('');
    const [objective, setObjective] = useState('Book meetings');
    const [selectedIcpId, setSelectedIcpId] = useState<string>('');
    const [sequence, setSequence] = useState<SequenceStep[]>([
        { id: '1', type: 'EMAIL', config: { subject: 'Quick question' }, order: 1 }
    ]);
    const [selectedMailboxId, setSelectedMailboxId] = useState<string>('');
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
    const [sendWindow, setSendWindow] = useState<SendWindow>({ ...DEFAULT_SEND_WINDOW, days: [...DEFAULT_SEND_WINDOW.days] });

    // UI state
    const [contactSearch, setContactSearch] = useState('');
    const [complianceAgreed, setComplianceAgreed] = useState(false);

    // Hooks
    const { profiles, isLoading: isLoadingProfiles, refresh: refreshIcpProfiles } = useIcpProfiles();
    const { mailboxes, isLoading: isLoadingMailboxes } = useMailboxes();
    const { contacts, isLoading: isLoadingContacts } = useContacts();

    useEffect(() => {
        if (profiles.length > 0 && !selectedIcpId) {
            setSelectedIcpId(profiles[0].id);
        }
        if (mailboxes.length > 0 && !selectedMailboxId) {
            const preferredMailbox = selectPreferredMailbox(mailboxes);
            setSelectedMailboxId(preferredMailbox?.id ?? '');
        }
    }, [profiles, mailboxes, selectedIcpId, selectedMailboxId]);

    const selectedContacts = useMemo(
        () => contacts.filter((contact) => selectedContactIds.includes(contact.id)),
        [contacts, selectedContactIds],
    );

    const selectedMailbox = useMemo(
        () => mailboxes.find((mailbox) => mailbox.id === selectedMailboxId),
        [mailboxes, selectedMailboxId],
    );

    const selectedIcp = useMemo(
        () => profiles.find((profile) => profile.id === selectedIcpId),
        [profiles, selectedIcpId],
    );

    const activeContactsCount = useMemo(
        () => selectedContacts.filter((contact) => contact.status === 'Active').length,
        [selectedContacts],
    );

    const inactiveContactsCount = selectedContacts.length - activeContactsCount;
    const audienceReady = selectedContacts.length > 0 && inactiveContactsCount === 0;
    const hasActiveMailbox = !!selectedMailbox && selectedMailbox.isActive;
    const waitStepsCount = sequence.filter((step) => step.type === 'WAIT').length;
    const emailStepsCount = sequence.filter((step) => step.type === 'EMAIL').length;
    const sequenceReady = sequence.length > 0 && sequence.every((step) => {
        if (isEmailStep(step)) {
            return Boolean(step.config.subject?.trim()) && Boolean(step.config.body?.trim());
        }

        if (isWaitStep(step)) {
            return step.config.days > 0;
        }

        return true;
    });
    const canContinueFromStep1 = Boolean(campaignName.trim()) && Boolean(selectedIcp);
    const canContinueFromStep2 = audienceReady;
    const canContinueFromStep3 =
        hasActiveMailbox &&
        Boolean(sendWindow.tz.trim()) &&
        Boolean(sendWindow.start) &&
        Boolean(sendWindow.end) &&
        sendWindow.days.length > 0;
    const canContinueFromStep4 = sequenceReady;
    const canContinueFromStep5 = complianceAgreed;

    const reviewIssues = [
        !campaignName.trim() ? 'Campaign name is still missing.' : null,
        !selectedIcp ? 'Pick an ICP profile before launch.' : null,
        !audienceReady ? 'Audience is not ready yet. Keep only active contacts.' : null,
        !hasActiveMailbox ? 'Choose an active sending mailbox from your workspace.' : null,
        sendWindow.days.length === 0 ? 'Choose at least one allowed sending day.' : null,
        !sequenceReady ? 'Complete every sequence step with real content before launch.' : null,
        !complianceAgreed ? 'Compliance confirmation is still pending.' : null,
    ].filter(Boolean) as string[];

    useEffect(() => {
        if (!mailboxes.length) {
            if (selectedMailboxId) {
                setSelectedMailboxId('');
            }
            return;
        }

        const mailboxStillAvailable = mailboxes.some(
            (mailbox) => mailbox.id === selectedMailboxId && mailbox.isActive,
        );

        if (!mailboxStillAvailable) {
            const fallbackMailbox = selectPreferredMailbox(mailboxes);
            setSelectedMailboxId(fallbackMailbox?.id ?? '');
        }
    }, [mailboxes, selectedMailboxId]);

    const addStep = (type: StepType) => {
        const nextOrder = sequence.length + 1;
        setSequence([...sequence, {
            id: Math.random().toString(),
            type,
            config: type === 'WAIT' ? { days: 2 } : { subject: '', body: '' },
            order: nextOrder
        }]);
    };

    const removeStep = (id: string) => {
        const filtered = sequence.filter(s => s.id !== id);
        // Normalize orders
        setSequence(filtered.map((s, i) => ({ ...s, order: i + 1 })));
    };

    const updateStepConfig = (
        id: string,
        config: Partial<EmailStepConfig> | Partial<WaitStepConfig>,
    ) => {
        setSequence((currentSequence) =>
            currentSequence.map((step) => {
                if (step.id !== id) {
                    return step;
                }

                if (isEmailStep(step)) {
                    return {
                        ...step,
                        config: {
                            ...step.config,
                            ...(config as Partial<EmailStepConfig>),
                        },
                    };
                }

                if (isWaitStep(step)) {
                    return {
                        ...step,
                        config: {
                            ...step.config,
                            ...(config as Partial<WaitStepConfig>),
                        },
                    };
                }

                return step;
            }),
        );
    };

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(contactSearch.toLowerCase())
    );

    const toggleContact = (id: string) => {
        setSelectedContactIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCreateIcpProfile = async () => {
        const profileName = newIcpProfileName.trim();

        if (!profileName) {
            toast({
                title: 'Profile name required',
                description: 'Give the ICP profile a clear name before saving it.',
                variant: 'destructive',
            });
            return;
        }

        setIsSavingIcpProfile(true);
        try {
            const createdProfile = await fetchWorkspaceJson<{ id?: string }>('/api/workspace/intelligence/icp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileName,
                    criteriaJson: { industry: 'Any', employees: 'Any' },
                    blacklistPersonasJson: {},
                    regionsJson: {},
                }),
            });

            await refreshIcpProfiles();
            if (createdProfile?.id) {
                setSelectedIcpId(createdProfile.id);
            }
            setNewIcpProfileName('');
            setIsCreatingIcpProfile(false);

            toast({
                title: 'ICP profile created',
                description: `${profileName} is now available for this campaign.`,
            });
        } catch (error) {
            console.error('ICP profile creation error:', error);
            toast({
                title: 'Could not create profile',
                description: getErrorMessage(error, 'Something went wrong while creating the ICP profile.'),
                variant: 'destructive',
            });
        } finally {
            setIsSavingIcpProfile(false);
        }
    };

    const handleLaunch = async () => {
        if (!campaignName) {
            toast({ title: "Campaign name required", variant: 'destructive' });
            return;
        }
        if (selectedContactIds.length === 0) {
            toast({ title: "No contacts selected", variant: 'destructive' });
            return;
        }
        if (!selectedMailboxId) {
            toast({ title: "Please select a mailbox", variant: 'destructive' });
            return;
        }
        if (!hasActiveMailbox) {
            toast({
                title: "Active mailbox required",
                description: "Choose a valid active sending mailbox before launching this campaign.",
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const newCampaign = await fetchWorkspaceJson<CreatedCampaign>('/api/workspace/engagement/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: campaignName,
                    objective,
                    status: 'DRAFT',
                    mailboxId: selectedMailboxId,
                    sendWindowJson: sendWindow,
                    sequenceSteps: sequence.map(s => ({
                        stepType: s.type,
                        order: s.order,
                        configJson: s.config
                    }))
                }),
            });

            await fetchWorkspaceJson(`/api/workspace/engagement/campaigns/${newCampaign.id}/recipients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contactIds: selectedContactIds })
            });

            await fetchWorkspaceJson(`/api/workspace/engagement/campaigns/${newCampaign.id}/launch`, {
                method: 'POST',
            });

            toast({
                title: "Campaign launched",
                description: `${selectedContactIds.length} recipients enrolled and the sequence is now live.`,
            });
            router.push(`/dashboard/engagement/campaigns/${newCampaign.id}`);
        } catch (error) {
            console.error('Launch error:', error);
            toast({
                title: "Launch failed",
                description: getErrorMessage(error, "Something went wrong while preparing the campaign."),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Objective & ICP
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Campaign Name</Label>
                                <Input
                                    placeholder="e.g. Q1 SaaS Outreach"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>What is your primary goal?</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['Book meetings', 'Generate interest', 'Nurture leads'].map((obj) => (
                                        <div
                                            key={obj}
                                            onClick={() => setObjective(obj)}
                                            className={`p-4 border rounded-none cursor-pointer transition-all ${objective === obj ? 'border-tangerine bg-tangerine/5 ring-1 ring-tangerine' : 'hover:bg-muted'}`}
                                        >
                                            <p className="text-sm font-medium">{obj}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>Target ICP Profile</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsCreatingIcpProfile((current) => !current)}
                                        disabled={isSavingIcpProfile}
                                    >
                                        {isCreatingIcpProfile ? 'Hide create form' : 'Create new profile'}
                                    </Button>
                                </div>
                                {profiles.length > 0 ? (
                                    <select
                                        className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={selectedIcpId}
                                        onChange={(e) => setSelectedIcpId(e.target.value)}
                                    >
                                        {isLoadingProfiles ? (
                                            <option>Loading profiles...</option>
                                        ) : (
                                            profiles.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))
                                        )}
                                    </select>
                                ) : (
                                    <Card className="rounded-none border border-dashed">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">No ICP profiles yet</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Create one now so this campaign can target a real audience instead of a placeholder profile.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                {isCreatingIcpProfile ? (
                                    <Card className="rounded-none border border-dashed">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="new-icp-profile-name">New ICP profile name</Label>
                                                <Input
                                                    id="new-icp-profile-name"
                                                    placeholder="e.g. B2B SaaS - VP Engineering"
                                                    value={newIcpProfileName}
                                                    onChange={(e) => setNewIcpProfileName(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsCreatingIcpProfile(false);
                                                        setNewIcpProfileName('');
                                                    }}
                                                    disabled={isSavingIcpProfile}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={handleCreateIcpProfile}
                                                    disabled={isSavingIcpProfile || !newIcpProfileName.trim()}
                                                >
                                                    {isSavingIcpProfile ? 'Creating…' : 'Save profile'}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                );
            case 2: // Audience & Data
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label>Select Contacts</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Filter contacts..."
                                        value={contactSearch}
                                        onChange={(e) => setContactSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-[300px] overflow-y-auto border rounded-none bg-background">
                                    {isLoadingContacts ? (
                                        <div className="p-4 text-center"><Loader className="h-4 w-4 animate-spin mx-auto" /></div>
                                    ) : contacts.length === 0 ? (
                                        <div className="p-6 text-center space-y-2">
                                            <p className="text-sm font-medium">No contacts are available yet</p>
                                            <p className="text-xs text-muted-foreground">
                                                Create real contacts in CRM first so this campaign can be targeted to a real audience.
                                            </p>
                                        </div>
                                    ) : filteredContacts.length === 0 ? (
                                        <div className="p-6 text-center space-y-2">
                                            <p className="text-sm font-medium">No contacts match this search</p>
                                            <p className="text-xs text-muted-foreground">
                                                Try another name, company, or email to find the right recipients.
                                            </p>
                                        </div>
                                    ) : (
                                        filteredContacts.map(contact => (
                                            <div
                                                key={contact.id}
                                                className={`flex items-start space-x-3 p-3 border-b last:border-0 transition-colors ${
                                                    selectedContactIds.includes(contact.id) ? 'bg-tangerine/5' : 'hover:bg-muted/30'
                                                }`}
                                            >
                                                <Checkbox
                                                    id={`contact-${contact.id}`}
                                                    checked={selectedContactIds.includes(contact.id)}
                                                    onCheckedChange={() => toggleContact(contact.id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{contact.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <Badge variant={contact.status === 'Active' ? 'success' : 'secondary'} className="text-[10px]">
                                                            {contact.status}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {contact.company || 'No company linked'}
                                                        </Badge>
                                                        {contact.location ? (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {contact.location}
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <Card className="bg-muted/30">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium">Audience Summary</p>
                                        <Badge variant="outline">{selectedContactIds.length} Selected</Badge>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Active contacts</span>
                                            <span className="font-medium">{activeContactsCount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Inactive / opted-out</span>
                                            <span className="font-medium">{inactiveContactsCount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Audience readiness</span>
                                            <span className={audienceReady ? 'font-medium text-success' : 'font-medium text-warning'}>
                                                {audienceReady ? 'Ready to enroll' : 'Needs attention'}
                                            </span>
                                        </div>
                                        {!audienceReady && (
                                            <p className="text-xs text-muted-foreground">
                                                Select at least one active contact before launching the campaign.
                                            </p>
                                        )}
                                    </div>
                                    {selectedContacts.length > 0 ? (
                                        <div className="space-y-2 border-t pt-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Selected audience
                                            </p>
                                            <div className="space-y-2">
                                                {selectedContacts.map((contact) => (
                                                    <div key={contact.id} className="flex items-center justify-between gap-3 text-xs">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-foreground">{contact.name}</p>
                                                            <p className="truncate text-muted-foreground">{contact.email}</p>
                                                        </div>
                                                        <Badge variant={contact.status === 'Active' ? 'success' : 'secondary'} className="shrink-0 text-[10px]">
                                                            {contact.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                );
            case 3: // Sending Infrastructure
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="space-y-4">
                            <Label>Select Sending Identity</Label>
                            {isLoadingMailboxes ? (
                                <div className="flex justify-center p-10"><Loader className="h-8 w-8 animate-spin text-tangerine" /></div>
                            ) : mailboxes.length === 0 ? (
                                <Card className="border-warning/40 bg-warning/5">
                                    <CardContent className="p-4 space-y-2">
                                        <p className="text-sm font-medium">No sending mailboxes are available yet</p>
                                        <p className="text-xs text-muted-foreground">
                                            Complete deliverability setup first so this campaign can launch with a real mailbox.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                mailboxes.map((mb) => (
                                    <Card
                                        key={mb.id}
                                        className={`hover:border-tangerine cursor-pointer transition-all border-l-4 ${selectedMailboxId === mb.id ? 'border-tangerine ring-1 ring-tangerine' : 'border-l-success'}`}
                                        onClick={() => setSelectedMailboxId(mb.id)}
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-none bg-tangerine/10 flex items-center justify-center">
                                                    <Globe className="h-5 w-5 text-tangerine" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{mb.email}</p>
                                                    <div className="flex space-x-2 mt-1">
                                                        <Badge variant="outline" className="text-[10px] py-0">Provider: {mb.provider ?? 'Custom'}</Badge>
                                                        <Badge variant="outline" className="text-[10px] py-0">Score: {mb.domain?.lastAuditScore || '—'}/10</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={mb.isActive ? 'success' : 'secondary'}>{mb.isActive ? 'Healthy' : 'Inactive'}</Badge>
                                                <p className="text-[11px] text-muted-foreground mt-1">Limit: {mb.dailyLimit ?? '—'}/day</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Sending window</CardTitle>
                                <CardDescription>
                                    Choose when this sequence is allowed to send follow-ups.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="send-window-tz">Timezone</Label>
                                        <Input
                                            id="send-window-tz"
                                            value={sendWindow.tz}
                                            onChange={(e) => setSendWindow((current) => ({ ...current, tz: e.target.value }))}
                                            placeholder="Europe/Warsaw"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="send-window-start">Start</Label>
                                        <Input
                                            id="send-window-start"
                                            type="time"
                                            value={sendWindow.start}
                                            onChange={(e) => setSendWindow((current) => ({ ...current, start: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="send-window-end">End</Label>
                                        <Input
                                            id="send-window-end"
                                            type="time"
                                            value={sendWindow.end}
                                            onChange={(e) => setSendWindow((current) => ({ ...current, end: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Allowed days</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {SEND_WINDOW_DAY_OPTIONS.map((day) => {
                                            const isSelected = sendWindow.days.includes(day.value);

                                            return (
                                                <Button
                                                    key={day.value}
                                                    type="button"
                                                    variant={isSelected ? 'default' : 'outline'}
                                                    className={isSelected ? 'bg-tangerine text-white hover:bg-tangerine/90' : ''}
                                                    onClick={() =>
                                                        setSendWindow((current) => ({
                                                            ...current,
                                                            days: toggleSendWindowDay(current.days, day.value),
                                                        }))
                                                    }
                                                >
                                                    {day.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Current policy: {formatSendWindow(sendWindow)}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            case 4: // Sequence & Content
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Design Campaign Sequence</h3>
                            <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => addStep('WAIT')}><Clock className="mr-2 h-4 w-4" /> Add Wait</Button>
                                <Button size="sm" variant="outline" onClick={() => addStep('EMAIL')}><Mail className="mr-2 h-4 w-4" /> Add Email</Button>
                            </div>
                        </div>
                        <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:h-[calc(100%-32px)] before:w-0.5 before:bg-muted">
                            {sequence.map((step, idx) => (
                                <div key={step.id} className="relative pl-12">
                                    <div className="absolute left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-none bg-background border-2 border-tangerine text-[10px] font-bold text-tangerine">
                                        {idx + 1}
                                    </div>
                                    <Card className="group relative">
                                        <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                                            <div className="flex items-center space-x-2">
                                                {step.type === 'EMAIL' ? <Mail className="h-4 w-4 text-tangerine" /> : <Clock className="h-4 w-4 text-orange-500" />}
                                                <CardTitle className="text-sm font-medium">{step.type === 'EMAIL' ? 'Email outreach' : 'Wait Period'}</CardTitle>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeStep(step.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="pb-4">
                                            {isEmailStep(step) ? (
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder="Subject"
                                                        value={step.config.subject}
                                                        onChange={(e) => updateStepConfig(step.id, { subject: e.target.value })}
                                                        className="text-sm font-medium"
                                                    />
                                                    <textarea
                                                        className="w-full min-h-[100px] p-3 text-sm rounded-none border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tangerine/50"
                                                        placeholder="Write your email content... Use {{firstName}} for variables."
                                                        value={step.config.body || ''}
                                                        onChange={(e) => updateStepConfig(step.id, { body: e.target.value })}
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="sm" className="h-7 text-[10px]">Templates</Button>
                                                            <Button variant="outline" size="sm" className="h-7 text-[10px]">Spam Check</Button>
                                                        </div>
                                                        <Badge variant="success" className="text-[10px]">Risk: Low</Badge>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm">Wait for</span>
                                                    <Input
                                                        type="number"
                                                        value={isWaitStep(step) ? step.config.days : 2}
                                                        onChange={(e) =>
                                                            updateStepConfig(step.id, { days: parseInt(e.target.value, 10) || 1 })
                                                        }
                                                        className="w-16 h-8 text-sm"
                                                    />
                                                    <span className="text-sm">days before next step</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 5: // Compliance & Safety
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <AlertCircle className="h-10 w-10 text-tangerine mx-auto" />
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium">Compliance Review</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                We&apos;ve analyzed your recipient list geography and adjusted settings for maximal safety.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="border-l-4 border-l-tangerine">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Audience Geo</p>
                                    <p className="font-medium text-sm">GDPR Region Analysis</p>
                                    <div className="mt-2 text-[10px] text-warning flex items-center">
                                        <ShieldAlert className="h-3 w-3 mr-1" /> EU safety rules applied
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Unsubscribe Link</p>
                                    <p className="font-medium text-sm">Included (Mandatory)</p>
                                    <div className="mt-2 text-[10px] text-success flex items-center">
                                        <ShieldCheck className="h-3 w-3 mr-1" /> Compliant
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-3 bg-muted/30 p-4 rounded-none">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="gdpr-basis" checked={complianceAgreed} onCheckedChange={(val) => setComplianceAgreed(!!val)} />
                                <Label htmlFor="gdpr-basis" className="text-sm leading-none cursor-pointer">
                                    I confirm I have a valid legal basis (Legitimate Interest) for this outreach.
                                </Label>
                            </div>
                        </div>
                        {!complianceAgreed ? (
                            <p className="text-xs text-center text-muted-foreground">
                                Confirm the legal basis now so this campaign is fully ready on the launch step.
                            </p>
                        ) : null}
                    </motion.div>
                );
            case 6: // Review & Launch
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-block p-3 rounded-none bg-success/10 text-success mb-2">
                                <Rocket className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">Ready to launch?</h3>
                            <p className="text-sm text-muted-foreground">Review the real audience, sender, and sequence before turning this campaign live.</p>
                        </div>

                        <div className="grid gap-3">
                            <Card className="p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Campaign Name</span>
                                    <span className="text-sm font-medium">{campaignName || 'Unnamed'}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Objective</span>
                                    <span className="text-sm font-medium">{objective}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">ICP Profile</span>
                                    <span className="text-sm font-medium">{selectedIcp?.name || 'Not selected'}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Recipients</span>
                                    <span className="text-sm font-medium">{selectedContactIds.length} leads</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Audience readiness</span>
                                    <span className={`text-sm font-medium ${audienceReady ? 'text-success' : 'text-warning'}`}>
                                        {audienceReady ? 'Ready' : 'Needs review'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Sending mailbox</span>
                                    <span className="text-sm font-medium">{selectedMailbox?.email || 'Not selected'}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Send window</span>
                                    <span className="text-sm font-medium">{formatSendWindow(sendWindow)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Mailbox status</span>
                                    <span className={`text-sm font-medium ${hasActiveMailbox ? 'text-success' : 'text-warning'}`}>
                                        {hasActiveMailbox ? 'Active and ready' : 'Needs deliverability setup'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Steps</span>
                                    <span className="text-sm font-medium">{sequence.length} steps</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Email / wait steps</span>
                                    <span className="text-sm font-medium">{emailStepsCount} email · {waitStepsCount} wait</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Compliance confirmation</span>
                                    <span className={`text-sm font-medium ${complianceAgreed ? 'text-success' : 'text-warning'}`}>
                                        {complianceAgreed ? 'Confirmed' : 'Pending'}
                                    </span>
                                </div>
                            </Card>
                        </div>
                        {reviewIssues.length > 0 ? (
                            <Card className="border-warning/40 bg-warning/5">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-warning" />
                                        <p className="text-sm font-medium">Still needs attention before launch</p>
                                    </div>
                                    <ul className="space-y-2 text-xs text-muted-foreground">
                                        {reviewIssues.map((issue) => (
                                            <li key={issue} className="flex items-start gap-2">
                                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                                                <span>{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-success/40 bg-success/5">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-success shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Launch checklist complete</p>
                                        <p className="text-xs text-muted-foreground">
                                            This campaign already has a real audience, an active mailbox, a valid send window, and completed sequence content.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="max-w-4xl mx-auto shadow-2xl border-none overflow-hidden bg-background/50 backdrop-blur-xl">
            <CardHeader className="border-b bg-muted/30 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-tangerine/10 rounded-none">
                                <Target className="h-5 w-5 text-tangerine" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">New Outreach Campaign</CardTitle>
                                <CardDescription>Step {currentStep} of 6: {WIZARD_STEPS[currentStep - 1].title}</CardDescription>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1.5 p-1 bg-muted rounded-none">
                        {WIZARD_STEPS.map(s => (
                            <div
                                key={s.id}
                                className={`h-2.5 w-8 rounded-none transition-all duration-300 ${currentStep === s.id ? 'bg-tangerine w-12' : currentStep > s.id ? 'bg-tangerine/40' : 'bg-muted-foreground/20'}`}
                            />
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8 min-h-[450px]">
                {renderStepContent()}
            </CardContent>
            <CardFooter className="border-t bg-muted/30 py-6 flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1 || isSubmitting}
                    className="px-8"
                >
                    Back
                </Button>
                <div className="flex gap-3">
                    {currentStep < 6 ? (
                        <Button
                            disabled={
                                (currentStep === 1 && !canContinueFromStep1) ||
                                (currentStep === 2 && !canContinueFromStep2) ||
                                (currentStep === 3 && !canContinueFromStep3) ||
                                (currentStep === 4 && !canContinueFromStep4) ||
                                (currentStep === 5 && !canContinueFromStep5)
                            }
                            className="px-8 shadow-lg shadow-tangerine/20 bg-tangerine hover:bg-tangerine/90 text-white"
                            onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                        >
                            Continue
                        </Button>
                    ) : (
                        <Button
                            disabled={!complianceAgreed || isSubmitting || !audienceReady || !hasActiveMailbox}
                            className={`px-8 bg-tangerine shadow-lg shadow-tangerine/30 hover:bg-tangerine/90 text-white ${(!complianceAgreed || isSubmitting || !audienceReady || !hasActiveMailbox) ? 'opacity-50' : 'hover:scale-105 transition-transform'}`}
                            onClick={handleLaunch}
                        >
                            {isSubmitting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="mr-2 h-4 w-4" />}
                            Launch Campaign
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
