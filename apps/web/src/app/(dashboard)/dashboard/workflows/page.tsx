'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Progress } from '@ori-os/ui';
import { Plus, Play, Pause, Settings, Trash2, Zap, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkflows } from '@/hooks/use-workflows';

export default function WorkflowsPage() {
    const { workflows, isLoading } = useWorkflows();

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-tangerine" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
                    <p className="text-muted-foreground">Automate your business processes with ease</p>
                </div>
                <Button variant="accent">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workflow
                </Button>
            </div>

            {/* Automation Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Active Automations', value: workflows.filter(w => w.status === 'active').length, icon: Zap, color: 'text-tangerine' },
                    { label: 'Runs this month', value: '1,284', icon: Play, color: 'text-blue-500' },
                    { label: 'Time Saved', value: '42h', icon: Clock, color: 'text-green-500' },
                ].map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2 rounded-none bg-muted`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Workflows List */}
            <div className="grid gap-4">
                {workflows.map((workflow, index) => (
                    <motion.div
                        key={workflow.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card hover="lift">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-foreground">{workflow.name}</h3>
                                            <Badge variant={workflow.status === 'active' ? 'success' : 'secondary'}>
                                                {workflow.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground max-w-2xl">
                                            {workflow.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon-sm">
                                            {workflow.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="ghost" size="icon-sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-tangerine" />
                                        <span>3 steps</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Last run: {workflow.lastRun || 'Never'}</span>
                                    </div>
                                    <div className="flex-1" />
                                    <Button variant="link" size="sm" className="h-auto p-0 text-tangerine">
                                        View Run History <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
