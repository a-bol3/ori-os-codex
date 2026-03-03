'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Label } from '@ori-os/ui';
import { Plus, TrendingUp, Users } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Competitor {
    id: string;
    name: string;
    domain: string;
    description?: string;
    createdAt: string;
}

export default function CompetitorsPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCompetitor, setNewCompetitor] = useState({
        name: '',
        domain: '',
        description: '',
    });

    useEffect(() => {
        fetchCompetitors();
    }, [projectId]);

    const fetchCompetitors = async () => {
        try {
            const response = await fetch(`/api/seo/projects/${projectId}/competitors`);
            if (response.ok) {
                const data = await response.json();
                setCompetitors(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch competitors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCompetitor = async () => {
        try {
            const response = await fetch(`/api/seo/projects/${projectId}/competitors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newCompetitor, projectId }),
            });

            if (response.ok) {
                setShowAddModal(false);
                setNewCompetitor({ name: '', domain: '', description: '' });
                fetchCompetitors();
            }
        } catch (error) {
            console.error('Failed to add competitor:', error);
        }
    };

    const handleCheckCompetitor = async (competitorId: string) => {
        try {
            await fetch(`/api/seo/projects/${projectId}/competitors/${competitorId}/check`, {
                method: 'POST',
            });
            alert('Competitor rank check queued!');
        } catch (error) {
            console.error('Failed to check competitor:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">Loading competitors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Competitor Tracking</h1>
                    <p className="text-muted-foreground mt-1">Monitor your competitors' SEO performance</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Competitor
                </Button>
            </div>

            {/* Add Competitor Modal */}
            {showAddModal && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Add New Competitor</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Competitor Name</Label>
                            <Input
                                id="name"
                                placeholder="Competitor Inc."
                                value={newCompetitor.name}
                                onChange={(e) =>
                                    setNewCompetitor({ ...newCompetitor, name: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="domain">Website Domain</Label>
                            <Input
                                id="domain"
                                type="url"
                                placeholder="https://competitor.com"
                                value={newCompetitor.domain}
                                onChange={(e) =>
                                    setNewCompetitor({ ...newCompetitor, domain: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                placeholder="Main competitor in the market"
                                value={newCompetitor.description}
                                onChange={(e) =>
                                    setNewCompetitor({ ...newCompetitor, description: e.target.value })
                                }
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleAddCompetitor} className="flex-1">
                                Add Competitor
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Competitors List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Competitors ({competitors.length})</h2>
                {competitors.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Competitors Added</h3>
                        <p className="text-muted-foreground mb-4">
                            Add your competitors to track their SEO performance and compare with your site
                        </p>
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Competitor
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {competitors.map((competitor) => (
                            <Card key={competitor.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-1">{competitor.name}</h3>
                                        <a
                                            href={competitor.domain}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {competitor.domain}
                                        </a>
                                        {competitor.description && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {competitor.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Tracking since:</span>
                                        <span className="font-medium">
                                            {new Date(competitor.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleCheckCompetitor(competitor.id)}
                                    >
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Check Rankings
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
