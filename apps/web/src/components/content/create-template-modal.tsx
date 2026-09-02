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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@ori-os/ui';
import { Sparkles, Mail, FileText, Loader2 } from 'lucide-react';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    template?: any;
}

export function TemplateModal({ isOpen, onClose, onSuccess, template }: TemplateModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [content, setContent] = useState(template?.content || '');

    const isEditing = !!template;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            content: content,
            status: template?.status || 'Draft',
            uses: template?.uses || 0,
        };

        try {
            const url = isEditing
                ? `/content/templates/${template.id}`
                : '/content/templates';

            const method = isEditing ? 'PUT' : 'POST';

            await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            toast({
                title: isEditing ? 'Template Updated' : 'Template Created',
                description: `"${data.name}" has been saved.`,
            });
            onSuccess();
        } catch (error) {
            console.error('Template operation failed:', error);
            toast({
                title: `${isEditing ? 'Template update' : 'Template creation'} failed`,
                description: getErrorMessage(error, 'The template could not be saved.'),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Welcome Email Refined"
                            className="col-span-3"
                            defaultValue={template?.name}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <div className="col-span-3">
                            <Select name="type" defaultValue={template?.type || "Email"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Email">Email Template</SelectItem>
                                    <SelectItem value="Social">Social Post</SelectItem>
                                    <SelectItem value="Landing">Landing Page Section</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            placeholder="Enter your template content here..."
                            className="min-h-[200px]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="accent" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Template')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
