'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    useToast,
    Badge
} from '@ori-os/ui';
import {
    Database,
    Bell,
    Search,
    Zap,
    Trash2,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from 'lucide-react';

interface Action {
    name: string;
    description: string;
    icon: any;
    endpoint: string;
    body?: any;
    variant: "accent" | "outline" | "secondary" | "destructive";
}

export default function TestBenchPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    const runTask = async (taskName: string, endpoint: string, body?: any) => {
        setLoading(taskName);
        try {
            const response = await fetch(`/api/test-bench/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined
            });

            const data = await response.json();

            if (data.success || data.status === 'SUCCESS') {
                toast({
                    title: "Task Successful",
                    description: data.message || `Successfully executed ${taskName}`,
                });
            } else {
                throw new Error(data.error || data.message || 'Unknown error');
            }
        } catch (error) {
            toast({
                title: "Task Failed",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
        } finally {
            setLoading(null);
        }
    };

    const testCategories: { title: string; description: string; actions: Action[] }[] = [
        {
            title: "Database & Seeding",
            description: "Manage test data and environment state",
            actions: [
                {
                    name: "Seed Data",
                    description: "Populate DB with 10 companies and 50 contacts",
                    icon: Database,
                    endpoint: "seed",
                    variant: "accent" as const
                },
                {
                    name: "Reset Local State",
                    description: "Clear local storage and session data",
                    icon: Trash2,
                    endpoint: "clear-local", // Frontend only task dummy for now
                    variant: "outline" as const
                }
            ]
        },
        {
            title: "SEO Studio Tests",
            description: "Trigger search engine and crawler events",
            actions: [
                {
                    name: "Trigger Rank Drop",
                    description: "Simulate a significant keyword position loss",
                    icon: AlertTriangle,
                    endpoint: "trigger-seo-alert",
                    body: { projectId: "default", type: "rank_drop" },
                    variant: "destructive" as const
                },
                {
                    name: "New Issues Found",
                    description: "Simulate crawler finding new site issues",
                    icon: Search,
                    endpoint: "trigger-seo-alert",
                    body: { projectId: "default", type: "new_issue" },
                    variant: "secondary" as const
                },
                {
                    name: "GSC Sync",
                    description: "Force sync with Google Search Console",
                    icon: RefreshCw,
                    endpoint: "trigger-gsc-sync",
                    body: { projectId: "default" },
                    variant: "outline" as const
                }
            ]
        },
        {
            title: "Intelligence & AI",
            description: "Test enrichment and generative features",
            actions: [
                {
                    name: "Enrich Company",
                    description: "Run AI enrichment for techcorp.com",
                    icon: Zap,
                    endpoint: "../intelligence/enrich/company",
                    body: { domain: "techcorp.com" },
                    variant: "accent" as const
                }
            ]
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                        Developer Test Bench
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            Dev Mode
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Quickly trigger backend events and verify API connectivity
                    </p>
                </div>
            </motion.div>

            <div className="grid gap-8">
                {testCategories.map((category, idx) => (
                    <section key={category.title}>
                        <h2 className="text-xl font-semibold mb-4 text-foreground/80">{category.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.actions.map((action) => (
                                <Card key={action.name} className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="p-2 bg-primary/10 rounded-none text-primary">
                                                <action.icon className="w-5 h-5" />
                                            </div>
                                            <CardTitle className="text-base">{action.name}</CardTitle>
                                        </div>
                                        <CardDescription className="text-xs">{action.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <Button
                                            variant={action.variant}
                                            size="sm"
                                            className="w-full"
                                            disabled={loading === action.name}
                                            onClick={() => runTask(action.name, action.endpoint, action.body)}
                                        >
                                            {loading === action.name ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Zap className="w-4 h-4 mr-2" />
                                            )}
                                            Run Test
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
