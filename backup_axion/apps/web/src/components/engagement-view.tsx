'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Send,
  Inbox,
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Globe,
  Shield,
  Zap,
  Play,
  Pause,
  Eye,
  Edit,
  Copy,
  Trash2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CounterUp } from '@/components/ui/counter-up'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { toast } from 'sonner'
import {
  useCampaigns,
  useTemplates,
  useDomains,
  useEngagementStats,
  type Campaign,
  type EmailTemplate,
  type Domain,
} from '@/hooks/use-engagement'

// Campaign Modal Component
function CampaignModal({
  open,
  onOpenChange,
  campaign,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign?: Campaign | null
  onSave: (data: Partial<Campaign>) => Promise<{ success: boolean; error?: string }>
}) {
  const [name, setName] = useState(campaign?.name || '')
  const [description, setDescription] = useState(campaign?.description || '')
  const [type, setType] = useState(campaign?.type || 'email')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Campaign name is required')
      return
    }

    setLoading(true)
    const result = await onSave({ name, description, type })
    setLoading(false)

    if (result.success) {
      toast.success(campaign ? 'Campaign updated' : 'Campaign created')
      onOpenChange(false)
      setName('')
      setDescription('')
    } else {
      toast.error(result.error || 'Failed to save campaign')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
          <DialogDescription>
            {campaign ? 'Update campaign details' : 'Create a new email campaign'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              placeholder="Enter campaign name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="multi_channel">Multi-Channel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Campaign description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-vivid-tangerine hover:bg-tangerine-dark">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {campaign ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Template Modal Component
function TemplateModal({
  open,
  onOpenChange,
  template,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: EmailTemplate | null
  onSave: (data: Partial<EmailTemplate>) => Promise<{ success: boolean; error?: string }>
}) {
  const [name, setName] = useState(template?.name || '')
  const [subject, setSubject] = useState(template?.subject || '')
  const [category, setCategory] = useState(template?.category || 'outreach')
  const [bodyHtml, setBodyHtml] = useState(template?.bodyHtml || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      toast.error('Name and subject are required')
      return
    }

    setLoading(true)
    const result = await onSave({ name, subject, category, bodyHtml })
    setLoading(false)

    if (result.success) {
      toast.success(template ? 'Template updated' : 'Template created')
      onOpenChange(false)
      setName('')
      setSubject('')
      setBodyHtml('')
    } else {
      toast.error(result.error || 'Failed to save template')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'New Template'}</DialogTitle>
          <DialogDescription>
            {template ? 'Update template details' : 'Create a new email template'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="Introduction Email"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outreach">Outreach</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="introduction">Introduction</SelectItem>
                  <SelectItem value="demo">Demo Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="Hi {{first_name}}, quick question..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              placeholder="Hi {{first_name}},&#10;&#10;I wanted to reach out..."
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-vivid-tangerine hover:bg-tangerine-dark">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {template ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Domain Modal Component
function DomainModal({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { domain: string }) => Promise<{ success: boolean; error?: string }>
}) {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!domain.trim()) {
      toast.error('Domain is required')
      return
    }

    setLoading(true)
    const result = await onSave({ domain })
    setLoading(false)

    if (result.success) {
      toast.success('Domain added. Please verify DNS records.')
      onOpenChange(false)
      setDomain('')
    } else {
      toast.error(result.error || 'Failed to add domain')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Add a new sending domain for email campaigns
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              You&apos;ll need to add DNS records to verify this domain
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-vivid-tangerine hover:bg-tangerine-dark">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Domain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Campaign Detail Modal
function CampaignDetailModal({
  open,
  onOpenChange,
  campaign,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
}) {
  if (!campaign) return null

  const openRate = campaign.deliveredCount > 0
    ? (campaign.openedCount / campaign.deliveredCount) * 100
    : 0
  const replyRate = campaign.deliveredCount > 0
    ? (campaign.repliedCount / campaign.deliveredCount) * 100
    : 0
  const clickRate = campaign.openedCount > 0
    ? (campaign.clickedCount / campaign.openedCount) * 100
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {campaign.name}
            <Badge
              variant={campaign.status === 'active' ? 'default' : 'secondary'}
              className={
                campaign.status === 'active'
                  ? 'bg-green-500 text-white'
                  : campaign.status === 'paused'
                    ? 'bg-yellow-500/20 text-yellow-600'
                    : ''
              }
            >
              {campaign.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>{campaign.description || 'No description'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold text-vivid-tangerine tabular-nums">
                  <CounterUp value={openRate} format="percentage" decimals={1} duration={1500} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Reply Rate</p>
                <p className="text-2xl font-bold text-green-500 tabular-nums">
                  <CounterUp value={replyRate} format="percentage" decimals={1} duration={1600} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold text-blue-500 tabular-nums">
                  <CounterUp value={clickRate} format="percentage" decimals={1} duration={1700} />
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-6 gap-4 text-center border p-4">
            <div>
              <p className="text-xs text-muted-foreground">Sent</p>
              <p className="font-bold tabular-nums">
                <CounterUp value={campaign.sentCount} format="number" duration={1400} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="font-bold tabular-nums">
                <CounterUp value={campaign.deliveredCount} format="number" duration={1450} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Opened</p>
              <p className="font-bold text-vivid-tangerine tabular-nums">
                <CounterUp value={campaign.openedCount} format="number" duration={1500} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clicked</p>
              <p className="font-bold tabular-nums">
                <CounterUp value={campaign.clickedCount} format="number" duration={1550} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Replied</p>
              <p className="font-bold text-green-500 tabular-nums">
                <CounterUp value={campaign.repliedCount} format="number" duration={1600} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bounced</p>
              <p className="font-bold text-red-500 tabular-nums">
                <CounterUp value={campaign.bouncedCount} format="number" duration={1650} />
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Inbox Email (mock for now)
interface InboxEmail {
  id: string
  from: string
  email: string
  subject: string
  preview: string
  time: string
  unread: boolean
  starred: boolean
}

const mockInboxEmails: InboxEmail[] = [
  {
    id: '1',
    from: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    subject: 'Re: Partnership Opportunity',
    preview: 'Hi, I wanted to follow up on our conversation about...',
    time: '10:30 AM',
    unread: true,
    starred: true,
  },
  {
    id: '2',
    from: 'Michael Chen',
    email: 'michael@startupxyz.io',
    subject: 'Demo Request',
    preview: 'We are interested in seeing a demo of your product...',
    time: '9:45 AM',
    unread: true,
    starred: false,
  },
  {
    id: '3',
    from: 'Emily Davis',
    email: 'emily@growthco.com',
    subject: 'Question about pricing',
    preview: 'Could you provide more details about your enterprise...',
    time: 'Yesterday',
    unread: false,
    starred: false,
  },
]

export function EngagementView() {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<InboxEmail | null>(null)

  // Modal states
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [domainModalOpen, setDomainModalOpen] = useState(false)
  const [campaignDetailOpen, setCampaignDetailOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)

  // Hooks
  const {
    campaigns,
    loading: campaignsLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    refetch: refetchCampaigns,
  } = useCampaigns()

  const {
    templates,
    loading: templatesLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: refetchTemplates,
  } = useTemplates(searchQuery)

  const {
    domains,
    loading: domainsLoading,
    createDomain,
    updateDomain,
    refetch: refetchDomains,
  } = useDomains()

  const { stats, loading: statsLoading, refetch: refetchStats } = useEngagementStats()

  // Handlers
  const handleCreateCampaign = async (data: Partial<Campaign>) => {
    return createCampaign(data)
  }

  const handleUpdateCampaign = async (data: Partial<Campaign>) => {
    if (!editingCampaign) return { success: false, error: 'No campaign selected' }
    return updateCampaign(editingCampaign.id, data)
  }

  const handleToggleCampaignStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    const result = await updateCampaign(campaign.id, { status: newStatus })
    if (result.success) {
      toast.success(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}`)
    }
  }

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (confirm(`Delete "${campaign.name}"? This cannot be undone.`)) {
      const result = await deleteCampaign(campaign.id)
      if (result.success) {
        toast.success('Campaign deleted')
      }
    }
  }

  const handleCreateTemplate = async (data: Partial<EmailTemplate>) => {
    return createTemplate(data as Parameters<typeof createTemplate>[0])
  }

  const handleUpdateTemplate = async (data: Partial<EmailTemplate>) => {
    if (!editingTemplate) return { success: false, error: 'No template selected' }
    return updateTemplate(editingTemplate.id, data as Parameters<typeof updateTemplate>[1])
  }

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    if (confirm(`Delete "${template.name}"? This cannot be undone.`)) {
      const result = await deleteTemplate(template.id)
      if (result.success) {
        toast.success('Template deleted')
      }
    }
  }

  const handleCreateDomain = async (data: { domain: string }) => {
    return createDomain(data)
  }

  const handleToggleWarmup = async (domain: Domain) => {
    const result = await updateDomain(domain.id, {
      warmupEnabled: !domain.warmupEnabled,
      warmupStatus: !domain.warmupEnabled ? 'in_progress' : 'pending',
    })
    if (result.success) {
      toast.success(`Warmup ${!domain.warmupEnabled ? 'started' : 'stopped'}`)
    }
  }

  const openEditCampaignModal = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setCampaignModalOpen(true)
  }

  const openEditTemplateModal = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setTemplateModalOpen(true)
  }

  const openCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setCampaignDetailOpen(true)
  }

  const refreshAll = () => {
    refetchCampaigns()
    refetchTemplates()
    refetchDomains()
    refetchStats()
    toast.success('Data refreshed')
  }

  const isLoading = campaignsLoading || templatesLoading || domainsLoading || statsLoading

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Engagement Suite</h1>
          <p className="text-muted-foreground">Manage campaigns, inbox, and deliverability</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDomainModalOpen(true)}>
            <Globe className="mr-2 h-4 w-4" />
            Domains
          </Button>
          <Button
            size="sm"
            className="bg-vivid-tangerine hover:bg-tangerine-dark"
            onClick={() => {
              setEditingCampaign(null)
              setCampaignModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="h-8 w-8 text-ori-orange" />
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-xl font-bold tabular-nums">
                  <CounterUp value={stats?.overview.totalSent || 0} format="compact" duration={1800} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-xl font-bold tabular-nums">
                  <CounterUp value={stats?.overview.openRate || 0} format="percentage" decimals={1} duration={1600} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Reply Rate</p>
                <p className="text-xl font-bold tabular-nums">
                  <CounterUp value={stats?.overview.replyRate || 0} format="percentage" decimals={1} duration={1700} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Deliverability</p>
                <p className="text-xl font-bold tabular-nums">
                  <CounterUp value={stats?.overview.deliverabilityRate || 0} format="percentage" decimals={1} duration={1500} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">
            <Mail className="mr-2 h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="inbox">
            <Inbox className="mr-2 h-4 w-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="deliverability">
            <Shield className="mr-2 h-4 w-4" />
            Deliverability
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Email Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Email Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {stats?.dailyStats ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.dailyStats}>
                      <defs>
                        <linearGradient id="colorSent2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f77f00" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f77f00" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOpened2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sent"
                        stroke="#f77f00"
                        fillOpacity={1}
                        fill="url(#colorSent2)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="opened"
                        stroke="#22c55e"
                        fillOpacity={1}
                        fill="url(#colorOpened2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Campaigns List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Campaigns</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No campaigns yet. Create your first campaign to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 flex items-center justify-center ${
                              campaign.status === 'active'
                                ? 'bg-green-500/20'
                                : campaign.status === 'paused'
                                  ? 'bg-yellow-500/20'
                                  : 'bg-muted'
                            }`}
                          >
                            <Mail
                              className={`h-5 w-5 ${
                                campaign.status === 'active'
                                  ? 'text-green-500'
                                  : campaign.status === 'paused'
                                    ? 'text-yellow-500'
                                    : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium cursor-pointer hover:text-vivid-tangerine" onClick={() => openCampaignDetail(campaign)}>{campaign.name}</p>
                              <Badge
                                variant={campaign.status === 'active' ? 'default' : 'secondary'}
                                className={
                                  campaign.status === 'active'
                                    ? 'bg-green-500 text-white'
                                    : campaign.status === 'paused'
                                      ? 'bg-yellow-500/20 text-yellow-600'
                                      : ''
                                }
                              >
                                {campaign.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleCampaignStatus(campaign)}
                            title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                          >
                            {campaign.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openCampaignDetail(campaign)} title="View details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEditCampaignModal(campaign)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => handleDeleteCampaign(campaign)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {campaign.status !== 'draft' && (
                        <div className="grid grid-cols-6 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Sent</p>
                            <p className="font-bold tabular-nums">
                              <CounterUp value={campaign.sentCount} format="number" duration={1200} />
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Delivered</p>
                            <p className="font-bold tabular-nums">
                              <CounterUp value={campaign.deliveredCount} format="number" duration={1250} />
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Opened</p>
                            <p className="font-bold text-vivid-tangerine tabular-nums">
                              <CounterUp value={campaign.openedCount} format="number" duration={1300} />
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Clicked</p>
                            <p className="font-bold tabular-nums">
                              <CounterUp value={campaign.clickedCount} format="number" duration={1350} />
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Replied</p>
                            <p className="font-bold text-green-500 tabular-nums">
                              <CounterUp value={campaign.repliedCount} format="number" duration={1400} />
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Bounced</p>
                            <p className="font-bold text-red-500 tabular-nums">
                              <CounterUp value={campaign.bouncedCount} format="number" duration={1450} />
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Email List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Inbox</CardTitle>
                  <Badge variant="secondary">{mockInboxEmails.filter(e => e.unread).length} unread</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {mockInboxEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 ${
                        email.unread ? 'bg-muted/30' : ''
                      } ${selectedEmail?.id === email.id ? 'bg-muted/50' : ''}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-vivid-tangerine text-white text-xs">
                          {email.from.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${email.unread ? 'font-semibold' : ''}`}>
                            {email.from}
                          </p>
                          <span className="text-xs text-muted-foreground">{email.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{email.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Preview */}
            <Card className="lg:col-span-2">
              <CardContent className="flex h-[400px]">
                {selectedEmail ? (
                  <div className="w-full p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarFallback className="bg-vivid-tangerine text-white">
                          {selectedEmail.from.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedEmail.from}</p>
                        <p className="text-sm text-muted-foreground">{selectedEmail.email}</p>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{selectedEmail.subject}</h3>
                    <p className="text-muted-foreground">{selectedEmail.preview}</p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="bg-vivid-tangerine hover:bg-tangerine-dark">
                        Reply
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast.info('Forward feature coming soon!')}>
                        Forward
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 font-medium">Select an email to preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="bg-vivid-tangerine hover:bg-tangerine-dark"
              onClick={() => {
                setEditingTemplate(null)
                setTemplateModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>

          {templatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No templates yet. Create your first template to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <Card key={template.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-vivid-tangerine" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {template.category} • Used {template.useCount} times
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditTemplateModal(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTemplate(template)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Deliverability Tab */}
        <TabsContent value="deliverability" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Domain Health</h2>
            <Button onClick={() => setDomainModalOpen(true)} className="bg-vivid-tangerine hover:bg-tangerine-dark">
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </div>

          {domainsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : domains.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Globe className="h-12 w-12 mb-4 opacity-50" />
                <p>No domains configured. Add a domain to start sending emails.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <Card key={domain.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-vivid-tangerine" />
                        <div>
                          <p className="font-medium">{domain.domain}</p>
                          <Badge
                            variant={domain.status === 'verified' ? 'default' : 'secondary'}
                            className={
                              domain.status === 'verified' ? 'bg-green-500 text-white' : ''
                            }
                          >
                            {domain.status}
                          </Badge>
                        </div>
                      </div>
                      {domain.status === 'verified' && (
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Reputation</p>
                            <p className="font-bold text-green-500">{domain.reputationScore}%</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleWarmup(domain)}
                          >
                            {domain.warmupEnabled ? 'Stop Warmup' : 'Start Warmup'}
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">SPF</p>
                        <Badge
                          variant={domain.spfStatus === 'verified' ? 'default' : 'secondary'}
                          className={domain.spfStatus === 'verified' ? 'bg-green-500 text-white' : ''}
                        >
                          {domain.spfStatus}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">DKIM</p>
                        <Badge
                          variant={domain.dkimStatus === 'verified' ? 'default' : 'secondary'}
                          className={domain.dkimStatus === 'verified' ? 'bg-green-500 text-white' : ''}
                        >
                          {domain.dkimStatus}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">DMARC</p>
                        <Badge
                          variant={domain.dmarcStatus === 'verified' ? 'default' : 'secondary'}
                          className={domain.dmarcStatus === 'verified' ? 'bg-green-500 text-white' : ''}
                        >
                          {domain.dmarcStatus}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Warmup</p>
                        <Badge
                          variant={domain.warmupStatus === 'completed' ? 'default' : 'secondary'}
                          className={domain.warmupStatus === 'completed' ? 'bg-green-500 text-white' : ''}
                        >
                          {domain.warmupStatus || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CampaignModal
        open={campaignModalOpen}
        onOpenChange={(open) => {
          setCampaignModalOpen(open)
          if (!open) setEditingCampaign(null)
        }}
        campaign={editingCampaign}
        onSave={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
      />

      <TemplateModal
        open={templateModalOpen}
        onOpenChange={(open) => {
          setTemplateModalOpen(open)
          if (!open) setEditingTemplate(null)
        }}
        template={editingTemplate}
        onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
      />

      <DomainModal
        open={domainModalOpen}
        onOpenChange={setDomainModalOpen}
        onSave={handleCreateDomain}
      />

      <CampaignDetailModal
        open={campaignDetailOpen}
        onOpenChange={setCampaignDetailOpen}
        campaign={selectedCampaign}
      />
    </div>
  )
}
