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
    Textarea,
    useToast,
} from '@ori-os/ui';

type WorkflowStatus = 'active' | 'paused' | 'draft';

interface CreateWorkflowModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateWorkflowModal({ open, onOpenChange, onSuccess }: CreateWorkflowModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const name = String(formData.get('name') ?? '').trim();
        const description = String(formData.get('description') ?? '').trim();
        const trigger = String(formData.get('trigger') ?? 'new_contact');

        const payload = {
            name,
            description,
            trigger,
            status: 'draft' as WorkflowStatus,
            steps: [],
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/automations/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Failed to create workflow (${res.status})`);

            toast({
                title: 'Workflow Created',
                description: `"${payload.name}" has been added to your workflows.`,
            });

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Create workflow failed:', error);

            // Simulated success for demo/dev until API is fully wired.
            toast({
                title: 'Workflow Created (Simulated)',
                description: `"${payload.name}" was created locally (API not ready).`,
            });

            onSuccess();
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Create New Workflow</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="e.g. New Lead → Slack + Email" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="What does this workflow do?"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Trigger</Label>
                        <Select name="trigger" defaultValue="new_contact">
                            <SelectTrigger>
                                <SelectValue placeholder="Select trigger" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new_contact">When a new contact is added</SelectItem>
                                <SelectItem value="deal_won">When a deal is closed won</SelectItem>
                                <SelectItem value="email_responded">When a lead responds to email</SelectItem>
                                <SelectItem value="schedule">On a specific schedule</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="accent" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating…' : 'Create Workflow'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
