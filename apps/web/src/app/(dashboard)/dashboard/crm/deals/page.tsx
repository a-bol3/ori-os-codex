'use client';

import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Badge,
    Progress,
    Input,
    Checkbox,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    useToast
} from '@ori-os/ui';
import { Plus, Filter, MoreHorizontal, DollarSign, Building2, Calendar, Loader2, Search, Download } from 'lucide-react';
import { useDeals } from '@/hooks/use-deals';
import { usePipelines } from '@/hooks/use-pipelines';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DealModal } from '../../../../../components/crm/create-deal-modal';
import { DealDetailsModal } from '../../../../../components/crm/deal-details-modal';
import { exportToCSV } from '@/lib/export';
import type { Deal } from '@/hooks/use-deals';
import { apiFetch } from '@/lib/api-client';

export default function DealsPage() {
    const { deals, isLoading, error, refresh } = useDeals();
    const { stages } = usePipelines();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [stageFilter, setStageFilter] = useState('All');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const requestedDealId = searchParams.get('dealId');
    const requestedCompanyId = searchParams.get('companyId');

    useEffect(() => {
        if (!requestedDealId || deals.length === 0) return;
        const matched = deals.find((item) => item.id === requestedDealId);
        if (!matched) return;
        setSelectedDeal(matched);
        setIsDetailsModalOpen(true);
    }, [requestedDealId, deals]);

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => {
            const matchesSearch =
                deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (deal.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                deal.stage.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStage = stageFilter === 'All' || deal.stage === stageFilter;
            const matchesCompany = !requestedCompanyId || deal.companyId === requestedCompanyId;

            return matchesSearch && matchesStage && matchesCompany;
        });
    }, [deals, requestedCompanyId, searchQuery, stageFilter]);

    const handleExport = () => {
        exportToCSV(filteredDeals, 'deals-export');
        toast({ title: 'Exported', description: 'Deals exported to CSV.' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await apiFetch(`/crm/deals/${id}`, { method: 'DELETE' });
            toast({ title: 'Deleted', description: 'Deal removed.' });
            refresh();
        } catch (deleteError) {
            toast({
                title: 'Error',
                description: deleteError instanceof Error ? deleteError.message : 'Could not delete deal.',
                variant: 'destructive',
            });
        }
    };

    const toggleRow = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredDeals.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredDeals.map((deal) => deal.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} selected deals?`)) return;

        try {
            const response = await apiFetch('/crm/deals/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });
            const result = await response.json() as { deleted: number };
            toast({
                title: 'Deals deleted',
                description: `${result.deleted} selected deals were removed.`,
            });
            setSelectedIds(new Set());
            refresh();
        } catch (error) {
            toast({
                title: 'Bulk delete failed',
                description: error instanceof Error ? error.message : 'Could not delete selected deals.',
                variant: 'destructive',
            });
        }
    };

    const stats = useMemo(() => {
        const palette = ['bg-slate-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-green-500', 'bg-rose-500'];
        const availableStages = stages.length > 0
            ? stages
            : Array.from(new Set(deals.map(deal => deal.stage))).map((name, index) => ({ id: name, name, order: index + 1 }));

        return availableStages.map((stage, index) => {
            const stageDeals = deals.filter(d => d.stage === stage.name);
            const totalValue = stageDeals.reduce((sum, d) => sum + (typeof d.value === 'number' ? d.value : 0), 0);
            return {
                ...stage,
                color: palette[index % palette.length],
                count: stageDeals.length,
                value: `$${totalValue.toLocaleString()}`
            };
        });
    }, [deals, stages]);

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-tangerine" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 border border-destructive/30 bg-destructive/5 p-8 text-center">
                <p className="text-sm text-destructive">Unable to load deals: {error}</p>
                <Button variant="outline" onClick={refresh}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Deals</h1>
                    <p className="text-muted-foreground">Track and manage your sales pipeline</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="accent" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />New Deal
                    </Button>
                </div>
            </div>

            <DealModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedDeal(null);
                }}
                onSuccess={() => {
                    refresh();
                    setIsCreateModalOpen(false);
                    setSelectedDeal(null);
                }}
                deal={selectedDeal}
                defaultCompanyId={requestedCompanyId || undefined}
            />

            <DealDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedDeal(null);
                    if (requestedDealId) {
                        router.replace('/dashboard/crm/deals');
                    }
                }}
                deal={selectedDeal}
            />

            {/* Pipeline overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="p-6 text-sm text-muted-foreground">
                            No pipeline stages are available right now. Retry loading the pipeline before creating or editing deals.
                        </CardContent>
                    </Card>
                ) : stats.map((stage, index) => (
                    <motion.div
                        key={stage.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-foreground">{stage.name}</span>
                                    <div className={`w-2 h-2 rounded-none ${stage.color}`} />
                                </div>
                                <div className="text-2xl font-bold text-foreground">{stage.count}</div>
                                <div className="text-sm text-muted-foreground">{stage.value}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            placeholder="Search deals..."
                            className="flex-1"
                            icon={<Search className="h-4 w-4" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Checkbox
                                checked={filteredDeals.length > 0 && selectedIds.size === filteredDeals.length}
                                onCheckedChange={toggleAll}
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        {stageFilter === 'All' ? 'Filters' : stageFilter}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setStageFilter('All')}>All Stages</DropdownMenuItem>
                                    {stats.map((stage) => (
                                        <DropdownMenuItem key={stage.name} onClick={() => setStageFilter(stage.name)}>
                                            {stage.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                            {selectedIds.size > 0 && (
                                <Button variant="outline" onClick={handleBulkDelete}>
                                    Delete Selected ({selectedIds.size})
                                </Button>
                            )}
                            {requestedCompanyId && (
                                <Button
                                    variant="ghost"
                                    onClick={() => router.replace('/dashboard/crm/deals')}
                                >
                                    Clear Company Filter
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Deals list */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Deals</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {filteredDeals.length === 0 ? (
                            <div className="p-10 text-center text-sm text-muted-foreground">
                                {deals.length === 0
                                    ? 'No deals yet. Create your first deal to start tracking your pipeline.'
                                    : 'No deals match the current search or stage filter.'}
                            </div>
                        ) : filteredDeals.map((deal, index) => (
                            <motion.div
                                key={deal.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="p-4 hover:bg-muted/50 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Checkbox
                                                checked={selectedIds.has(deal.id)}
                                                onCheckedChange={() => toggleRow(deal.id)}
                                            />
                                            <button
                                                type="button"
                                                className="font-medium text-foreground transition-colors hover:text-tangerine"
                                                onClick={() => {
                                                    setSelectedDeal(deal);
                                                    setIsDetailsModalOpen(true);
                                                }}
                                            >
                                                {deal.name}
                                            </button>
                                            <Badge variant="outline">{deal.stage}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1 group/item">
                                                <Building2 className="h-3 w-3 text-tangerine/60 group-hover/item:text-tangerine transition-colors" />
                                                {deal.companyId ? (
                                                    <button
                                                        type="button"
                                                        className="transition-colors hover:text-tangerine"
                                                        onClick={() => router.push(`/dashboard/crm/companies?companyId=${deal.companyId}`)}
                                                    >
                                                        {deal.company}
                                                    </button>
                                                ) : (
                                                    deal.company
                                                )}
                                            </span>
                                            <span className="flex items-center gap-1 group/item">
                                                <DollarSign className="h-3 w-3 text-tangerine/60 group-hover/item:text-tangerine transition-colors" />
                                                {typeof deal.value === 'number' ? `$${deal.value.toLocaleString()}` : deal.value}
                                            </span>
                                            <span className="flex items-center gap-1 group/item"><Calendar className="h-3 w-3 text-tangerine/60 group-hover/item:text-tangerine transition-colors" />{deal.expectedClose}</span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <Progress value={deal.probability} className="flex-1 h-2" />
                                            <span className="text-sm text-muted-foreground">{deal.probability}%</span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {
                                                setSelectedDeal(deal);
                                                setIsDetailsModalOpen(true);
                                            }}>View Details</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                setSelectedDeal(deal);
                                                setIsCreateModalOpen(true);
                                            }}>Edit Deal</DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDelete(deal.id)}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
