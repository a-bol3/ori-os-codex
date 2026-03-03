'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  FileText,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Database,
  Globe,
  Lock,
  Key,
  Eye,
  Settings,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  BarChart3,
  Calendar,
  UserX,
  FileSearch,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { toast } from 'sonner'
import {
  useGDPRRequests,
  useAuditLogs,
  useComplianceProfiles,
  useComplianceStats,
} from '@/hooks/use-compliance'

// GDPR Request Modal
function GDPRRequestModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { type: string; contactEmail: string }) => Promise<{ success: boolean }>
}) {
  const [type, setType] = useState('export')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email) {
      toast.error('Email is required')
      return
    }
    setLoading(true)
    const result = await onSubmit({ type, contactEmail: email })
    setLoading(false)
    if (result.success) {
      toast.success('GDPR request created')
      onOpenChange(false)
      setEmail('')
    } else {
      toast.error('Failed to create request')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New GDPR Request</DialogTitle>
          <DialogDescription>Create a data subject access or deletion request</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Request Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export">Export Data</SelectItem>
                <SelectItem value="delete">Delete Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-vivid-tangerine hover:bg-tangerine-dark">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Compliance Profile Modal
function ProfileModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description: string; gdprEnabled: boolean; ccpaEnabled: boolean }) => Promise<{ success: boolean }>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [gdprEnabled, setGdprEnabled] = useState(true)
  const [ccpaEnabled, setCcpaEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Name is required')
      return
    }
    setLoading(true)
    const result = await onSubmit({ name, description, gdprEnabled, ccpaEnabled })
    setLoading(false)
    if (result.success) {
      toast.success('Profile created')
      onOpenChange(false)
      setName('')
      setDescription('')
    } else {
      toast.error('Failed to create profile')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Compliance Profile</DialogTitle>
          <DialogDescription>Create a compliance profile for different regions</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Profile Name</Label>
            <Input placeholder="EU-Standard" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe this profile..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>GDPR Enabled</Label>
            <Button
              variant={gdprEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGdprEnabled(!gdprEnabled)}
              className={gdprEnabled ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {gdprEnabled ? 'On' : 'Off'}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Label>CCPA Enabled</Label>
            <Button
              variant={ccpaEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCcpaEnabled(!ccpaEnabled)}
              className={ccpaEnabled ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {ccpaEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-vivid-tangerine hover:bg-tangerine-dark">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ComplianceView() {
  const [activeTab, setActiveTab] = useState('overview')
  const [gdprModalOpen, setGdprModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [filterAction, setFilterAction] = useState('all')

  // Hooks
  const { requests, loading: requestsLoading, refetch: refetchRequests, createRequest, processRequest } = useGDPRRequests()
  const { logs, loading: logsLoading, refetch: refetchLogs } = useAuditLogs(filterAction === 'all' ? undefined : filterAction)
  const { profiles, loading: profilesLoading, refetch: refetchProfiles, createProfile, deleteProfile } = useComplianceProfiles()
  const { stats, loading: statsLoading, refetch: refetchStats } = useComplianceStats()

  const isLoading = requestsLoading || logsLoading || profilesLoading || statsLoading

  const refreshAll = () => {
    refetchRequests()
    refetchLogs()
    refetchProfiles()
    refetchStats()
    toast.success('Data refreshed')
  }

  const handleCreateRequest = async (data: { type: string; contactEmail: string }) => {
    return createRequest(data)
  }

  const handleProcessRequest = async (id: string, status: 'processing' | 'completed') => {
    const result = await processRequest(id, status)
    if (result.success) {
      toast.success(`Request ${status === 'completed' ? 'completed' : 'processing'}`)
    }
  }

  const handleCreateProfile = async (data: { name: string; description: string; gdprEnabled: boolean; ccpaEnabled: boolean }) => {
    return createProfile(data)
  }

  const handleDeleteProfile = async (id: string) => {
    if (confirm('Delete this profile?')) {
      const result = await deleteProfile(id)
      if (result.success) {
        toast.success('Profile deleted')
      }
    }
  }

  // Calculate consent rate for circle
  const consentRate = stats.consentRate || 0
  const strokeDasharray = `${consentRate * 3.52} 352`

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance Center</h1>
          <p className="text-muted-foreground">Manage GDPR, data privacy, and audit logs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-vivid-tangerine" />
              <div>
                <p className="text-sm text-muted-foreground">GDPR Requests</p>
                <p className="text-xl font-bold">{stats.gdprRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{stats.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserX className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Suppression List</p>
                <p className="text-xl font-bold">{stats.suppressionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Consent Rate</p>
                <p className="text-xl font-bold">{consentRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Shield className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="gdpr">
            <FileText className="mr-2 h-4 w-4" />
            GDPR Requests
          </TabsTrigger>
          <TabsTrigger value="suppression">
            <UserX className="mr-2 h-4 w-4" />
            Suppression
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Eye className="mr-2 h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Score */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Score</CardTitle>
              <CardDescription>Your overall compliance health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-muted"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-green-500"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={strokeDasharray}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-500">{consentRate}%</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">GDPR Compliant</p>
                      <p className="text-xs text-muted-foreground">All requirements met</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">DNS Records Valid</p>
                      <p className="text-xs text-muted-foreground">SPF, DKIM, DMARC</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Consent Tracking</p>
                      <p className="text-xs text-muted-foreground">Active for all contacts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Data Retention</p>
                      <p className="text-xs text-muted-foreground">Review recommended</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Profiles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Compliance Profiles</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setProfileModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Profile
              </Button>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No compliance profiles yet</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="border border-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-vivid-tangerine" />
                          <p className="font-medium">{profile.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {profile.isDefault && (
                            <Badge variant="secondary" className="bg-vivid-tangerine/20 text-vivid-tangerine">
                              Default
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteProfile(profile.id)} className="text-red-500">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{profile.description || 'No description'}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {profile.gdprEnabled ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 bg-muted" />
                          )}
                          <span className="text-xs">GDPR</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {profile.ccpaEnabled ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 bg-muted" />
                          )}
                          <span className="text-xs">CCPA</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Retention: {profile.contactRetentionDays || 'N/A'} days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GDPR Requests Tab */}
        <TabsContent value="gdpr" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Data Subject Requests</CardTitle>
              <Button className="bg-vivid-tangerine hover:bg-tangerine-dark" onClick={() => setGdprModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No GDPR requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 flex items-center justify-center ${
                            request.type === 'export' ? 'bg-blue-500/20' : 'bg-red-500/20'
                          }`}
                        >
                          {request.type === 'export' ? (
                            <Download className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Trash2 className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{request.contactEmail}</p>
                            <Badge variant="outline">{request.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested: {new Date(request.requestedAt || request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={request.status === 'completed' ? 'default' : request.status === 'processing' ? 'secondary' : 'outline'}
                          className={
                            request.status === 'completed'
                              ? 'bg-green-500 text-white'
                              : request.status === 'processing'
                                ? 'bg-yellow-500/20 text-yellow-600'
                                : ''
                          }
                        >
                          {request.status}
                        </Badge>
                        {request.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => handleProcessRequest(request.id, 'processing')}>
                            Process
                          </Button>
                        )}
                        {request.status === 'processing' && (
                          <Button size="sm" variant="outline" onClick={() => handleProcessRequest(request.id, 'completed')}>
                            Complete
                          </Button>
                        )}
                        {request.status === 'completed' && request.type === 'export' && (
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppression Tab */}
        <TabsContent value="suppression" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Suppression List</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button className="bg-vivid-tangerine hover:bg-tangerine-dark">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by email..." className="pl-10" />
                </div>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <UserX className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Suppression list entries: {stats.suppressionCount}</p>
                <p className="text-sm">Add entries to prevent emails from being sent to specific addresses</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Audit Logs</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="export">Exports</SelectItem>
                    <SelectItem value="delete">Deletions</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No audit logs yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.resource} {log.resourceId && `• ${log.resourceId}`} {log.ipAddress && `• IP: ${log.ipAddress}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <GDPRRequestModal
        open={gdprModalOpen}
        onOpenChange={setGdprModalOpen}
        onSubmit={handleCreateRequest}
      />
      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        onSubmit={handleCreateProfile}
      />
    </div>
  )
}
