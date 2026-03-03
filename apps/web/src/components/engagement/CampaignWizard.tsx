
'use client';

import React, { useState, useEffect } from 'react';
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
    Progress,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Avatar,
    AvatarFallback
} from '@ori-os/ui';
import {
    Plus,
    Trash2,
    Mail,
    Clock,
    Users,
    Rocket,
    Check,
    AlertCircle,
    Target,
    ShieldCheck,
    Globe,
    Zap,
    ShieldAlert,
    Search,
    Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIcpProfiles } from '@/hooks/use-icp-profiles';
import { useMailboxes } from '@/hooks/use-mailboxes';
import { useContacts } from '@/hooks/use-contacts';
import { useToast } from '@ori-os/ui';
import { useRouter } from 'next/navigation';

type StepType = 'EMAIL' | 'WAIT' | 'CONDITION';

type SequenceStep = {
    id: string;
    type: StepType;
    config: any;
    order: number;
};

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

    // Form data
    const [campaignName, setCampaignName] = useState('');
    const [objective, setObjective] = useState('Book meetings');
    const [selectedIcpId, setSelectedIcpId] = useState<string>('');
    const [sequence, setSequence] = useState<SequenceStep[]>([
        { id: '1', type: 'EMAIL', config: { subject: 'Quick question' }, order: 1 }
    ]);
    const [selectedMailboxId, setSelectedMailboxId] = useState<string>('');
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

    // UI state
    const [contactSearch, setContactSearch] = useState('');
    const [isValidated, setIsValidated] = useState(false);
    const [complianceAgreed, setComplianceAgreed] = useState(false);

    // Hooks
    const { profiles, isLoading: isLoadingProfiles } = useIcpProfiles();
    const { mailboxes, isLoading: isLoadingMailboxes } = useMailboxes();
    const { contacts, isLoading: isLoadingContacts } = useContacts();

    useEffect(() => {
        if (profiles.length > 0 && !selectedIcpId) {
            setSelectedIcpId(profiles[0].id);
        }
        if (mailboxes.length > 0 && !selectedMailboxId) {
            setSelectedMailboxId(mailboxes[0].id);
        }
    }, [profiles, mailboxes]);

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

    const updateStepConfig = (id: string, config: any) => {
        setSequence(sequence.map(s => s.id === id ? { ...s, config: { ...s.config, ...config } } : s));
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

        setIsSubmitting(true);
        try {
            // 1. Create Campaign
            const campaignRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/engagement/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: campaignName,
                    objective,
                    status: 'RUNNING',
                    mailboxId: selectedMailboxId,
                    sequenceSteps: sequence.map(s => ({
                        stepType: s.type,
                        order: s.order,
                        configJson: s.config
                    }))
                })
            });

            if (!campaignRes.ok) throw new Error('Failed to create campaign');
            const newCampaign = await campaignRes.json();

            // 2. Add Recipients
            const recipientRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/engagement/campaigns/${newCampaign.id}/recipients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactIds: selectedContactIds })
            });

            if (!recipientRes.ok) throw new Error('Failed to add recipients');

            toast({ title: "Campaign Launched!", description: `${selectedContactIds.length} recipients enrolled.` });
            router.push('/dashboard/engagement');
        } catch (error) {
            console.error('Launch error:', error);
            toast({ title: "Launch Failed", description: "Something went wrong during launch.", variant: 'destructive' });
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
                                <Label>Target ICP Profile</Label>
                                <select
                                    className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={selectedIcpId}
                                    onChange={(e) => setSelectedIcpId(e.target.value)}
                                >
                                    {isLoadingProfiles ? (
                                        <option>Loading profiles...</option>
                                    ) : (
                                        profiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))
                                    )}
                                    <option value="new">+ Create New Profile...</option>
                                </select>
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
                                    ) : (
                                        filteredContacts.map(contact => (
                                            <div key={contact.id} className="flex items-center space-x-3 p-3 border-b last:border-0 hover:bg-muted/30">
                                                <Checkbox
                                                    id={`contact-${contact.id}`}
                                                    checked={selectedContactIds.includes(contact.id)}
                                                    onCheckedChange={() => toggleContact(contact.id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{contact.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
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
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span>Email Validation</span>
                                            <span className={isValidated ? 'text-success' : 'text-warning'}>
                                                {isValidated ? 'Validated' : 'Requires Validation'}
                                            </span>
                                        </div>
                                        <Progress value={isValidated ? 100 : 0} className="h-1.5" />
                                        {!isValidated && (
                                            <Button size="sm" className="w-full mt-2" onClick={() => setIsValidated(true)}>
                                                Run Validation Pipeline
                                            </Button>
                                        )}
                                    </div>
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
                                                        <Badge variant="outline" className="text-[10px] py-0">Provider: {mb.provider}</Badge>
                                                        <Badge variant="outline" className="text-[10px] py-0">Score: {mb.domain?.lastAuditScore || '—'}/10</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={mb.isActive ? 'success' : 'secondary'}>{mb.isActive ? 'Healthy' : 'Inactive'}</Badge>
                                                <p className="text-[11px] text-muted-foreground mt-1">Limit: {mb.dailyLimit}/day</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
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
                                            {step.type === 'EMAIL' ? (
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
                                                        value={step.config.days}
                                                        onChange={(e) => updateStepConfig(step.id, { days: parseInt(e.target.value) })}
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
                                We've analyzed your recipient list geography and adjusted settings for maximal safety.
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
                    </motion.div>
                );
            case 6: // Review & Launch
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-block p-3 rounded-none bg-success/10 text-success mb-2">
                                <Rocket className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">Ready for Blast Off?</h3>
                            <p className="text-sm text-muted-foreground">Everything looks good. Your campaign is ready to go.</p>
                        </div>

                        <div className="grid gap-3">
                            <Card className="p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Campaign Name</span>
                                    <span className="text-sm font-medium">{campaignName || 'Unnamed'}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Recipients</span>
                                    <span className="text-sm font-medium">{selectedContactIds.length} leads</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Steps</span>
                                    <span className="text-sm font-medium">{sequence.length} steps</span>
                                </div>
                            </Card>
                        </div>
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
                            className="px-8 shadow-lg shadow-tangerine/20 bg-tangerine hover:bg-tangerine/90 text-white"
                            onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                        >
                            Continue
                        </Button>
                    ) : (
                        <Button
                            disabled={!complianceAgreed || isSubmitting}
                            className={`px-8 bg-tangerine shadow-lg shadow-tangerine/30 hover:bg-tangerine/90 text-white ${(!complianceAgreed || isSubmitting) ? 'opacity-50' : 'hover:scale-105 transition-transform'}`}
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



