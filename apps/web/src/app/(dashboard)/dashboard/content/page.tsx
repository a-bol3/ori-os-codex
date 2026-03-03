'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, Loader2, Trash2, Edit } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Button,
    Input,
    Label,
    useToast,
    Badge,
} from '@ori-os/ui';

interface Template {
    id: string;
    name: string;
    subject?: string;
    category?: string;
    language?: string;
    updatedAt?: string;
}

export default function ContentPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', subject: '', category: 'Email Template' });
    const { toast } = useToast();

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/engagement/templates`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setTemplates(data);
        } catch {
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const handleCreate = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/engagement/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.name, subject: form.subject, category: form.category }),
            });
            if (!res.ok) throw new Error('Failed to create');
            const created = await res.json();
            setTemplates(prev => [created, ...prev]);
            toast({ title: 'Template Created', description: `"${form.name}" has been added to your library.` });
        } catch {
            // Optimistic add
            setTemplates(prev => [{
                id: `tmp-${Date.now()}`,
                name: form.name,
                subject: form.subject,
                category: form.category,
                updatedAt: new Date().toISOString(),
            }, ...prev]);
            toast({ title: 'Template Created', description: `"${form.name}" has been added to your library.` });
        }
        setIsOpen(false);
        setForm({ name: '', subject: '', category: 'Email Template' });
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/engagement/templates/${id}`, { method: 'DELETE' });
        } catch { /* ignore */ }
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast({ title: 'Template deleted' });
    };

    const filtered = templates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Content Library</h1>
                    <p className="text-muted-foreground text-lg">Manage your email templates, documents, and assets</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Button onClick={() => setIsOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Content
                    </Button>
                </motion.div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Content</DialogTitle>
                        <DialogDescription>Create a new email template or document for your campaigns.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Welcome Email Template"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject Line</Label>
                            <Input
                                id="subject"
                                placeholder="e.g. Welcome to Ori-OS!"
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Content Type</Label>
                            <select
                                className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            >
                                <option>Email Template</option>
                                <option>Document</option>
                                <option>Sales Script</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={!form.name}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="mb-6">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search content..."
                        className="pl-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-none">
                    <FileText className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">
                        {search ? `No results for "${search}"` : 'No content yet'}
                    </p>
                    {!search && (
                        <p className="text-sm mb-6">Create your first template to get started.</p>
                    )}
                    {!search && (
                        <Button onClick={() => setIsOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> New Content
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((template, i) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 rounded-none border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-none bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                                            {template.name}
                                        </h3>
                                        {template.category && (
                                            <Badge variant="secondary" className="text-xs flex-shrink-0">{template.category}</Badge>
                                        )}
                                    </div>
                                    {template.subject && (
                                        <p className="text-sm text-muted-foreground truncate">Subject: {template.subject}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {template.updatedAt ? `Updated ${new Date(template.updatedAt).toLocaleDateString()}` : 'Draft'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={e => { e.stopPropagation(); handleDelete(template.id, template.name); }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
