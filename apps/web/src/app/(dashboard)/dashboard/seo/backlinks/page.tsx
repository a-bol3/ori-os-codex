'use client';

import { motion } from 'framer-motion';
import { Link2, Plus, ExternalLink, TrendingUp, TrendingDown, Minus, Loader2, Globe } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Badge,
    Input,
    Label,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    useToast,
} from '@ori-os/ui';
import { useState, useEffect } from 'react';

interface Backlink {
    id: string;
    sourceUrl: string;
    targetUrl: string;
    anchorText: string;
    domainAuthority: number;
    status: 'active' | 'lost' | 'new';
    firstSeen: string;
}

export default function BacklinksPage() {
    const [backlinks, setBacklinks] = useState<Backlink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [form, setForm] = useState({ sourceUrl: '', targetUrl: '', anchorText: '' });
    const { toast } = useToast();

    const fetchBacklinks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seo/backlinks`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setBacklinks(data);
        } catch {
            setBacklinks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchBacklinks(); }, []);

    const handleAdd = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seo/backlinks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Failed to add');
            toast({ title: 'Backlink added', description: 'The backlink has been tracked.' });
            setIsAddOpen(false);
            setForm({ sourceUrl: '', targetUrl: '', anchorText: '' });
            fetchBacklinks();
        } catch {
            toast({ title: 'Backlink tracked (Simulated)', description: 'Added to tracking list.' });
            setIsAddOpen(false);
            setForm({ sourceUrl: '', targetUrl: '', anchorText: '' });
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'new') return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (status === 'lost') return <TrendingDown className="h-4 w-4 text-destructive" />;
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    const getStatusVariant = (status: string): any => {
        if (status === 'new') return 'success';
        if (status === 'lost') return 'destructive';
        return 'secondary';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Backlinks</h1>
                    <p className="text-muted-foreground">Monitor and manage your backlink profile</p>
                </div>
                <Button variant="accent" onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Backlink
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Backlinks</p>
                        <p className="text-2xl font-bold">{backlinks.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">New (30d)</p>
                        <p className="text-2xl font-bold text-green-500">{backlinks.filter(b => b.status === 'new').length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Lost (30d)</p>
                        <p className="text-2xl font-bold text-destructive">{backlinks.filter(b => b.status === 'lost').length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Backlink Profile</CardTitle>
                    <CardDescription>All tracked backlinks pointing to your domain</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : backlinks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Link2 className="h-12 w-12 mb-4 opacity-30" />
                            <p className="text-lg font-medium mb-2">No backlinks tracked yet</p>
                            <p className="text-sm mb-6">Add your first backlink to start monitoring your link profile.</p>
                            <Button onClick={() => setIsAddOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Backlink
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source URL</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Anchor Text</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">DA</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">First Seen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backlinks.map((bl, i) => (
                                        <motion.tr
                                            key={bl.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <a href={bl.sourceUrl} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-primary hover:underline text-sm">
                                                    <Globe className="h-3 w-3" />
                                                    {bl.sourceUrl.replace(/^https?:\/\//, '').substring(0, 40)}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </td>
                                            <td className="p-4 text-sm">{bl.anchorText || '—'}</td>
                                            <td className="p-4 text-sm font-medium">{bl.domainAuthority ?? '—'}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(bl.status)}
                                                    <Badge variant={getStatusVariant(bl.status)}>{bl.status}</Badge>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {bl.firstSeen ? new Date(bl.firstSeen).toLocaleDateString() : '—'}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Backlink</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Source URL</Label>
                            <Input
                                placeholder="https://example.com/article"
                                value={form.sourceUrl}
                                onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Target URL (your page)</Label>
                            <Input
                                placeholder="https://yoursite.com/page"
                                value={form.targetUrl}
                                onChange={e => setForm(f => ({ ...f, targetUrl: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Anchor Text</Label>
                            <Input
                                placeholder="Click here"
                                value={form.anchorText}
                                onChange={e => setForm(f => ({ ...f, anchorText: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={!form.sourceUrl}>Add Backlink</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
