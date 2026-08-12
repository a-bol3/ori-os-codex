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

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    company?: any; // If provided, we are editing
}

export function CompanyModal({ isOpen, onClose, onSuccess, company }: CompanyModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [formState, setFormState] = useState({
        name: '',
        website: '',
        domain: '',
        industry: '',
        sizeBand: '',
        city: '',
        country: '',
        linkedinUrl: '',
    });

    const isEdit = !!company;

    useEffect(() => {
        if (!isOpen) return;
        setFormState({
            name: company?.name || '',
            website: company?.website || '',
            domain: company?.domain || '',
            industry: company?.industry || '',
            sizeBand: company?.sizeBand || company?.size || '',
            city: company?.city || company?.location?.split(',')[0]?.trim() || '',
            country: company?.country || company?.location?.split(',').slice(1).join(',').trim() || '',
            linkedinUrl: company?.linkedinUrl || '',
        });
    }, [company, isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: String(formData.get('name') || ''),
            website: String(formData.get('website') || '') || undefined,
            domain: String(formData.get('domain') || '') || undefined,
            industry: String(formData.get('industry') || '') || undefined,
            sizeBand: String(formData.get('sizeBand') || '') || undefined,
            city: String(formData.get('city') || '') || undefined,
            country: String(formData.get('country') || '') || undefined,
            linkedinUrl: String(formData.get('linkedinUrl') || '') || undefined,
        };

        try {
            const url = isEdit ? `/crm/companies/${company.id}` : '/crm/companies';

            const method = isEdit ? 'PUT' : 'POST';

            await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

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
                description: getErrorMessage(
                    error,
                    `Could not ${isEdit ? 'update' : 'create'} company.`,
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
                    <DialogTitle>{isEdit ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="rounded-none border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                        Capture the company like a real account: legal name, website or domain, industry, size, and market.
                    </div>
                    {!isEdit && (
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setFormState({
                                        name: 'FOLGA SP. Z O.O.',
                                        website: 'https://folga.com.pl',
                                        domain: 'folga.com.pl',
                                        industry: 'HR',
                                        sizeBand: '100-150',
                                        city: 'Torun',
                                        country: 'Poland',
                                        linkedinUrl: 'https://www.linkedin.com/company/folga/',
                                    })
                                }
                            >
                                Use FOLGA example
                            </Button>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formState.name}
                            onChange={(e) => setFormState((current) => ({ ...current, name: e.target.value }))}
                            placeholder="e.g. FOLGA SP. Z O.O."
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                name="website"
                                value={formState.website}
                                onChange={(e) => setFormState((current) => ({ ...current, website: e.target.value }))}
                                placeholder="https://folga.com.pl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                name="domain"
                                value={formState.domain}
                                onChange={(e) => setFormState((current) => ({ ...current, domain: e.target.value }))}
                                placeholder="folga.com.pl"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input
                                id="industry"
                                name="industry"
                                value={formState.industry}
                                onChange={(e) => setFormState((current) => ({ ...current, industry: e.target.value }))}
                                placeholder="HR"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedinUrl">LinkedIn</Label>
                            <Input
                                id="linkedinUrl"
                                name="linkedinUrl"
                                value={formState.linkedinUrl}
                                onChange={(e) => setFormState((current) => ({ ...current, linkedinUrl: e.target.value }))}
                                placeholder="https://www.linkedin.com/company/folga/"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sizeBand">Size</Label>
                            <Input
                                id="sizeBand"
                                name="sizeBand"
                                value={formState.sizeBand}
                                onChange={(e) => setFormState((current) => ({ ...current, sizeBand: e.target.value }))}
                                placeholder="100-150"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formState.city}
                                onChange={(e) => setFormState((current) => ({ ...current, city: e.target.value }))}
                                placeholder="Torun"
                            />
                        </div>
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
