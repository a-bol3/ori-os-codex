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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    useToast
} from '@ori-os/ui';
import { Plus, Filter, MoreHorizontal, DollarSign, Building2, Calendar, Loader2, Search, Download } from 'lucide-react';
import { useDeals } from '@/hooks/use-deals';
import { useState, useMemo } from 'react';
import { DealModal } from '../../../../../components/crm/create-deal-modal';
import { DealDetailsModal } from '../../../../../components/crm/deal-details-modal';
import { exportToCSV } from '@/lib/export';

export default function DealsPage() {
    const { deals, isLoading, error, refresh } = useDeals(); // useDeals updated with refresh earlier
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<any>(null);
    const [stageFilter, setStageFilter] = useState('All');
    const { toast } = useToast();

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => {
            const matchesSearch =
                deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (deal.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                deal.stage.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStage = stageFilter === 'All' || deal.stage === stageFilter;

            return matchesSearch && matchesStage;
        });
    }, [deals, searchQuery, stageFilter]);

    const handleExport = () => {
        exportToCSV(filteredDeals, 'deals-export');
        toast({ title: 'Exported', description: 'Deals exported to CSV.' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        toast({ title: 'Deleted', description: 'Deal removed (Simulated).' });
        refresh();
    };

    const stats = useMemo(() => {
        const stages = [
            { name: 'Lead', color: 'bg-slate-500' },
            { name: 'Qualified', color: 'bg-blue-500' },
            { name: 'Proposal', color: 'bg-yellow-500' },
            { name: 'Negotiation', color: 'bg-orange-500' },
            { name: 'Closed Won', color: 'bg-green-500' },
        ];

        return stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.name);
            const totalValue = stageDeals.reduce((sum, d) => sum + (typeof d.value === 'number' ? d.value : 0), 0);
            return {
                ...stage,
                count: stageDeals.length,
                value: `$${totalValue.toLocaleString()}`
            };
        });
    }, [deals]);

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
            />

            <DealDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedDeal(null);
                }}
                deal={selectedDeal}
            />

            {/* Pipeline overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stage, index) => (
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        {stageFilter === 'All' ? 'Filters' : stageFilter}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setStageFilter('All')}>All Stages</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStageFilter('Lead')}>Lead</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStageFilter('Qualified')}>Qualified</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStageFilter('Proposal')}>Proposal</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStageFilter('Negotiation')}>Negotiation</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
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
                        {filteredDeals.map((deal, index) => (
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
                                            <h3 className="font-medium text-foreground">{deal.name}</h3>
                                            <Badge variant="outline">{deal.stage}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1 group/item"><Building2 className="h-3 w-3 text-tangerine/60 group-hover/item:text-tangerine transition-colors" />{deal.company}</span>
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
