'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    useToast,
} from '@ori-os/ui';
import { useCompanies } from '@/hooks/use-companies';

interface DealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    deal?: any; // If provided, we are editing
}

export function DealModal({ isOpen, onClose, onSuccess, deal }: DealModalProps) {
    const { companies } = useCompanies();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEdit = !!deal;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            value: parseFloat(formData.get('value') as string) || 0,
            stage: formData.get('stage') as string,
            probability: parseInt(formData.get('probability') as string) || 50,
            expectedCloseDate: formData.get('expectedCloseDate') as string,
            organizationId: companies.find(c => c.name === formData.get('company'))?.id || deal?.organizationId,
        };

        try {
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/crm/deals/${deal.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/crm/deals`;

            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} deal`);

            toast({
                title: `Deal ${isEdit ? 'Updated' : 'Created'}`,
                description: `${data.name} has been ${isEdit ? 'updated' : 'added to the pipeline'}.`,
            });
            onSuccess();
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'creating'} deal:`, error);
            toast({
                title: 'Error',
                description: `Could not ${isEdit ? 'update' : 'create'} deal.`,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" defaultValue={deal?.name || ''} placeholder="Enterprise License" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="company" className="text-right">Company</Label>
                        <div className="col-span-3">
                            <Select name="company" defaultValue={deal?.organization?.name || deal?.company}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">Value ($)</Label>
                        <Input id="value" name="value" type="number" defaultValue={deal?.value || ''} placeholder="50000" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stage" className="text-right">Stage</Label>
                        <div className="col-span-3">
                            <Select name="stage" defaultValue={deal?.stage || 'Lead'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Lead">Lead</SelectItem>
                                    <SelectItem value="Qualified">Qualified</SelectItem>
                                    <SelectItem value="Proposal">Proposal</SelectItem>
                                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                                    <SelectItem value="Closed Won">Closed Won</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="probability" className="text-right">Prob. (%)</Label>
                        <Input id="probability" name="probability" type="number" defaultValue={deal?.probability || "50"} min="0" max="100" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expectedCloseDate" className="text-right">Close Date</Label>
                        <Input id="expectedCloseDate" name="expectedCloseDate" type="date" defaultValue={deal?.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : ''} className="col-span-3" required />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="accent" disabled={isSubmitting}>
                            {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Deal')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
