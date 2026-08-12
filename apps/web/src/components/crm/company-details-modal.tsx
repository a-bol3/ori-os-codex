'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Badge,
    Avatar,
    AvatarFallback,
    Input,
    Textarea,
} from '@ori-os/ui';
import { Globe, Users, Building2, MapPin, Calendar, Info, Loader2, NotebookPen, ListTodo } from 'lucide-react';
import { useToast } from '@ori-os/ui';
import { useCrmRecordDetails } from '@/hooks/use-crm-record-details';

interface CompanyDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: any;
}

export function CompanyDetailsModal({ isOpen, onClose, company }: CompanyDetailsModalProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { detail, isLoading, error, createTask, createNote, updateTask } = useCrmRecordDetails('companies', company?.id);
    const [taskTitle, setTaskTitle] = useState('');
    const [noteBody, setNoteBody] = useState('');

    if (!company) return null;

    const companyRecord = (detail ?? company) as Record<string, any>;
    const tasks = detail?.tasks ?? [];
    const notes = (detail?.activities ?? []).filter(isHumanNote);
    const recentActivity = (detail?.activities ?? []).filter((activity) => !isHumanNote(activity)).slice(0, 8);
    const auditLogs = detail?.auditLogs ?? [];
    const linkedContacts = Array.isArray(detail?.contacts) ? detail.contacts as Array<{ id: string; firstName?: string; lastName?: string; email?: string }> : [];
    const linkedDeals = Array.isArray(detail?.deals) ? detail.deals as Array<{ id: string; name: string; valueAmount?: number | null; stage?: { name?: string | null } | string | null }> : [];
    const companyDomain = companyRecord.domain || company.domain;
    const companyWebsite = companyRecord.website || (companyDomain ? `https://${companyDomain}` : undefined);
    const companySize = companyRecord.sizeBand || companyRecord.size || company.size || 'N/A';
    const companyLocation = [companyRecord.city, companyRecord.country].filter(Boolean).join(', ') || company.location || 'N/A';
    const referenceScenario = readReferenceScenario(companyRecord);
    const companyDescription = companyRecord.description || getScenarioDescription(referenceScenario) || 'No description available.';
    const companyStatus = company.status || companyRecord.status || (referenceScenario ? 'Prospect' : 'Lead');

    const handleCreateTask = async () => {
        if (!taskTitle.trim()) return;
        try {
            await createTask({ title: taskTitle.trim(), companyId: company.id });
            setTaskTitle('');
            toast({ title: 'Task created', description: 'The task was linked to this company.' });
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not create task.', variant: 'destructive' });
        }
    };

    const handleCreateNote = async () => {
        if (!noteBody.trim()) return;
        try {
            await createNote({
                subject: `Note added for ${company.name}`,
                body: noteBody.trim(),
                companyId: company.id,
            });
            setNoteBody('');
            toast({ title: 'Note added', description: 'The note was saved for this company.' });
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not add note.', variant: 'destructive' });
        }
    };

    const handleToggleTask = async (taskId: string, currentStatus: 'pending' | 'completed') => {
        try {
            const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
            await updateTask(taskId, { status: nextStatus });
            toast({
                title: nextStatus === 'completed' ? 'Task completed' : 'Task reopened',
                description: 'The company task status was updated.',
            });
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not update task.', variant: 'destructive' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!top-[4vh] !translate-y-0 flex !h-[92vh] w-[96vw] max-w-[960px] flex-col overflow-hidden p-0 sm:w-full">
                <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
                    <DialogTitle>Company Details</DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
                    <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-none">
                            <AvatarFallback className="text-xl rounded-none">
                                {company.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
                            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                                <Globe className="h-4 w-4" />
                                {companyWebsite ? (
                                    <a href={companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-tangerine transition-colors">
                                        {companyDomain || companyWebsite}
                                    </a>
                                ) : (
                                    <span>No website linked</span>
                                )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Badge className="mt-0" variant={companyStatus === 'Customer' ? 'success' : companyStatus === 'Prospect' ? 'warning' : 'secondary'}>
                                    {companyStatus}
                                </Badge>
                                {referenceScenario && (
                                    <Badge variant="outline">
                                        Reference scenario
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailField icon={<Building2 className="h-4 w-4 text-muted-foreground" />} label="Industry" value={companyRecord.industry || company.industry || 'N/A'} />
                        <DetailField icon={<Users className="h-4 w-4 text-muted-foreground" />} label="Company Size" value={companySize} />
                        <DetailField icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="Location" value={companyLocation} />
                        <DetailField icon={<Users className="h-4 w-4 text-muted-foreground" />} label="Total Contacts" value={String(linkedContacts.length || company.contactsCount || 0)} />
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label className="text-xs text-muted-foreground uppercase">Description</Label>
                        <div className="flex gap-2 p-3 rounded-none bg-muted/50 text-sm text-foreground italic border-l-2 border-tangerine">
                            <Info className="h-4 w-4 text-tangerine shrink-0 mt-0.5" />
                            {companyDescription}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <SectionCard
                            title="Linked Contacts"
                            icon={<Users className="h-4 w-4 text-tangerine" />}
                            content={(
                                linkedContacts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No contacts are linked to this company yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {linkedContacts.map((linkedContact) => (
                                            <Button
                                                key={linkedContact.id}
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    onClose();
                                                    router.push(`/dashboard/crm/contacts?contactId=${linkedContact.id}`);
                                                }}
                                            >
                                                {`${linkedContact.firstName || ''} ${linkedContact.lastName || ''}`.trim() || linkedContact.email || 'Open contact'}
                                            </Button>
                                        ))}
                                    </div>
                                )
                            )}
                        />

                        <SectionCard
                            title="Linked Deals"
                            icon={<Building2 className="h-4 w-4 text-tangerine" />}
                            content={(
                                linkedDeals.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No deals are linked to this company yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {linkedDeals.map((linkedDeal) => (
                                            <Button
                                                key={linkedDeal.id}
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-between"
                                                onClick={() => {
                                                    onClose();
                                                    router.push(`/dashboard/crm/deals?dealId=${linkedDeal.id}`);
                                                }}
                                            >
                                                <span className="flex flex-col items-start">
                                                    <span>{linkedDeal.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {typeof linkedDeal.stage === 'string' ? linkedDeal.stage : linkedDeal.stage?.name || 'Open'}
                                                    </span>
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    ${Number(linkedDeal.valueAmount ?? 0).toLocaleString()}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                )
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionCard
                            title="Tasks"
                            icon={<ListTodo className="h-4 w-4 text-tangerine" />}
                            content={(
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Add company follow-up task" />
                                        <Button variant="accent" type="button" onClick={handleCreateTask}>Add</Button>
                                    </div>
                                    {tasks.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No tasks linked to this company yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {tasks.map((task) => (
                                                <div key={task.id} className="rounded-none border border-border p-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-sm font-medium">{task.title}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={task.status === 'completed' ? 'success' : 'secondary'}>{task.status}</Badge>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleToggleTask(task.id, task.status)}
                                                            >
                                                                {task.status === 'completed' ? 'Reopen' : 'Complete'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {task.description && <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>}
                                                    {task.dueDate && <p className="mt-1 text-xs text-muted-foreground">Due {new Date(task.dueDate).toLocaleDateString()}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        />

                        <SectionCard
                            title="Notes"
                            icon={<NotebookPen className="h-4 w-4 text-tangerine" />}
                            content={(
                                <div className="space-y-3">
                                    <Textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Write a note about this company" />
                                    <Button variant="accent" type="button" onClick={handleCreateNote}>Save Note</Button>
                                    {notes.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No notes for this company yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {notes.map((note) => (
                                                <div key={note.id} className="rounded-none border border-border p-3">
                                                    <p className="text-sm">{note.body || note.subject || 'Note'}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <SectionCard
                        title="Recent Activity"
                        icon={<Calendar className="h-4 w-4 text-tangerine" />}
                        content={(
                            recentActivity.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No system activity recorded for this company yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="rounded-none border border-border p-3">
                                            <p className="text-sm font-medium">{activity.subject || 'Activity logged'}</p>
                                            {activity.body && <p className="mt-1 text-xs text-muted-foreground">{activity.body}</p>}
                                            <p className="mt-1 text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    />

                    <SectionCard
                        title="Audit Trail"
                        icon={<Calendar className="h-4 w-4 text-tangerine" />}
                        content={(
                            auditLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No audited changes yet for this company.</p>
                            ) : (
                                <div className="space-y-2">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="rounded-none border border-border p-3">
                                            <p className="text-sm font-medium">{humanizeAction(log.action)}</p>
                                            {summarizeAuditMetadata(log.metadataJson) && (
                                                <p className="mt-1 text-xs text-muted-foreground">{summarizeAuditMetadata(log.metadataJson)}</p>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    />

                    <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Added on {new Date((detail?.createdAt as string) || company.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                        {isLoading && <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading linked CRM data...</div>}
                        {error && <div className="mt-2 text-xs text-destructive">{error}</div>}
                    </div>
                    </div>
                </div>
                <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DetailField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase">{label}</Label>
            <div className="flex items-center gap-2 text-sm text-foreground">
                {icon}
                {value}
            </div>
        </div>
    );
}

function SectionCard({ title, icon, content }: { title: string; icon: React.ReactNode; content: React.ReactNode }) {
    return (
        <div className="rounded-none border border-border p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                {icon}
                {title}
            </div>
            {content}
        </div>
    );
}

function humanizeAction(action: string) {
    return action
        .toLowerCase()
        .split('_')
        .join(' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readReferenceScenario(record: Record<string, any>) {
    return record?.customFieldsJson?.referenceScenario
        || record?.metadataJson?.referenceScenario
        || null;
}

function getScenarioDescription(referenceScenario: string | null) {
    if (referenceScenario === 'folga_recruitment_expansion') {
        return 'Recruitment CRM rollout for FOLGA focused on recruiter coordination, shared pipeline visibility, and structured follow-up before the August hiring push.';
    }

    return null;
}

function summarizeAuditMetadata(metadata: Record<string, unknown> | null | undefined) {
    if (!metadata || typeof metadata !== 'object') return '';

    if (typeof metadata['name'] === 'string') {
        return String(metadata['name']);
    }

    if (typeof metadata['title'] === 'string') {
        return String(metadata['title']);
    }

    if (Array.isArray(metadata['changedFields']) && metadata['changedFields'].length > 0) {
        return `Changed: ${(metadata['changedFields'] as unknown[]).join(', ')}`;
    }

    if (typeof metadata['stage'] === 'string') {
        return `Stage: ${String(metadata['stage'])}`;
    }

    return '';
}

function isHumanNote(activity: { type?: string; subject?: string | null; body?: string | null; metadataJson?: Record<string, unknown> | null }) {
    if (activity.type !== 'NOTE') return false;

    const metadata = activity.metadataJson;
    const source = metadata && typeof metadata === 'object' ? metadata['source'] : undefined;
    const category = metadata && typeof metadata === 'object' ? metadata['category'] : undefined;

    if (source === 'system') return false;
    if (category === 'manual_note') return true;

    const subject = activity.subject || '';
    const body = activity.body || '';

    if (subject === 'New Deal Created' || subject === 'New contact created') return false;
    if (body.includes('was added to the pipeline.')) return false;

    return true;
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`block font-medium ${className}`}>{children}</span>;
}
