'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Badge,
    Progress,
} from '@ori-os/ui';
import { DollarSign, Building2, Calendar, Target, TrendingUp, Clock } from 'lucide-react';

interface DealDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: any;
}

export function DealDetailsModal({ isOpen, onClose, deal }: DealDetailsModalProps) {
    if (!deal) return null;

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Closed Won': return 'success';
            case 'Negotiation': return 'warning';
            case 'Proposal': return 'accent';
            case 'Qualified': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Deal Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">{deal.name}</h2>
                        <div className="flex items-center gap-2">
                            <Badge variant={getStageColor(deal.stage)}>
                                {deal.stage}
                            </Badge>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm font-medium text-tangerine">
                                ${deal.value.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase">Company</Label>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    {deal.organization?.name || deal.company}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase">Expected Close</Label>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center mb-1">
                                    <Label className="text-xs text-muted-foreground uppercase">Probability</Label>
                                    <span className="text-xs font-bold">{deal.probability || 0}%</span>
                                </div>
                                <Progress value={deal.probability || 0} className="h-2" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase">Estimated Revenue</Label>
                                <div className="flex items-center gap-2 text-sm font-bold text-green-500">
                                    <TrendingUp className="h-4 w-4" />
                                    ${((deal.value || 0) * (deal.probability || 0) / 100).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-none bg-muted/30 border border-border">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-tangerine" />
                            Deal Activity
                        </h3>
                        <div className="space-y-3">
                            <div className="text-xs flex gap-3">
                                <div className="w-2 h-2 rounded-none bg-tangerine mt-1.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Deal created</p>
                                    <p className="text-muted-foreground">{new Date(deal.createdAt || Date.now()).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-xs flex gap-3">
                                <div className="w-2 h-2 rounded-none bg-muted mt-1.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Stage updated to {deal.stage}</p>
                                    <p className="text-muted-foreground">Recent activity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button variant="accent">Go to Pipeline</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`block font-medium ${className}`}>{children}</span>;
}
