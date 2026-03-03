'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Label, Badge } from '@ori-os/ui';
import { Plus, ExternalLink, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Backlink {
    id: string;
    sourceUrl: string;
    targetUrl: string;
    linkType: 'dofollow' | 'nofollow';
    domainAuthority: number;
    anchorText: string;
    status: 'active' | 'lost' | 'broken';
    firstSeen: string;
    lastChecked: string;
}

export default function BacklinksPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [backlinks, setBacklinks] = useState<Backlink[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBacklink, setNewBacklink] = useState({
        sourceUrl: '',
        targetUrl: '',
        anchorText: '',
        domainAuthority: 0,
        linkType: 'dofollow' as const,
    });

    useEffect(() => {
        fetchBacklinks();
    }, [projectId]);

    const fetchBacklinks = async () => {
        try {
            const response = await fetch(`/api/seo/projects/${projectId}/backlinks`);
            if (response.ok) {
                const data = await response.json();
                setBacklinks(data.data || []);
                setStats(data.stats || {});
            }
        } catch (error) {
            console.error('Failed to fetch backlinks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBacklink = async () => {
        try {
            const response = await fetch(`/api/seo/projects/${projectId}/backlinks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newBacklink, projectId }),
            });

            if (response.ok) {
                setShowAddModal(false);
                setNewBacklink({
                    sourceUrl: '',
                    targetUrl: '',
                    anchorText: '',
                    domainAuthority: 0,
                    linkType: 'dofollow',
                });
                fetchBacklinks();
            }
        } catch (error) {
            console.error('Failed to add backlink:', error);
        }
    };

    const statusConfig = {
        active: { label: 'Active', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
        lost: { label: 'Lost', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
        broken: { label: 'Broken', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">Loading backlinks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Backlinks</h1>
                    <p className="text-muted-foreground mt-1">Monitor and manage your backlink profile</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Backlink
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Backlinks</p>
                        <p className="text-3xl font-bold">{stats.total || 0}</p>
                    </Card>
                    <Card className="p-4 bg-green-50 dark:bg-green-950">
                        <p className="text-sm text-muted-foreground mb-1">Active</p>
                        <p className="text-3xl font-bold text-green-600">{stats.active || 0}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Dofollow</p>
                        <p className="text-3xl font-bold">{stats.dofollow || 0}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Avg. Domain Authority</p>
                        <p className="text-3xl font-bold">{stats.avgDomainAuthority || 0}</p>
                    </Card>
                </div>
            )}

            {/* Add Backlink Modal */}
            {showAddModal && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Add New Backlink</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="sourceUrl">Source URL</Label>
                            <Input
                                id="sourceUrl"
                                type="url"
                                placeholder="https://referring-site.com/page"
                                value={newBacklink.sourceUrl}
                                onChange={(e) =>
                                    setNewBacklink({ ...newBacklink, sourceUrl: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="targetUrl">Target URL (Your Page)</Label>
                            <Input
                                id="targetUrl"
                                type="url"
                                placeholder="https://your-site.com/page"
                                value={newBacklink.targetUrl}
                                onChange={(e) =>
                                    setNewBacklink({ ...newBacklink, targetUrl: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="anchorText">Anchor Text</Label>
                            <Input
                                id="anchorText"
                                placeholder="Click here"
                                value={newBacklink.anchorText}
                                onChange={(e) =>
                                    setNewBacklink({ ...newBacklink, anchorText: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="domainAuthority">Domain Authority (0-100)</Label>
                            <Input
                                id="domainAuthority"
                                type="number"
                                min="0"
                                max="100"
                                value={newBacklink.domainAuthority}
                                onChange={(e) =>
                                    setNewBacklink({
                                        ...newBacklink,
                                        domainAuthority: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleAddBacklink} className="flex-1">
                                Add Backlink
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Backlinks List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Backlinks</h2>
                {backlinks.length === 0 ? (
                    <Card className="p-12 text-center">
                        <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Backlinks Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Add your first backlink to start monitoring your link profile
                        </p>
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Backlink
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {backlinks.map((backlink) => (
                            <Card key={backlink.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge
                                                variant="outline"
                                                className={statusConfig[backlink.status].className}
                                            >
                                                {statusConfig[backlink.status].label}
                                            </Badge>
                                            <Badge variant="outline">
                                                {backlink.linkType}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                DA: {backlink.domainAuthority}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">From:</span>
                                                <a
                                                    href={backlink.sourceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    {backlink.sourceUrl}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">To:</span>
                                                <span className="text-sm">{backlink.targetUrl}</span>
                                            </div>
                                            {backlink.anchorText && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">Anchor:</span>
                                                    <span className="text-sm font-medium">"{backlink.anchorText}"</span>
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                First seen: {new Date(backlink.firstSeen).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
