'use client';

import { useState, useEffect } from 'react';
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
import { useCompanies } from '@/hooks/use-companies';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contact?: any; // If provided, we are editing
}

export function ContactModal({ isOpen, onClose, onSuccess, contact }: ContactModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { companies } = useCompanies();

    const isEdit = !!contact;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const orgId = formData.get('organizationId');
        const data = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            jobTitle: formData.get('jobTitle') as string,
            organizationId: orgId ? orgId : undefined,
        };

        try {
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/crm/contacts/${contact.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/crm/contacts`;

            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} contact`);

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
                description: `Could not ${isEdit ? 'update' : 'create'} contact.`,
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" name="firstName" defaultValue={contact?.firstName || contact?.name?.split(' ')[0] || ''} placeholder="John" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" name="lastName" defaultValue={contact?.lastName || contact?.name?.split(' ')[1] || ''} placeholder="Doe" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" defaultValue={contact?.email || ''} placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input id="jobTitle" name="jobTitle" defaultValue={contact?.jobTitle || ''} placeholder="Manager" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="organizationId">Company</Label>
                        <select
                            id="organizationId"
                            name="organizationId"
                            defaultValue={contact?.organizationId || ''}
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
