'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Textarea,
} from '@ori-os/ui';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    Loader2,
    Plus,
    RefreshCw,
    ShieldAlert,
    XCircle,
} from 'lucide-react';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

type Severity = 'low' | 'medium' | 'high' | 'critical';
type Status = 'pending' | 'in_progress' | 'blocked' | 'resolved' | 'cancelled';

interface Incident {
    id: string;
    title: string;
    description?: string | null;
    status: Status;
    severity: Severity;
    lastActivityAt: string;
}

interface OperationsTask {
    id: string;
    title: string;
    priority: Severity;
    status: string;
    dueDate?: string | null;
}

interface Commitment {
    id: string;
    title: string;
    dueAt: string;
    status: Status;
}

interface RiskSignal {
    id: string;
    title: string;
    description?: string | null;
    severity: Severity;
    detectedAt: string;
}

interface OperationsSummary {
    generatedAt: string;
    incidents: Incident[];
    urgentTasks: OperationsTask[];
    commitments: Commitment[];
    alerts: RiskSignal[];
    pendingApprovals: number;
    workload: {
        score: number;
        level: Severity;
        workedMinutes: number;
        outsideHoursMinutes: number;
        travelMinutes: number;
        overdueCommitments: number;
    };
}

interface ApprovalRequest {
    id: string;
    actionType: string;
    summary: string;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    expiresAt?: string | null;
    createdAt: string;
}

type QuickCreateKind = 'incident' | 'task' | 'commitment';

const operationsEnabled =
    process.env.NEXT_PUBLIC_ENABLE_OPERATIONS_CORE === 'true';

const badgeVariant = (severity: Severity) => {
    if (severity === 'critical') return 'destructive' as const;
    if (severity === 'high') return 'warning' as const;
    if (severity === 'low') return 'secondary' as const;
    return 'outline' as const;
};

const dateTime = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(value))
        : 'No deadline';

