
'use client';

import React, { useState } from 'react';
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
    Progress,
    Badge,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@ori-os/ui';
import {
    AlertCircle,
    CheckCircle2,
    Globe,
    Mail,
    ShieldCheck,
    Zap,
    ShieldAlert,
    ExternalLink,
    Search,
    RefreshCw,
    Server,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
    { id: 1, title: 'Add Domain', icon: Globe, description: 'Register sending domain' },
    { id: 2, title: 'Verify DNS', icon: ShieldCheck, description: 'SPF, DKIM & DMARC' },
    { id: 3, title: 'Domain Audit', icon: AlertCircle, description: 'Reputation check' },
    { id: 4, title: 'Add Mailbox', icon: Mail, description: 'Connect identities' },
    { id: 5, title: 'Warm-Up Plan', icon: Zap, description: 'Gradual ramp-up' },
];

export function DomainMailboxWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [domain, setDomain] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [dnsVerified, setDnsVerified] = useState(false);
    const [mailboxEmail, setMailboxEmail] = useState('');

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain Name</Label>
                            <Input
                                id="domain"
                                placeholder="e.g. hello.company.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />
                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-none flex items-start space-x-2">
                                <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                                <p className="text-xs text-muted-foreground">
                                    <strong>Recommendation:</strong> Use a subdomain for cold outreach to protect your main domain's reputation.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Add these TXT records to your DNS provider:</p>
                            <div className="space-y-2">
                                {[
                                    { type: 'SPF', value: 'v=spf1 include:_spf.google.com ~all' },
                                    { type: 'DMARC', value: 'v=DMARC1; p=none;' }
                                ].map((record, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded border text-[11px] group">
                                        <code className="font-mono">{record.type}: {record.value}</code>
                                        <Button variant="ghost" size="sm" className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity">Copy</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="default"
                                onClick={() => { setIsVerifying(true); setTimeout(() => { setIsVerifying(false); setDnsVerified(true); }, 1500); }}
                                disabled={isVerifying || dnsVerified}
                                className={dnsVerified ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                {isVerifying ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : dnsVerified ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
                                {isVerifying ? 'Checking...' : dnsVerified ? 'Records Verified' : 'Check DNS Records'}
                            </Button>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-4">
                        <div className="inline-block p-4 rounded-none bg-success/10 text-success mb-2">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold">Reputation Audit</h3>
                            <p className="text-sm text-muted-foreground mx-auto max-w-sm">
                                Your domain has been analyzed across 42 global blacklists.
                            </p>
                        </div>
                        <div className="bg-success/5 border border-success/20 p-6 rounded-2xl inline-block w-full">
                            <span className="text-4xl font-black text-success">9.4 / 10</span>
                            <div className="flex justify-center mt-2 space-x-2">
                                <Badge variant="outline" className="bg-white">Not Blacklisted</Badge>
                                <Badge variant="outline" className="bg-white">Healthy Volume</Badge>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="mr-2 h-4 w-4" /> View Detailed Reputation Report
                        </Button>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email Identity</Label>
                                <Input
                                    placeholder="james@hello.company.com"
                                    value={mailboxEmail}
                                    onChange={(e) => setMailboxEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Provider Connection</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="justify-start"><Server className="mr-2 h-4 w-4 text-primary" /> Google</Button>
                                    <Button variant="outline" className="justify-start"><Server className="mr-2 h-4 w-4 text-primary" /> Microsoft</Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                            <div className="flex items-center space-x-2 text-primary">
                                <Zap className="h-5 w-5" />
                                <h4 className="font-bold text-sm uppercase tracking-wider">AI Warm-Up Plan</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { week: 'Week 1', vol: '10-20/day' },
                                    { week: 'Week 2', vol: '20-40/day' },
                                    { week: 'Week 3', vol: '40-80/day' },
                                    { week: 'Week 4', vol: '100+/day' }
                                ].map((w, i) => (
                                    <div key={i} className="p-2 bg-white rounded border flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-muted-foreground">{w.week}</span>
                                        <span className="text-xs font-medium">{w.vol}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Card className="bg-muted/30">
                            <CardContent className="p-4 flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Automatic Execution</p>
                                    <p className="text-[10px] text-muted-foreground">Ori-OS will handle sending and AI replies to boost reputation.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="mx-auto w-full max-w-2xl shadow-xl bg-background/50 backdrop-blur-xl border-none">
            <CardHeader className="bg-muted/30 border-b">
                <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Setup Phase {currentStep} / {STEPS.length}</span>
                        <span>{STEPS[currentStep - 1].title}</span>
                    </div>
                    <div className="flex gap-1">
                        {STEPS.map(s => (
                            <div key={s.id} className={`h-1.5 flex-1 rounded-none transition-all duration-500 ${currentStep >= s.id ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                        {React.createElement(STEPS[currentStep - 1].icon, { className: 'h-6 w-6' })}
                    </div>
                    <div>
                        <CardTitle className="text-lg">{STEPS[currentStep - 1].title}</CardTitle>
                        <CardDescription className="text-xs">{STEPS[currentStep - 1].description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="min-h-[350px] pt-8">
                {renderStepContent()}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-muted/50 py-6 bg-muted/30">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-8"
                >
                    Back
                </Button>
                <Button
                    onClick={nextStep}
                    disabled={currentStep === 1 && !domain}
                    className="px-8 shadow-lg shadow-primary/20"
                >
                    {currentStep === STEPS.length ? 'Start Warm-Up' : 'Continue'}
                </Button>
            </CardFooter>
        </Card>
    );
}

