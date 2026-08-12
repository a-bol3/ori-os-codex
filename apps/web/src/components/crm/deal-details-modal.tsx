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
    Progress,
    Input,
    Textarea,
} from '@ori-os/ui';
import { Building2, Calendar, TrendingUp, Clock, Loader2, NotebookPen, ListTodo } from 'lucide-react';
import { useToast } from '@ori-os/ui';
import { useCrmRecordDetails } from '@/hooks/use-crm-record-details';

interface DealDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: any;
}

export function DealDetailsModal({ isOpen, onClose, deal }: DealDetailsModalProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { detail, isLoading, error, createTask, createNote, updateTask } = useCrmRecordDetails('deals', deal?.id);
    const [taskTitle, setTaskTitle] = useState('');
    const [noteBody, setNoteBody] = useState('');

    if (!deal) return null;

    const dealRecord = (detail ?? deal) as Record<string, any>;
    const tasks = detail?.tasks ?? [];
    const notes = (detail?.activities ?? []).filter(isHumanNote);
    const auditLogs = detail?.auditLogs ?? [];
    const linkedCompany = detail?.company as { id?: string; name?: string } | undefined;
    const linkedContact = detail?.contact as { id?: string; firstName?: string; lastName?: string; email?: string } | undefined;
    const stageLabel = dealRecord.stage || dealRecord.stageName || deal.stage || 'Lead';
    const dealValue = typeof deal.value === 'number'
        ? deal.value
        : typeof deal.valueAmount === 'number'
            ? deal.valueAmount
            : Number(deal.value ?? deal.valueAmount ?? 0);
    const probability = typeof deal.probability === 'number' ? deal.probability : 0;
    const closeDateValue = deal.closeDate || deal.expectedCloseDate || deal.expectedClose;
    const closeDateLabel = closeDateValue
        ? new Date(closeDateValue).toLocaleDateString()
        : 'N/A';
    const linkedContactLabel =
        `${linkedContact?.firstName || ''} ${linkedContact?.lastName || ''}`.trim()
        || linkedContact?.email
        || deal.contactName
        || deal.contactEmail
        || 'Open contact';
    const referenceScenario = readReferenceScenario(dealRecord);

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Closed Won': return 'success';
            case 'Negotiation': return 'warning';
            case 'Proposal': return 'accent';
            case 'Qualified': return 'secondary';
            default: return 'outline';
        }
    };

    const handleCreateTask = async () => {
        if (!taskTitle.trim()) return;
        try {
            await createTask({ title: taskTitle.trim(), dealId: deal.id, companyId: deal.companyId });
            setTaskTitle('');
            toast({ title: 'Task created', description: 'The task was linked to this deal.' });
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not create task.', variant: 'destructive' });
        }
    };

    const handleCreateNote = async () => {
        if (!noteBody.trim()) return;
        try {
            await createNote({
                subject: `Note added for deal ${deal.name}`,
                body: noteBody.trim(),
                dealId: deal.id,
                companyId: deal.companyId,
            });
            setNoteBody('');
            toast({ title: 'Note added', description: 'The note was saved for this deal.' });
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
                description: 'The deal task status was updated.',
            });
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Could not update task.', variant: 'destructive' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!top-[4vh] !translate-y-0 flex !h-[92vh] w-[96vw] max-w-[960px] flex-col overflow-hidden p-0 sm:w-full">
                <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
                    <DialogTitle>Deal Details</DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
                    <div className="space-y-6">
                    <div>
                        <h2 className="mb-1 text-2xl font-bold text-foreground">{deal.name}</h2>
                        <div className="flex items-center gap-2">
                            <Badge variant={getStageColor(stageLabel)}>
                                {stageLabel}
                            </Badge>
                            {referenceScenario && <Badge variant="outline">Reference scenario</Badge>}
                            <span className="text-sm text-muted-foreground">&bull;</span>
                            <span className="text-sm font-medium text-tangerine">
                                ${dealValue.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-muted-foreground">Company</Label>
                                {linkedCompany?.id ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        className="justify-start"
                                        onClick={() => {
                                            onClose();
                                            router.push(`/dashboard/crm/companies?companyId=${linkedCompany.id}`);
                                        }}
                                    >
                                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {linkedCompany.name || deal.company || 'Open company'}
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        {deal.company || 'N/A'}
                                    </div>
                                )}
                            </div>
                            <DetailField icon={<Calendar className="h-4 w-4 text-muted-foreground" />} label="Expected Close" value={closeDateLabel} />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="mb-1 flex items-center justify-between">
                                    <Label className="text-xs uppercase text-muted-foreground">Probability</Label>
                                    <span className="text-xs font-bold">{probability}%</span>
                                </div>
                                <Progress value={probability} className="h-2" />
                            </div>
                            <DetailField
                                icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                                label="Estimated Revenue"
                                value={`$${(dealValue * probability / 100).toLocaleString()}`}
                            />
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-muted-foreground">Primary Contact</Label>
                                {linkedContact?.id ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        className="justify-start"
                                        onClick={() => {
                                            onClose();
                                            router.push(`/dashboard/crm/contacts?contactId=${linkedContact.id}`);
                                        }}
                                    >
                                        {linkedContactLabel}
                                    </Button>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        {deal.contactName || deal.contactEmail || 'No contact linked'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <SectionCard
                            title="Tasks"
                            icon={<ListTodo className="h-4 w-4 text-tangerine" />}
                            content={(
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Add deal follow-up task" />
                                        <Button variant="accent" type="button" onClick={handleCreateTask}>Add</Button>
                                    </div>
                                    {tasks.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No tasks linked to this deal yet.</p>
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
                                    <Textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Write a note about this deal" />
                                    <Button variant="accent" type="button" onClick={handleCreateNote}>Save Note</Button>
                                    {notes.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No notes for this deal yet.</p>
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

                    <div className="rounded-none border border-border bg-muted/30 p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <Clock className="h-4 w-4 text-tangerine" />
                            Deal Activity
                        </h3>
                        <div className="space-y-3">
                            {(detail?.activities ?? []).slice(0, 8).map((activity) => (
                                <div key={activity.id} className="flex gap-3 text-xs">
                                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-none bg-tangerine" />
                                    <div>
                                        <p className="font-medium">{activity.subject || 'Activity logged'}</p>
                                        {activity.body && <p className="mt-1 text-muted-foreground">{activity.body}</p>}
                                        <p className="text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <SectionCard
                        title="Audit Trail"
                        icon={<Calendar className="h-4 w-4 text-tangerine" />}
                        content={(
                            auditLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No audited changes yet for this deal.</p>
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

                    <div className="pt-2">
                        {isLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading linked CRM data...</div>}
                        {error && <div className="text-xs text-destructive">{error}</div>}
                    </div>
                    </div>
                </div>
                <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button
                        variant="accent"
                        onClick={() => {
                            onClose();
                            router.push('/dashboard/crm/deals');
                        }}
                    >
                        Go to Pipeline
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DetailField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">{label}</Label>
            <div className="flex items-center gap-2 text-sm font-medium">
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

function readReferenceScenario(dealRecord: Record<string, any>) {
    return dealRecord?.customFieldsJson?.referenceScenario || null;
}

function summarizeAuditMetadata(metadata: Record<string, unknown> | null | undefined) {
    if (!metadata || typeof metadata !== 'object') return '';

    if (typeof metadata['name'] === 'string') {
        return String(metadata['name']);
    }

    if (typeof metadata['title'] === 'string') {
        return String(metadata['title']);
    }

    if (typeof metadata['stage'] === 'string') {
        return `Stage: ${String(metadata['stage'])}`;
    }

    if (Array.isArray(metadata['changedFields']) && metadata['changedFields'].length > 0) {
        return `Changed: ${(metadata['changedFields'] as unknown[]).join(', ')}`;
    }

    if (typeof metadata['valueAmount'] === 'number') {
        return `Value: $${Number(metadata['valueAmount']).toLocaleString()}`;
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
