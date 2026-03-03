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
    Textarea,
} from '@ori-os/ui';
import { useToast } from '@ori-os/ui';

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    company?: any; // If provided, we are editing
}

export function CompanyModal({ isOpen, onClose, onSuccess, company }: CompanyModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const isEdit = !!company;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            domain: formData.get('domain'),
            industry: formData.get('industry'),
            size: formData.get('size'),
            location: formData.get('location'),
            description: formData.get('description'),
        };

        try {
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/crm/companies/${company.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/crm/companies`;

            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} company`);

            toast({
                title: `Company ${isEdit ? 'updated' : 'created'}`,
                description: `${data.name} has been ${isEdit ? 'updated' : 'added'} to your CRM.`,
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'creating'} company:`, error);
            toast({
                title: 'Error',
                description: `Could not ${isEdit ? 'update' : 'create'} company.`,
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
                    <DialogTitle>{isEdit ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input id="name" name="name" defaultValue={company?.name || ''} placeholder="e.g. Acme Corp" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input id="domain" name="domain" defaultValue={company?.domain || ''} placeholder="acme.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input id="industry" name="industry" defaultValue={company?.industry || ''} placeholder="Software" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="size">Size</Label>
                            <Input id="size" name="size" defaultValue={company?.size || ''} placeholder="11-50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" name="location" defaultValue={company?.location || ''} placeholder="New York, NY" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={company?.description || ''} placeholder="Short description..." />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="accent" disabled={isLoading}>
                            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Company')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
