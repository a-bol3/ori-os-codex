'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Badge,
    Label,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    useToast,
    Switch,
} from '@ori-os/ui';
import {
    Plus,
    Play,
    Settings,
    Zap,
    Mail,
    Users,
    ChevronRight,
    Search,
    Database,
    Bell,
    Bot,
    Save,
    Trash2,
    Undo,
    Redo,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface WorkflowNode {
    id: string;
    type: 'trigger' | 'action' | 'condition';
    label: string;
    icon: any;
    status: 'idle' | 'running' | 'success' | 'failed';
    config: any;
}

export default function AutomationBuilderPage() {
    const { toast } = useToast();
    const [nodes, setNodes] = useState<WorkflowNode[]>([]);
    const [workflowName, setWorkflowName] = useState('New Workflow');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflow = async () => {
            try {
                // For demo, we fetch the first available workflow if no ID in URL
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/automations/workflows`);
                const data = await res.json();
                const workflow = data[0];
                if (workflow) {
                    setWorkflowId(workflow.id);
                    setWorkflowName(workflow.name);
                    setIsActive(workflow.status === 'active');
                    if (workflow.definitionJson) {
                        const def = workflow.definitionJson;
                        // Map core definition to UI nodes
                        const uiNodes: WorkflowNode[] = [
                            ...(def.triggers || []).map((t: any) => ({ ...t, type: 'trigger' as const, status: 'idle' as const })),
                            ...(def.nodes || []).map((n: any) => ({ ...n, status: 'idle' as const })),
                        ];
                        setNodes(uiNodes);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch workflow:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkflow();
    }, []);

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    const addNode = (type: 'action' | 'condition') => {
        const newNode: WorkflowNode = {
            id: Date.now().toString(),
            type,
            label: type === 'action' ? 'New Action' : 'New Condition',
            icon: type === 'action' ? Zap : Bot,
            status: 'idle',
            config: {},
        };
        setNodes([...nodes, newNode]);
    };

    const removeNode = (id: string) => {
        if (nodes.find(n => n.id === id)?.type === 'trigger') {
            toast({ title: "Cannot remove trigger", description: "Every workflow needs a starting trigger.", variant: "destructive" });
            return;
        }
        setNodes(nodes.filter(n => n.id !== id));
    };

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const workflowId = 'default-workflow-id'; // In a real app, this would come from the URL or state
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/automations/workflows/${workflowId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: workflowName,
                    nodes: nodes, // Storing nodes as JSON field in DB
                    description: `Modified on ${new Date().toLocaleString()}`,
                }),
            });

            if (!response.ok) throw new Error('Failed to save workflow');

            toast({
                title: "Workflow Saved",
                description: `"${workflowName}" has been persisted to the database.`,
            });
        } catch (error) {
            console.error('Save failed:', error);
            toast({
                title: "Save Failed",
                description: "We couldn't reach the server, but your changes are kept in local state.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRunPreview = async () => {
        if (!workflowId) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/automations/workflows/${workflowId}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload: { test: true } }),
            });
            if (res.ok) {
                toast({
                    title: "Test Run Started",
                    description: "Execution has been enqueued in the background.",
                });
            }
        } catch (error) {
            toast({ title: "Test Failed", variant: "destructive" });
        }
    };

    const toggleStatus = async () => {
        if (!workflowId) return;
        const newStatus = isActive ? 'inactive' : 'active';
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/automations/workflows/${workflowId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            setIsActive(!isActive);
            toast({ title: `Workflow ${newStatus === 'active' ? 'Activated' : 'Paused'}` });
        } catch (error) {
            toast({ title: "Update Failed", variant: "destructive" });
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col -m-6">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/automation">
                        <Button variant="ghost" size="icon-sm">
                            <Undo className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Input
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            className="h-8 font-semibold border-none bg-transparent focus-visible:ring-1 focus-visible:ring-tangerine w-48"
                        />
                        <Badge variant="secondary">Draft</Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4 bg-muted/50 px-3 py-1 border border-border">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{isActive ? 'Active' : 'Paused'}</span>
                        <Switch checked={isActive} onCheckedChange={toggleStatus} />
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon-sm"><Undo className="h-4 w-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Undo</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon-sm"><Redo className="h-4 w-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Redo</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="w-px h-4 bg-border mx-2" />
                    <Button variant="outline" size="sm" onClick={handleRunPreview}>
                        <Play className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    <Button variant="accent" size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {saving ? 'Saving...' : 'Save Workflow'}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Node Palette */}
                <aside className="w-64 border-r border-border bg-card p-4 space-y-6 overflow-y-auto z-10">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Triggers</h4>
                        <div className="space-y-2">
                            {[
                                { icon: Users, label: 'CRM Event' },
                                { icon: Mail, label: 'Email Received' },
                                { icon: Database, label: 'Form Submission' },
                            ].map(item => (
                                <div key={item.label} className="p-3 rounded-none border border-border bg-muted/30 hover:bg-muted cursor-move flex items-center gap-3 text-sm font-medium transition-colors">
                                    <div className="p-1.5 rounded-none bg-tangerine/10">
                                        <item.icon className="h-4 w-4 text-tangerine" />
                                    </div>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Actions</h4>
                        <div className="space-y-2">
                            {[
                                { icon: Mail, label: 'Send Email', color: 'text-blue-500' },
                                { icon: Zap, label: 'CRM Update', color: 'text-green-500' },
                                { icon: Bell, label: 'Send Alert', color: 'text-yellow-500' },
                                { icon: Bot, label: 'AI Enrichment', color: 'text-purple-500' },
                            ].map(item => (
                                <div
                                    key={item.label}
                                    className="p-3 rounded-none border border-border bg-muted/30 hover:bg-muted cursor-pointer flex items-center gap-3 text-sm font-medium transition-colors"
                                    onClick={() => addNode('action')}
                                >
                                    <div className={`p-1.5 rounded-none ${item.color.replace('text', 'bg')}/10`}>
                                        <item.icon className={`h-4 w-4 ${item.color}`} />
                                    </div>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Canvas */}
                <main className="flex-1 bg-muted/20 relative overflow-hidden flex items-center justify-center">
                    {/* Grid Background */}
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

                    <div className="relative z-10 flex flex-col items-center gap-12 p-12 overflow-y-auto max-h-full w-full">
                        {nodes.map((node, index) => (
                            <div key={node.id} className="flex flex-col items-center gap-12">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative"
                                >
                                    <Card
                                        className={`w-64 border-2 cursor-pointer transition-all ${node.type === 'trigger' ? 'border-tangerine shadow-lg shadow-tangerine/5' : 'border-transparent hover:border-border/80'} ${selectedNodeId === node.id ? 'ring-2 ring-tangerine ring-offset-2' : ''}`}
                                        onClick={() => setSelectedNodeId(node.id)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-none ${node.type === 'trigger' ? 'bg-tangerine/10' : 'bg-muted'}`}>
                                                        <node.icon className={`h-5 w-5 ${node.type === 'trigger' ? 'text-tangerine' : 'text-foreground'}`} />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{node.type}</div>
                                                        <div className="text-sm font-bold text-foreground">{node.label}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon-sm"><Settings className="h-4 w-4" /></Button>
                                                    {node.type !== 'trigger' && (
                                                        <Button variant="ghost" size="icon-sm" onClick={() => removeNode(node.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Connection Line */}
                                    {index < nodes.length - 1 && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 h-12 w-0.5 bg-gradient-to-b from-border to-border/50">
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 p-1 rounded-none bg-border">
                                                <Plus className="h-3 w-3 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            className="border-dashed border-2 p-6 h-auto w-64 hover:bg-tangerine/5 hover:border-tangerine/50"
                            onClick={() => addNode('action')}
                        >
                            <Plus className="mr-2 h-5 w-5 text-tangerine" />
                            Add Step
                        </Button>
                    </div>
                </main>

                {/* Right Panel - Configuration */}
                <aside className="w-80 border-l border-border bg-card flex flex-col z-10">
                    <div className="p-4 border-b border-border">
                        <h4 className="font-bold text-sm">Step Configuration</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {selectedNode ? (
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-3 p-4 rounded-none bg-muted/30 border border-border">
                                    <div className={`p-2 rounded-none ${selectedNode.type === 'trigger' ? 'bg-tangerine/10' : 'bg-muted'}`}>
                                        <selectedNode.icon className={`h-5 w-5 ${selectedNode.type === 'trigger' ? 'text-tangerine' : 'text-foreground'}`} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-muted-foreground uppercase">{selectedNode.type}</div>
                                        <div className="text-sm font-bold">{selectedNode.label}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Step Name</Label>
                                        <Input
                                            value={selectedNode.label}
                                            onChange={(e) => {
                                                const newNodes = [...nodes];
                                                const idx = newNodes.findIndex(n => n.id === selectedNode.id);
                                                newNodes[idx].label = e.target.value;
                                                setNodes(newNodes);
                                            }}
                                        />
                                    </div>

                                    {selectedNode.type === 'trigger' ? (
                                        <div className="space-y-4">
                                            <div className="p-3 rounded-none border border-tangerine/20 bg-tangerine/5 text-xs text-tangerine leading-relaxed">
                                                This workflow will start automatically whenever a new lead is created in your CRM.
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Filter Conditions</Label>
                                                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toast({ title: "Conditions", description: "Condition builder is currently in read-only mode." })}>Add Condition</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Action Settings</Label>
                                                <div className="p-4 rounded-none border border-border text-xs text-muted-foreground italic">
                                                    Configure how this action behaves when triggered.
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Delay</Label>
                                                <Input type="number" placeholder="0" defaultValue="0" />
                                                <p className="text-[10px] text-muted-foreground italic">Minutes to wait before executing this action.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                <Settings className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <h5 className="font-medium mb-1">No Step Selected</h5>
                                <p className="text-xs text-muted-foreground">Select a node on the canvas to configure its properties.</p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
