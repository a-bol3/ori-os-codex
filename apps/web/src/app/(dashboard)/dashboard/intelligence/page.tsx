
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from '@ori-os/ui';
import { LeadSearch } from '@/components/intelligence/LeadSearch';
import { IcpProfileManager } from '@/components/intelligence/IcpProfileManager';
import { Brain, Search, Target, History, RefreshCcw, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useEnrichmentJobs } from '@/hooks/use-enrichment-jobs';

export default function IntelligencePage() {
    const { jobs, isLoading, refresh } = useEnrichmentJobs();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'pending':
            case 'processing': return <Clock className="h-4 w-4 text-orange-500 animate-pulse" />;
            case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge variant="success">Completed</Badge>;
            case 'pending': return <Badge variant="secondary">Pending</Badge>;
            case 'processing': return <Badge variant="accent">Processing</Badge>;
            case 'failed': return <Badge variant="destructive">Failed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Intelligence & Discovery</h1>
                <p className="text-muted-foreground">
                    Find and qualify your ideal leads using AI-driven discovery and enrichment.
                </p>
            </div>

            <Tabs defaultValue="discovery" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="discovery" className="flex items-center">
                        <Search className="mr-2 h-4 w-4" />
                        Lead Discovery
                    </TabsTrigger>
                    <TabsTrigger value="icp" className="flex items-center">
                        <Target className="mr-2 h-4 w-4" />
                        ICP Profiles
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="flex items-center">
                        <History className="mr-2 h-4 w-4" />
                        Enrichment Jobs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="discovery" className="space-y-4">
                    <LeadSearch />
                </TabsContent>

                <TabsContent value="icp" className="space-y-4">
                    <IcpProfileManager />
                </TabsContent>

                <TabsContent value="jobs" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Recent Enrichment Jobs</CardTitle>
                                <CardDescription>Track the status of your company and contact enrichment requests.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading && jobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                    <p>Loading enrichment jobs...</p>
                                </div>
                            ) : jobs.length > 0 ? (
                                <div className="rounded-none border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Target</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Created At</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {jobs.map((job) => (
                                                <TableRow key={job.id} className="group hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(job.status)}
                                                            {job.targetId}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{job.targetType}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {job.provider}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(job.status)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground text-xs font-mono">
                                                        {new Date(job.createdAt).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-10">
                                    No recent enrichment jobs found. Start by searching for a lead.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
