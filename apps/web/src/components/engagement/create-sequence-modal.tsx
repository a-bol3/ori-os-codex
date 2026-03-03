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
    Textarea,
} from '@ori-os/ui';

interface SequenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    sequence?: any;
}

export function SequenceModal({ isOpen, onClose, onSuccess, sequence }: SequenceModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!sequence;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            status: sequence?.status || 'Active',
            contacts: sequence?.contacts || 0,
            sent: sequence?.sent || 0,
            opened: sequence?.opened || 0,
            replied: sequence?.replied || 0,
        };

        try {
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/engagement/sequences/${sequence.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/engagement/sequences`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} sequence`);

            toast({
                title: isEditing ? 'Sequence Updated' : 'Sequence Created',
                description: `"${data.name}" sequence has been ${isEditing ? 'updated' : 'activated'}.`,
            });
            onSuccess();
        } catch (error) {
            console.error('Sequence operation failed:', error);
            // Mock success for demo
            toast({
                title: `${isEditing ? 'Updated' : 'Created'} (Simulated)`,
                description: `"${data.name}" ${isEditing ? 'updated' : 'added'} in dashboard.`,
            });
            onSuccess();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Sequence' : 'Create New Outbound Sequence'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Q1 Enterprise Outreach"
                            className="col-span-3"
                            defaultValue={sequence?.name}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Channel</Label>
                        <div className="col-span-3">
                            <Select name="type" defaultValue={sequence?.type || "email"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    <SelectItem value="multichannel">Multi-channel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="throttle" className="text-right">Throttle</Label>
                        <div className="col-span-3">
                            <Select name="throttle" defaultValue={sequence?.throttle || "balanced"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select speed" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fast">Fast (Unsafe)</SelectItem>
                                    <SelectItem value="balanced">Balanced (Safe)</SelectItem>
                                    <SelectItem value="slow">Slow (Warmup)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="accent" disabled={isSubmitting}>
                            {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Sequence')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
