'use client';

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
    CardHeader,
    CardTitle,
    CardDescription,
    useToast
} from '@ori-os/ui';
import { Mail, Users, Send, MessageSquare, BarChart3, Clock, Edit2, Plus } from 'lucide-react';

interface SequenceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sequence: any;
}

export function SequenceDetailsModal({ isOpen, onClose, sequence }: SequenceDetailsModalProps) {
    const { toast } = useToast();
    if (!sequence) return null;

    const stats = [
        { label: 'Enrolled', value: sequence.contacts, icon: Users, color: 'text-blue-500' },
        { label: 'Sent', value: sequence.sent, icon: Send, color: 'text-purple-500' },
        { label: 'Opened', value: sequence.opened, icon: Mail, color: 'text-green-500' },
        { label: 'Replied', value: sequence.replied, icon: MessageSquare, color: 'text-tangerine' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between pr-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-none bg-tangerine/10 text-tangerine">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-xl font-bold">{sequence.name}</DialogTitle>
                        </div>
                        <Badge variant={sequence.status === 'Active' ? 'success' : 'secondary'}>
                            {sequence.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="overview" className="w-full">
                    <div className="px-6 border-b border-border">
                        <TabsList className="bg-transparent h-12 p-0 gap-6">
                            <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-tangerine data-[state=active]:bg-transparent rounded-none h-full px-1 shadow-none font-semibold">Overview</TabsTrigger>
                            <TabsTrigger value="steps" className="border-b-2 border-transparent data-[state=active]:border-tangerine data-[state=active]:bg-transparent rounded-none h-full px-1 shadow-none font-semibold">Steps</TabsTrigger>
                            <TabsTrigger value="contacts" className="border-b-2 border-transparent data-[state=active]:border-tangerine data-[state=active]:bg-transparent rounded-none h-full px-1 shadow-none font-semibold">Contacts</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="max-h-[500px] p-6">
                        <TabsContent value="overview" className="mt-0 space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="p-4 rounded-none border border-border bg-muted/20">
                                        <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                                            <stat.icon className={`h-3 w-3 ${stat.color}`} />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">{stat.label}</span>
                                        </div>
                                        <div className="text-xl font-bold">{stat.value.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Activity Feed placeholder */}
                            <div>
                                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Recent Activity
                                </h4>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-3 text-sm p-3 rounded-none border border-border/50">
                                            <div className="w-1.5 h-1.5 rounded-none bg-tangerine mt-1.5" />
                                            <div>
                                                <p className="text-foreground"><span className="font-semibold">Email sent</span> to Jennifer Smith</p>
                                                <p className="text-[10px] text-muted-foreground uppercase mt-0.5">2 hours ago</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="steps" className="mt-0">
                            <div className="space-y-4">
                                {[
                                    { step: 1, type: 'Email', name: 'Introduction', delay: 'Instant' },
                                    { step: 2, type: 'Email', name: 'Follow-up', delay: '2 days' },
                                    { step: 3, type: 'LinkedIn', name: 'Connection Request', delay: '1 day' },
                                ].map((step) => (
                                    <div key={step.step} className="p-4 rounded-none border border-border flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-none bg-muted flex items-center justify-center font-bold text-sm">
                                                {step.step}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">{step.name}</div>
                                                <div className="text-xs text-muted-foreground">{step.type} • {step.delay} delay</div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => toast({ title: "Edit Step", description: "Step editor simulated." })}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed"
                                    onClick={() => toast({ title: "Add Step", description: "Opening step builder..." })}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Step
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="contacts" className="mt-0">
                            <div className="text-center py-12 text-muted-foreground italic">
                                List of enrolled contacts will appear here.
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <div className="p-4 border-t border-border bg-muted/20">
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button
                            variant="accent"
                            onClick={() => toast({ title: "Enroll contacts", description: "Opening contact selector..." })}
                        >
                            Enroll Contacts
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