export default function OperationsCenterPage() {
    const [summary, setSummary] = useState<OperationsSummary | null>(null);
    const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(operationsEnabled);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [quickCreate, setQuickCreate] = useState<QuickCreateKind | null>(null);
    const [panicOpen, setPanicOpen] = useState(false);

    const loadSummary = useCallback(async () => {
        if (!operationsEnabled) return;
        setLoading(true);
        setError(null);
        try {
            const [summaryResponse, approvalsResponse] = await Promise.all([
                apiFetch('/operations/summary'),
                apiFetch('/operations/approvals?status=pending&limit=25'),
            ]);
            setSummary((await summaryResponse.json()) as OperationsSummary);
            setApprovals((await approvalsResponse.json()) as ApprovalRequest[]);
        } catch (loadError) {
            setError(getErrorMessage(loadError, 'Could not load Operations Core.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSummary();
    }, [loadSummary]);

    async function submitQuickCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!quickCreate) return;
        const form = new FormData(event.currentTarget);
        const title = String(form.get('title') ?? '').trim();
        const description = String(form.get('description') ?? '').trim();
        const dueAt = String(form.get('dueAt') ?? '');
        const severity = String(form.get('severity') ?? 'medium');
        const path =
            quickCreate === 'incident'
                ? '/operations/incidents'
                : quickCreate === 'task'
                  ? '/operations/tasks'
                  : '/operations/commitments';
        const body =
            quickCreate === 'incident'
                ? { title, description, severity, idempotencyKey: crypto.randomUUID() }
                : quickCreate === 'task'
                  ? {
                        title,
                        description,
                        priority: severity,
                        dueDate: dueAt ? new Date(dueAt).toISOString() : undefined,
                        idempotencyKey: crypto.randomUUID(),
                    }
                  : {
                        title,
                        description,
                        dueAt: new Date(dueAt).toISOString(),
                        idempotencyKey: crypto.randomUUID(),
                    };

        setSaving(true);
        setError(null);
        try {
            await apiFetch(path, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            setNotice(`${quickCreate.replace('_', ' ')} created and audited.`);
            setQuickCreate(null);
            await loadSummary();
        } catch (saveError) {
            setError(getErrorMessage(saveError, 'The item could not be created.'));
        } finally {
            setSaving(false);
        }
    }

    async function activatePanic(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const facts = String(form.get('facts') ?? '')
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);
        setSaving(true);
        setError(null);
        try {
            await apiFetch('/operations/panic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: String(form.get('title') ?? '').trim(),
                    category: String(form.get('category') ?? 'operational'),
                    facts,
                    idempotencyKey: crypto.randomUUID(),
                }),
            });
            setNotice(
                'Critical protocol activated. A checklist and internal review tasks were created; no external action was sent.',
            );
            setPanicOpen(false);
            await loadSummary();
        } catch (saveError) {
            setError(getErrorMessage(saveError, 'The critical protocol could not be activated.'));
        } finally {
            setSaving(false);
        }
    }

    async function resolveIncident(incidentId: string) {
        setSaving(true);
        setError(null);
        try {
            await apiFetch(`/operations/incidents/${incidentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'resolved' }),
            });
            setNotice('Incident resolved and audited.');
            await loadSummary();
        } catch (saveError) {
            setError(getErrorMessage(saveError, 'The incident could not be updated.'));
        } finally {
            setSaving(false);
        }
    }

    async function decideApproval(
        approvalId: string,
        decision: 'approved' | 'rejected',
    ) {
        setSaving(true);
        setError(null);
        try {
            await apiFetch(`/operations/approvals/${approvalId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision }),
            });
            setNotice(
                `Request ${decision}. This recorded the human decision; no external Gmail action was executed.`,
            );
            await loadSummary();
        } catch (saveError) {
            setError(getErrorMessage(saveError, 'The approval could not be updated.'));
        } finally {
            setSaving(false);
        }
    }

    if (!operationsEnabled) {
        return (
            <Card className="rounded-none border-dashed">
                <CardHeader>
                    <CardTitle>Operations Core is disabled</CardTitle>
                    <CardDescription>
                        Set ENABLE_OPERATIONS_CORE and NEXT_PUBLIC_ENABLE_OPERATIONS_CORE
                        to true in a controlled environment to enable this module.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-7 w-7 text-tangerine" />
                        <h1 className="text-3xl font-bold tracking-tight">Operations Center</h1>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        One view for incidents, urgent work, commitments, risk and workload.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => void loadSummary()} disabled={loading}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    {(['incident', 'task', 'commitment'] as QuickCreateKind[]).map(
                        (kind) => (
                            <Button key={kind} variant="outline" onClick={() => setQuickCreate(kind)}>
                                <Plus className="mr-2 h-4 w-4" /> {kind}
                            </Button>
                        ),
                    )}
                    <Button variant="destructive" onClick={() => setPanicOpen(true)}>
                        <AlertTriangle className="mr-2 h-4 w-4" /> Critical protocol
                    </Button>
                </div>
            </div>

            {error && (
                <div role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}
            {notice && (
                <div className="border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
                    {notice}
                </div>
            )}

            {loading && !summary ? (
                <div className="flex min-h-64 items-center justify-center text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading operating picture…
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="rounded-none">
                            <CardHeader className="pb-2">
                                <CardDescription>Workload risk</CardDescription>
                                <CardTitle className="flex items-center justify-between">
                                    {summary?.workload.score ?? 0}/100
                                    <Badge variant={badgeVariant(summary?.workload.level ?? 'low')}>
                                        {summary?.workload.level ?? 'low'}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground">
                                {Math.round((summary?.workload.workedMinutes ?? 0) / 60)} h logged ·{' '}
                                {summary?.workload.overdueCommitments ?? 0} overdue
                            </CardContent>
                        </Card>
                        <Card className="rounded-none">
                            <CardHeader className="pb-2">
                                <CardDescription>Pending approvals</CardDescription>
                                <CardTitle>{summary?.pendingApprovals ?? 0}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground">
                                External actions remain blocked until human approval.
                            </CardContent>
                        </Card>
                        <Card className="rounded-none">
                            <CardHeader className="pb-2">
                                <CardDescription>Operating picture</CardDescription>
                                <CardTitle>{summary?.incidents.length ?? 0} open incidents</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground">
                                Updated {dateTime(summary?.generatedAt)}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                        <OperationsList
                            title="Pending approvals"
                            description="Human decisions only. Approval does not execute a Gmail action."
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            empty="No pending approvals."
                        >
                            {approvals.map((approval) => (
                                <ListRow
                                    key={approval.id}
                                    title={approval.summary}
                                    detail={`${approval.actionType.replaceAll('_', ' ')} · ${dateTime(approval.expiresAt ?? approval.createdAt)}`}
                                >
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={saving}
                                            onClick={() => void decideApproval(approval.id, 'approved')}
                                            aria-label={`Approve ${approval.summary}`}
                                        >
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={saving}
                                            onClick={() => void decideApproval(approval.id, 'rejected')}
                                            aria-label={`Reject ${approval.summary}`}
                                        >
                                            <XCircle className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </ListRow>
                            ))}
                        </OperationsList>

                        <OperationsList
                            title="Open incidents"
                            description="Items needing ownership and a safe next action."
                            icon={<ShieldAlert className="h-5 w-5" />}
                            empty="No open incidents."
                        >
                            {summary?.incidents.map((incident) => (
                                <ListRow key={incident.id} title={incident.title} detail={`${incident.status.replace('_', ' ')} · ${dateTime(incident.lastActivityAt)}`} severity={incident.severity}>
                                    <Button size="sm" variant="ghost" disabled={saving} onClick={() => void resolveIncident(incident.id)} aria-label={`Resolve ${incident.title}`}>
                                        <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                </ListRow>
                            ))}
                        </OperationsList>

                        <OperationsList title="Urgent tasks" description="Critical, high-priority or due work." icon={<ClipboardList className="h-5 w-5" />} empty="No urgent tasks.">
                            {summary?.urgentTasks.map((task) => (
                                <ListRow key={task.id} title={task.title} detail={dateTime(task.dueDate)} severity={task.priority} />
                            ))}
                        </OperationsList>

                        <OperationsList title="Upcoming commitments" description="Promises and deadlines that must not disappear." icon={<CalendarClock className="h-5 w-5" />} empty="No upcoming commitments.">
                            {summary?.commitments.map((commitment) => (
                                <ListRow key={commitment.id} title={commitment.title} detail={dateTime(commitment.dueAt)} />
                            ))}
                        </OperationsList>

                        <OperationsList title="Risk signals" description="Automatically detected conditions for human review." icon={<AlertTriangle className="h-5 w-5" />} empty="No active alerts.">
                            {summary?.alerts.map((alert) => (
                                <ListRow key={alert.id} title={alert.title} detail={alert.description || dateTime(alert.detectedAt)} severity={alert.severity} />
                            ))}
                        </OperationsList>
                    </div>
                </>
            )}

            <Dialog open={quickCreate !== null} onOpenChange={(open) => !open && setQuickCreate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create {quickCreate}</DialogTitle>
                        <DialogDescription>The change will be tenant-scoped and audited.</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={submitQuickCreate}>
                        <div className="space-y-2"><Label htmlFor="quick-title">Title</Label><Input id="quick-title" name="title" required maxLength={180} /></div>
                        <div className="space-y-2"><Label htmlFor="quick-description">Description</Label><Textarea id="quick-description" name="description" maxLength={4000} /></div>
                        {quickCreate !== 'commitment' && (
                            <div className="space-y-2"><Label htmlFor="quick-severity">{quickCreate === 'task' ? 'Priority' : 'Severity'}</Label><select id="quick-severity" name="severity" defaultValue="medium" className="h-10 w-full border border-input bg-background px-3 text-sm"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
                        )}
                        {quickCreate !== 'incident' && (
                            <div className="space-y-2"><Label htmlFor="quick-due">Due date</Label><Input id="quick-due" name="dueAt" type="datetime-local" required={quickCreate === 'commitment'} /></div>
                        )}
                        <DialogFooter><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={panicOpen} onOpenChange={setPanicOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activate critical protocol</DialogTitle>
                        <DialogDescription>
                            This creates a critical incident, checklist, risk signal and review task. It sends nothing externally.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={activatePanic}>
                        <div className="space-y-2"><Label htmlFor="panic-title">What happened?</Label><Input id="panic-title" name="title" required maxLength={180} /></div>
                        <div className="space-y-2"><Label htmlFor="panic-category">Category</Label><select id="panic-category" name="category" defaultValue="operational" className="h-10 w-full border border-input bg-background px-3 text-sm"><option value="operational">Operational</option><option value="safety">Safety</option><option value="missing_worker">Missing worker</option><option value="serious_conflict">Serious conflict</option><option value="accommodation_transport">Accommodation or transport</option><option value="documentation">Documentation</option><option value="client_escalation">Client escalation</option><option value="payroll">Payroll</option><option value="personal_overload">Personal overload</option></select></div>
                        <div className="space-y-2"><Label htmlFor="panic-facts">Confirmed facts (one per line)</Label><Textarea id="panic-facts" name="facts" rows={5} maxLength={4000} /></div>
                        <DialogFooter><Button type="submit" variant="destructive" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Activate internal protocol</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function OperationsList({ title, description, icon, empty, children }: { title: string; description: string; icon: React.ReactNode; empty: string; children?: React.ReactNode }) {
    const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
    return (
        <Card className="rounded-none">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-lg">{icon}{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="divide-y p-0">{hasChildren ? children : <p className="p-5 text-sm text-muted-foreground">{empty}</p>}</CardContent>
        </Card>
    );
}

function ListRow({ title, detail, severity, children }: { title: string; detail: string; severity?: Severity; children?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{title}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{detail}</p></div>
            {severity && <Badge variant={badgeVariant(severity)}>{severity}</Badge>}
            {children}
        </div>
    );
}
