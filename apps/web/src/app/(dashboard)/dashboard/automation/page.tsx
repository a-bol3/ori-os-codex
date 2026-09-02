'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    useToast,
} from '@ori-os/ui';
import {
    Clock,
    GitBranch,
    History,
    Loader2,
    Pause,
    Play,
    Plus,
    Search,
    Zap,
    AlertCircle,
} from 'lucide-react';

import { useWorkflows } from '@/hooks/use-workflows';
import { CreateWorkflowModal } from '@/components/automation/create-workflow-modal';
import { ExecutionLogModal } from '@/components/automation/execution-log-modal';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

function statusLabel(status: string) {
    const s = String(status).toLowerCase();
    if (s === 'active') return 'Active';
    if (s === 'paused') return 'Paused';
    return 'Draft';
}

function statusVariant(status: string): any {
    const s = String(status).toLowerCase();
    if (s === 'active') return 'success';
    if (s === 'paused') return 'secondary';
    return 'outline';
}

export default function AutomationPage() {
    const { workflows, isLoading, error, refresh } = useWorkflows();
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [runningId, setRunningId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

    const filteredWorkflows = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return workflows;
        return workflows.filter(
            (w) =>
                w.name.toLowerCase().includes(q) || (w.description ?? '').toLowerCase().includes(q),
        );
    }, [workflows, searchQuery]);

    const handleRunWorkflow = async (id: string, name: string) => {
        setRunningId(id);
        try {
            await apiFetch(`/automations/workflows/${id}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload: { source: 'automation_dashboard' } }),
            });
            toast({
                title: 'Workflow Test Queued',
                description: `The test for "${name}" was queued. Check Execution Log for progress.`,
            });

            refresh();
        } catch (error) {
            toast({
                title: 'Workflow Test Failed',
                description: getErrorMessage(error, 'The workflow test could not be queued.'),
                variant: 'destructive',
            });
        } finally {
            setRunningId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-tangerine" />
                    Loading automations…
                </div>
            </div>
        );
    }

    if (error && workflows.length === 0) {
        return (
            <div className="p-6">
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <div>
                            <p className="font-medium">Unable to load workflows</p>
                            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                        </div>
                        <Button variant="outline" onClick={refresh}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const activeCount = workflows.filter((w) => String(w.status).toLowerCase() === 'active').length;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Automation</h1>
                    <p className="text-sm text-muted-foreground">Build and manage automated workflows</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsLogsModalOpen(true)}>
                        <History className="h-4 w-4 mr-2" />
                        Execution Log
                    </Button>

                    <Button variant="accent" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Workflow
                    </Button>
                </div>
            </div>

            <CreateWorkflowModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={() => refresh()}
            />

            <ExecutionLogModal open={isLogsModalOpen} onOpenChange={setIsLogsModalOpen} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Active Workflows', value: activeCount, icon: GitBranch },
                    {
                        label: 'Total Executions',
                        value: workflows
                            .reduce((acc, curr) => acc + (curr.executions || 0), 0)
                            .toLocaleString(),
                        icon: Zap,
                    },
                    {
                        label: 'Time Saved',
                        value: '—',
                        icon: Clock,
                    },
                ].map((stat) => (
                    <Card key={stat.label} className="group">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center justify-between">
                                <span>{stat.label}</span>
                                <stat.icon className="h-4 w-4 text-tangerine transition-transform duration-300 group-hover:-translate-y-0.5" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-tangerine" />
                    <Input
                        className="pl-9"
                        placeholder="Search workflows…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Button variant="outline" onClick={refresh}>
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredWorkflows.map((workflow, index) => (
                    <motion.div
                        key={workflow.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                    >
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                                        <CardDescription className="mt-1">{workflow.description}</CardDescription>
                                    </div>

                                    <Badge variant={statusVariant(workflow.status)}>
                                        {statusLabel(workflow.status)}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="flex items-center justify-between gap-3">
                                <div className="text-xs text-muted-foreground">
                                    {workflow.lastRun ? `Last run: ${workflow.lastRun}` : 'Never run'}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => handleRunWorkflow(workflow.id, workflow.name)}
                                    disabled={runningId === workflow.id}
                                >
                                    {runningId === workflow.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-tangerine" />
                                    ) : String(workflow.status).toLowerCase() === 'active' ? (
                                        <Play className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Pause className="h-4 w-4 mr-2" />
                                    )}
                                    Trigger
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                {filteredWorkflows.length === 0 && (
                    <Card className="lg:col-span-2">
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            {searchQuery.trim()
                                ? 'No workflows match your search.'
                                : 'No workflows have been created for this workspace yet.'}
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ori Visual Workflow Builder</CardTitle>
                    <CardDescription>
                        No-code node editor (coming online as backend actions are wired).
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                        Integrate CRM actions, email sequences, enrichment, and AI steps.
                    </div>
                    <Link href="/dashboard/automation/builder">
                        <Button variant="accent">Open Workflow Builder</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
