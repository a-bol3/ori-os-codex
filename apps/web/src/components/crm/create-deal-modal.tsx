'use client';

import { useEffect, useState } from 'react';
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
import { useContacts } from '@/hooks/use-contacts';
import { usePipelines } from '@/hooks/use-pipelines';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

interface DealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    deal?: any; // If provided, we are editing
    defaultCompanyId?: string;
}

export function DealModal({ isOpen, onClose, onSuccess, deal, defaultCompanyId }: DealModalProps) {
    const { companies } = useCompanies();
    const { contacts } = useContacts();
    const { stages } = usePipelines();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyId, setCompanyId] = useState('');
    const [contactId, setContactId] = useState('none');
    const [stageName, setStageName] = useState('Lead');
    const [dealName, setDealName] = useState('');
    const [dealValue, setDealValue] = useState('');
    const [closeDate, setCloseDate] = useState('');

    const isEdit = !!deal;

    useEffect(() => {
        setCompanyId(deal?.companyId || defaultCompanyId || '');
        setContactId(deal?.contactId || 'none');
        setStageName(deal?.stage || 'Lead');
        setDealName(deal?.name || '');
        setDealValue(String(deal?.value || ''));
        setCloseDate(deal?.closeDate ? new Date(deal.closeDate).toISOString().split('T')[0] : '');
    }, [deal, isOpen, defaultCompanyId]);

    const availableContacts = companyId
        ? contacts.filter((contact) => contact.companyId === companyId)
        : contacts;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            valueAmount: parseFloat(formData.get('value') as string) || 0,
            stageName,
            closeDate: formData.get('expectedCloseDate') as string,
            companyId: companyId || deal?.companyId || undefined,
            contactId: contactId !== 'none' ? contactId : undefined,
        };

        try {
            const url = isEdit ? `/crm/deals/${deal.id}` : '/crm/deals';

            const method = isEdit ? 'PUT' : 'POST';

            await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            toast({
                title: `Deal ${isEdit ? 'Updated' : 'Created'}`,
                description: `${data.name} has been ${isEdit ? 'updated' : 'added to the pipeline'}.`,
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'creating'} deal:`, error);
            toast({
                title: 'Error',
                description: getErrorMessage(
                    error,
                    `Could not ${isEdit ? 'update' : 'create'} deal.`,
                ),
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
                    <div className="rounded-none border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                        Create a pipeline opportunity that reflects a real commercial motion: account, value, stage, owner contact, and expected close.
                    </div>
                    {!isEdit && (
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setDealName('Folga Expansion Rollout');
                                    setDealValue('18000');
                                    setStageName('Qualified');
                                    setCloseDate('2026-08-14');
                                }}
                            >
                                Use FOLGA deal example
                            </Button>
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={dealName}
                            onChange={(e) => setDealName(e.target.value)}
                            placeholder="Folga Expansion Rollout"
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="company" className="text-right">Company</Label>
                        <div className="col-span-3">
                            <Select value={companyId} onValueChange={setCompanyId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">Value ($)</Label>
                        <Input
                            id="value"
                            name="value"
                            type="number"
                            value={dealValue}
                            onChange={(e) => setDealValue(e.target.value)}
                            placeholder="18000"
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact" className="text-right">Contact</Label>
                        <div className="col-span-3">
                            <Select value={contactId} onValueChange={setContactId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select contact (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No primary contact</SelectItem>
                                    {availableContacts.map((contact) => (
                                        <SelectItem key={contact.id} value={contact.id}>
                                            {contact.name || contact.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stage" className="text-right">Stage</Label>
                        <div className="col-span-3">
                            <Select value={stageName} onValueChange={setStageName}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map(stage => (
                                        <SelectItem key={stage.id} value={stage.name}>{stage.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expectedCloseDate" className="text-right">Close Date</Label>
                        <Input
                            id="expectedCloseDate"
                            name="expectedCloseDate"
                            type="date"
                            value={closeDate}
                            onChange={(e) => setCloseDate(e.target.value)}
                            className="col-span-3"
                            required
                        />
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
