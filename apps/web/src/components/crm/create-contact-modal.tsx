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
} from '@ori-os/ui';
import { useToast } from '@ori-os/ui';
import { apiFetch, getErrorMessage } from '@/lib/api-client';
import { useCompanies } from '@/hooks/use-companies';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contact?: any; // If provided, we are editing
    defaultCompanyId?: string;
}

export function ContactModal({ isOpen, onClose, onSuccess, contact, defaultCompanyId }: ContactModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { companies } = useCompanies();
    const [formState, setFormState] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        country: '',
        companyId: '',
    });

    const isEdit = !!contact;

    useEffect(() => {
        if (!isOpen) return;
        setFormState({
            firstName: contact?.firstName || contact?.name?.split(' ')[0] || '',
            lastName: contact?.lastName || contact?.name?.split(' ').slice(1).join(' ') || '',
            email: contact?.email || '',
            phone: contact?.phone || '',
            jobTitle: contact?.jobTitle || '',
            country: contact?.country || '',
            companyId: contact?.companyId || defaultCompanyId || '',
        });
    }, [contact, defaultCompanyId, isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const companyId = formData.get('companyId');
        const data = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            jobTitle: formData.get('jobTitle') as string,
            country: formData.get('country') as string,
            companyId: companyId ? String(companyId) : undefined,
        };

        try {
            const url = isEdit ? `/crm/contacts/${contact.id}` : '/crm/contacts';

            const method = isEdit ? 'PUT' : 'POST';

            await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            toast({
                title: `Contact ${isEdit ? 'updated' : 'created'}`,
                description: `${data.firstName} ${data.lastName} has been ${isEdit ? 'updated' : 'added'}.`,
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'creating'} contact:`, error);
            toast({
                title: 'Error',
                description: getErrorMessage(
                    error,
                    `Could not ${isEdit ? 'update' : 'create'} contact.`,
                ),
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="rounded-none border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                        Add the contact the way your team would work it in real life: role, direct email, market, and linked company.
                    </div>
                    {!isEdit && (
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setFormState((current) => ({
                                        ...current,
                                        firstName: 'Anna',
                                        lastName: 'Kowalska',
                                        email: 'anna.kowalska@folga.com.pl',
                                        phone: '+48 500 100 200',
                                        jobTitle: 'HR Manager',
                                        country: 'Poland',
                                        companyId: current.companyId || defaultCompanyId || '',
                                    }))
                                }
                            >
                                Use Anna example
                            </Button>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={formState.firstName}
                                onChange={(e) => setFormState((current) => ({ ...current, firstName: e.target.value }))}
                                placeholder="Anna"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={formState.lastName}
                                onChange={(e) => setFormState((current) => ({ ...current, lastName: e.target.value }))}
                                placeholder="Kowalska"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState((current) => ({ ...current, email: e.target.value }))}
                            placeholder="anna.kowalska@folga.com.pl"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                            id="jobTitle"
                            name="jobTitle"
                            value={formState.jobTitle}
                            onChange={(e) => setFormState((current) => ({ ...current, jobTitle: e.target.value }))}
                            placeholder="HR Manager"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formState.phone}
                                onChange={(e) => setFormState((current) => ({ ...current, phone: e.target.value }))}
                                placeholder="+48 500 100 200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                name="country"
                                value={formState.country}
                                onChange={(e) => setFormState((current) => ({ ...current, country: e.target.value }))}
                                placeholder="Poland"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyId">Company</Label>
                        <select
                            id="companyId"
                            name="companyId"
                            value={formState.companyId}
                            onChange={(e) => setFormState((current) => ({ ...current, companyId: e.target.value }))}
                            className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Select a company</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="accent" disabled={isLoading}>
                            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Contact')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
