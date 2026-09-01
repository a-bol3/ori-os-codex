
'use client';

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@ori-os/ui';
import { Plus, Mail, Play, Pause, BarChart3, Users, MoreVertical, Edit, Copy, Trash2, Eye, Loader, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEngagement } from '@/hooks/use-engagement';
import { useToast } from '@ori-os/ui';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

type CampaignAction = 'launch' | 'pause' | 'resume';
type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export default function EngagementDashboard() {
    const { campaigns, isLoading, error, refresh } = useEngagement();
    const { toast } = useToast();

    const activeCampaigns = campaigns.filter(c => c.status === 'RUNNING');
    const draftCampaigns = campaigns.filter(c => c.status === 'DRAFT');
    const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipients || 0), 0);
    const totalReplies = campaigns.reduce((sum, c) => sum + (c.replies || 0), 0);

    const getPrimaryAction = (status: CampaignStatus): CampaignAction | null => {
        if (status === 'RUNNING') return 'pause';
        if (status === 'PAUSED') return 'resume';
        if (status === 'DRAFT' || status === 'SCHEDULED') return 'launch';
        return null;
    };

    const getStatusBadgeVariant = (status: CampaignStatus) => {
        if (status === 'RUNNING') return 'default';
        if (status === 'PAUSED') return 'secondary';
        if (status === 'DRAFT') return 'outline';
        return 'secondary';
    };

    const getCampaignReadinessLabel = (campaign: { recipients: number; status: CampaignStatus }) => {
        if (campaign.recipients === 0) return 'Needs audience';
        if (campaign.status === 'DRAFT') return 'Ready to review';
        if (campaign.status === 'SCHEDULED') return 'Scheduled to launch';
        if (campaign.status === 'PAUSED') return 'Paused manually';
        if (campaign.status === 'RUNNING') return 'Delivering now';
        return 'Completed';
    };

    const toggleStatus = async (id: string, currentStatus: CampaignStatus) => {
        try {
            const action = getPrimaryAction(currentStatus);

            if (!action) {
                return;
            }

            if (action === 'launch') {
                await apiFetch(`/engagement/campaigns/${id}/launch`, {
                    method: 'POST',
                });
            } else {
                await apiFetch(`/engagement/campaigns/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: action === 'pause' ? 'PAUSED' : 'RUNNING',
                    }),
                });
            }

            toast({
                title:
                    action === 'launch'
                        ? 'Campaign launched'
                        : action === 'resume'
                            ? 'Campaign resumed'
                            : 'Campaign paused',
            });
            refresh();
        } catch (error) {
            toast({
                title: 'Could not update campaign',
                description: getErrorMessage(error, 'Could not update the campaign status.'),
                variant: 'destructive',
            });
        }
    };

    const deleteCampaign = async (id: string) => {
        if (!confirm('Delete this campaign?')) return;
        try {
            await apiFetch(`/engagement/campaign?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
            toast({ title: 'Campaign deleted' });
            refresh();
        } catch (error) {
            toast({
                title: 'Could not delete campaign',
                description: getErrorMessage(error, 'Could not delete the campaign.'),
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
                        <p className="mb-2 text-lg font-medium">Campaign data is unavailable</p>
                        <p className="mb-6 max-w-md text-sm text-muted-foreground">{error}</p>
                        <Button onClick={refresh}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Engagement & Campaigns</h1>
                    <p className="text-muted-foreground">Manage your outreach sequences and monitor performance.</p>
                </div>
                <Link href="/dashboard/engagement/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Campaign
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Active Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCampaigns.length}</div>
                        <p className="text-xs text-muted-foreground">{campaigns.length} total campaigns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRecipients.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Across all campaigns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Replies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReplies}</div>
                        <p className="text-xs text-muted-foreground">In the last 7 days</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Campaigns</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="drafts">Drafts</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                    {campaigns.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Mail className="h-12 w-12 mb-4 opacity-30" />
                                <p className="text-lg font-medium mb-2">No campaigns yet</p>
                                <p className="text-sm mb-6">Create your first campaign to start engaging your audience.</p>
                                <Link href="/dashboard/engagement/new">
                                    <Button><Plus className="mr-2 h-4 w-4" />New Campaign</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {campaigns.map((campaign) => (
                                <Card key={campaign.id} className="relative overflow-hidden">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    <Link
                                                        href={`/dashboard/engagement/campaigns/${campaign.id}`}
                                                        className="flex items-center transition-colors hover:text-primary"
                                                    >
                                                        <Mail className="mr-2 h-4 w-4 text-primary" />
                                                        {campaign.name}
                                                    </Link>
                                                </CardTitle>
                                                <CardDescription>
                                                    {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'Draft'}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={campaign.status === 'RUNNING' ? 'default' : 'secondary'}>
                                                    {campaign.status}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/engagement/campaigns/${campaign.id}`} className="flex items-center">
                                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/engagement/campaigns/${campaign.id}/edit`} className="flex items-center">
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Campaign
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => deleteCampaign(campaign.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Recipients</p>
                                                <p className="text-sm font-semibold">{campaign.recipients}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Sent</p>
                                                <p className="text-sm font-semibold">{campaign.sent}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Replies</p>
                                                <p className="text-sm font-semibold">{campaign.replies}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Open Rate</p>
                                                <p className="text-sm font-semibold">{campaign.openRate}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Badge variant="outline">{getCampaignReadinessLabel(campaign)}</Badge>
                                            {campaign.objective ? (
                                                <span className="text-xs text-muted-foreground">
                                                    Objective: {campaign.objective}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    Add an objective to make reporting clearer later.
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/30 pt-3 border-t flex justify-between">
                                        <div className="flex space-x-2">
                                            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" asChild>
                                                <Link href={`/dashboard/engagement/campaigns/${campaign.id}?tab=analytics`}>
                                                    <BarChart3 className="mr-2 h-3 w-3" /> Analytics
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" asChild>
                                                <Link href={`/dashboard/engagement/campaigns/${campaign.id}?tab=people`}>
                                                    <Users className="mr-2 h-3 w-3" /> People
                                                </Link>
                                            </Button>
                                        </div>
                                        <div className="flex space-x-2">
                                            {getPrimaryAction(campaign.status) === 'launch' ? (
                                                <Link href={`/dashboard/engagement/campaigns/${campaign.id}/schedule`}>
                                                    <Button size="sm" className="h-8 text-xs">Edit & Schedule</Button>
                                                </Link>
                                            ) : campaign.status === 'PAUSED' ? (
                                                <Button size="sm" className="h-8 text-xs" onClick={() => toggleStatus(campaign.id, campaign.status)}>
                                                    <Play className="mr-2 h-3 w-3" /> Resume
                                                </Button>
                                            ) : campaign.status === 'RUNNING' ? (
                                                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toggleStatus(campaign.id, campaign.status)}>
                                                    <Pause className="mr-2 h-3 w-3" /> Pause
                                                </Button>
                                            ) : null}
                                            {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') && (
                                                <Button size="sm" className="h-8 text-xs" onClick={() => toggleStatus(campaign.id, campaign.status)}>
                                                    <Play className="mr-2 h-3 w-3" /> Launch
                                                </Button>
                                            )}
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="active" className="space-y-4">
                    <div className="grid gap-4">
                        {activeCampaigns.length === 0 ? (
                            <Card>
                                <CardContent className="py-10 text-center text-muted-foreground">
                                    <p className="text-base font-medium text-foreground">No active campaigns right now</p>
                                    <p className="mt-2 text-sm">Launch a draft or resume a paused sequence when you are ready to send.</p>
                                </CardContent>
                            </Card>
                        ) : activeCampaigns.map((campaign) => (
                            <Card key={campaign.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                                        <Badge variant={getStatusBadgeVariant(campaign.status)}>{campaign.status}</Badge>
                                    </div>
                                    <CardDescription>{getCampaignReadinessLabel(campaign)}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="drafts" className="space-y-4">
                    <div className="grid gap-4">
                        {draftCampaigns.length === 0 ? (
                            <Card>
                                <CardContent className="py-10 text-center text-muted-foreground">
                                    <p className="text-base font-medium text-foreground">No draft campaigns</p>
                                    <p className="mt-2 text-sm">When we create new outreach flows, unfinished work will stay here until it is ready to launch.</p>
                                </CardContent>
                            </Card>
                        ) : draftCampaigns.map((campaign) => (
                            <Card key={campaign.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                                        <Badge variant={getStatusBadgeVariant(campaign.status)}>{campaign.status}</Badge>
                                    </div>
                                    <CardDescription>{getCampaignReadinessLabel(campaign)}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
