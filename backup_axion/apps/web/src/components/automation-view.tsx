'use client'

import { useState, useCallback, useEffect } from 'react'
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Workflow,
  Plus,
  Search,
  Play,
  Pause,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Webhook,
  Calendar,
  Mail,
  Users,
  Database,
  Code,
  Sparkles,
  BarChart3,
  Settings,
  Copy,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  X,
  Save,
  GripVertical,
  Send,
  Filter,
  Timer,
  RefreshCcw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import {
  useWorkflowStats,
  useWorkflows,
  useWorkflowRuns,
  useWorkflowTemplates,
} from '@/hooks/use-workflows'
import { ExecutionLogModal } from './automation/execution-log-modal'
import { toast } from 'sonner'
import { formatTimeAgo } from '@/lib/utils'

// Node types for workflow builder
const nodeTypes = [
  { type: 'trigger', icon: Zap, description: 'Start workflow on event', color: 'bg-yellow-500' },
  { type: 'condition', icon: ArrowRight, description: 'Branch logic', color: 'bg-blue-500' },
  { type: 'action', icon: Play, description: 'Perform action', color: 'bg-green-500' },
  { type: 'delay', icon: Clock, description: 'Wait before next step', color: 'bg-purple-500' },
  { type: 'webhook', icon: Webhook, description: 'Send/receive webhooks', color: 'bg-pink-500' },
  { type: 'ai', icon: Sparkles, description: 'AI-powered operations', color: 'bg-vivid-tangerine' },
]

// Template categories
const templateCategories = [
  { name: 'Lead Capture', icon: Users, color: 'text-blue-500' },
  { name: 'Lead Research', icon: Search, color: 'text-purple-500' },
  { name: 'Lead Qualification', icon: Zap, color: 'text-vivid-tangerine' },
  { name: 'Outreach & Nurture', icon: Mail, color: 'text-green-500' },
  { name: 'CRM Hygiene', icon: Database, color: 'text-yellow-500' },
  { name: 'Reporting & Analytics', icon: BarChart3, color: 'text-pink-500' },
]

interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
}

interface WorkflowData {
  id: string
  name: string
  description: string | null
  category: string | null
  status: string
  triggerType: string
  triggerConfig: Record<string, unknown>
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  runCount: number
  successCount: number
  successRate?: number
  lastRunAt: string | null
}

export function AutomationView() {
  const [activeTab, setActiveTab] = useState('workflows')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { setCurrentView } = useAppStore()

  // Modals
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [builderModalOpen, setBuilderModalOpen] = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<any>(null)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowData | null>(null)

  // Hooks
  const { stats, loading: statsLoading, refetch: refetchStats } = useWorkflowStats()
  const {
    data: workflows,
    loading: workflowsLoading,
    refetch: refetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    runWorkflow,
  } = useWorkflows({
    status: statusFilter === 'all' ? '' : statusFilter,
    category: categoryFilter === 'all' ? '' : categoryFilter,
  })
  const { data: runs, loading: runsLoading, refetch: refetchRuns } = useWorkflowRuns({ limit: 20 })
  const { data: templates, loading: templatesLoading, refetch: refetchTemplates } = useWorkflowTemplates()

  // Handlers
  const handleCreateWorkflow = () => {
    setEditingWorkflow(null)
    setCreateModalOpen(true)
  }

  const handleEditWorkflow = (workflow: WorkflowData) => {
    setEditingWorkflow(workflow)
    setCreateModalOpen(true)
  }

  const handleDuplicateWorkflow = async (workflow: WorkflowData) => {
    const newWorkflow = await createWorkflow({
      name: `${workflow.name} (Copy)`,
      description: workflow.description,
      category: workflow.category,
      triggerType: workflow.triggerType,
      triggerConfig: workflow.triggerConfig,
      nodes: workflow.nodes,
      edges: workflow.edges,
    })
    if (newWorkflow) {
      toast.success('Workflow duplicated!')
    } else {
      toast.error('Failed to duplicate workflow')
    }
  }

  const handleToggleStatus = async (workflow: WorkflowData) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active'
    const success = await updateWorkflow(workflow.id, { status: newStatus })
    if (success) {
      toast.success(`Workflow ${newStatus === 'active' ? 'activated' : 'paused'}`)
      refetchStats()
    } else {
      toast.error('Failed to update workflow status')
    }
  }

  const handleDeleteWorkflow = async (id: string) => {
    const success = await deleteWorkflow(id)
    if (success) {
      toast.success('Workflow deleted')
      refetchStats()
    } else {
      toast.error('Failed to delete workflow')
    }
  }

  const handleRunWorkflow = async (id: string) => {
    const result = await runWorkflow(id)
    if (result) {
      toast.success('Workflow execution started!')
      refetchRuns()
    } else {
      toast.error('Failed to start workflow')
    }
  }

  const handleUseTemplate = async (template: WorkflowData) => {
    const newWorkflow = await createWorkflow({
      name: template.name,
      description: template.description,
      category: template.category,
      triggerType: template.triggerType,
      triggerConfig: template.triggerConfig,
      nodes: template.nodes,
      edges: template.edges,
    })
    if (newWorkflow) {
      toast.success('Workflow created from template!')
      setActiveTab('workflows')
    } else {
      toast.error('Failed to create workflow from template')
    }
  }

  const getTriggerLabel = (triggerType: string, triggerConfig: Record<string, unknown>) => {
    switch (triggerType) {
      case 'event':
        return String(triggerConfig.event || 'Event trigger')
      case 'webhook':
        return `Webhook: ${String(triggerConfig.endpoint || 'custom')}`
      case 'schedule':
        return `Schedule: ${String(triggerConfig.cron || 'custom')}`
      case 'manual':
        return 'Manual trigger'
      default:
        return triggerType
    }
  }

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const filteredWorkflows = searchQuery
    ? workflows.filter(w =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : workflows

  return (
    <div className="space-y-6 p-6">
      <ExecutionLogModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        run={selectedRun}
      />
      {/* Workflow Detail Modal */}
      <Dialog open={workflowModalOpen} onOpenChange={setWorkflowModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedWorkflowId && (
            <WorkflowDetailContent
              workflowId={selectedWorkflowId}
              onClose={() => setWorkflowModalOpen(false)}
              onEdit={(w) => {
                setWorkflowModalOpen(false)
                handleEditWorkflow(w)
              }}
              onRun={() => handleRunWorkflow(selectedWorkflowId)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Workflow Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}</DialogTitle>
          </DialogHeader>
          <WorkflowForm
            workflow={editingWorkflow}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={async (data) => {
              let success = false
              if (editingWorkflow) {
                success = await updateWorkflow(editingWorkflow.id, data)
              } else {
                const result = await createWorkflow(data)
                success = !!result
              }
              if (success) {
                toast.success(`Workflow ${editingWorkflow ? 'updated' : 'created'}!`)
                setCreateModalOpen(false)
              } else {
                toast.error(`Failed to ${editingWorkflow ? 'update' : 'create'} workflow`)
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Workflow Builder Modal */}
      <Dialog open={builderModalOpen} onOpenChange={setBuilderModalOpen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Workflow Builder</DialogTitle>
          </DialogHeader>
          <div className="flex gap-4 h-full">
            {/* Node Palette */}
            <div className="w-48 border-r pr-4">
              <p className="text-sm font-medium mb-3">Drag to Add</p>
              <div className="space-y-2">
                {nodeTypes.map((node) => (
                  <div
                    key={node.type}
                    className="cursor-pointer border border-border p-2 hover:border-vivid-tangerine transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center ${node.color}`}>
                        <node.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium capitalize">{node.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 border bg-muted/30 flex items-center justify-center">
              <div className="text-center">
                <Workflow className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-medium">Workflow Canvas</p>
                <p className="text-sm text-muted-foreground">
                  Visual builder coming soon. Use the form view for now.
                </p>
                <Button
                  className="mt-4 bg-vivid-tangerine hover:bg-tangerine-dark"
                  onClick={() => {
                    setBuilderModalOpen(false)
                    handleCreateWorkflow()
                  }}
                >
                  Open Form Editor
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automation Studio</h1>
          <p className="text-muted-foreground">Build and manage automated workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => toast.info('API documentation coming soon!')}>
            <Code className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">API Docs</span>
          </Button>
          <Button
            size="sm"
            className="bg-vivid-tangerine hover:bg-tangerine-dark"
            onClick={handleCreateWorkflow}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-hover cursor-pointer" onClick={() => setActiveTab('workflows')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Workflow className="h-8 w-8 text-vivid-tangerine" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Workflows</p>
                  <p className="text-xl font-bold">{stats?.totalWorkflows || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer" onClick={() => setStatusFilter('active')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-xl font-bold">{stats?.activeWorkflows || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer" onClick={() => setActiveTab('runs')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Play className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Runs</p>
                  <p className="text-xl font-bold">{stats?.totalRuns.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Success</p>
                  <p className="text-xl font-bold">{stats?.avgSuccessRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workflows">
            <Workflow className="mr-2 h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Copy className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="runs">
            <Clock className="mr-2 h-4 w-4" />
            Run History
          </TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {templateCategories.map(cat => (
                  <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => { refetchWorkflows(); refetchStats(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {workflowsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <Workflow className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No workflows found</p>
              <Button variant="link" className="text-vivid-tangerine" onClick={handleCreateWorkflow}>
                Create your first workflow
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredWorkflows.map((workflow, index) => (
                  <motion.div
                    key={workflow.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`h-10 w-10 flex items-center justify-center ${workflow.status === 'active' ? 'bg-green-500/20' : 'bg-muted'
                                }`}
                            >
                              <Workflow
                                className={`h-5 w-5 ${workflow.status === 'active' ? 'text-green-500' : 'text-muted-foreground'
                                  }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{workflow.name}</p>
                                <Badge
                                  variant={workflow.status === 'active' ? 'default' : 'secondary'}
                                  className={
                                    workflow.status === 'active'
                                      ? 'bg-green-500 text-white'
                                      : workflow.status === 'paused'
                                        ? 'bg-yellow-500/20 text-yellow-600'
                                        : ''
                                  }
                                >
                                  {workflow.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {workflow.description || 'No description'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center hidden md:block">
                              <p className="text-xs text-muted-foreground">Trigger</p>
                              <p className="text-sm">{getTriggerLabel(workflow.triggerType, workflow.triggerConfig)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Runs</p>
                              <p className="font-bold">{workflow.runCount.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Success</p>
                              <p className="font-bold text-green-500">{workflow.successRate || 0}%</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={workflow.status === 'active' ? 'text-yellow-500 hover:text-yellow-600' : 'text-green-500 hover:text-green-600'}
                                onClick={() => handleToggleStatus(workflow)}
                              >
                                {workflow.status === 'active' ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              {workflow.status === 'active' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-vivid-tangerine hover:text-orange-600"
                                  onClick={() => handleRunWorkflow(workflow.id)}
                                >
                                  <Zap className="h-4 w-4" />
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedWorkflowId(workflow.id)
                                    setWorkflowModalOpen(true)
                                  }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditWorkflow(workflow)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateWorkflow(workflow)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => handleDeleteWorkflow(workflow.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {templateCategories.map((category) => (
              <Card
                key={category.name}
                className="cursor-pointer card-hover text-center"
                onClick={() => {
                  setCategoryFilter(category.name)
                  setActiveTab('workflows')
                }}
              >
                <CardContent className="p-4">
                  <category.icon className={`mx-auto h-8 w-8 ${category.color}`} />
                  <p className="mt-2 font-medium">{category.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Featured Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Templates</CardTitle>
              <CardDescription>Get started quickly with pre-built automation templates</CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {templates.map((template) => (
                      <motion.div
                        key={template.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-start gap-4 border border-border p-4 hover:border-vivid-tangerine transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center bg-vivid-tangerine/20 shrink-0">
                          <Zap className="h-5 w-5 text-vivid-tangerine" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            {template.category && (
                              <Badge variant="outline">{template.category}</Badge>
                            )}
                            <Badge variant="secondary">{template.triggerType}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => handleUseTemplate(template)}
                        >
                          Use
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Run History Tab */}
        <TabsContent value="runs" className="space-y-4">
          <div className="flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={() => refetchRuns()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : runs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No workflow runs yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {runs.map((run, index) => (
                      <motion.div
                        key={run.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center justify-between border border-border p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {run.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : run.status === 'failed' ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : run.status === 'running' ? (
                            <div className="h-5 w-5 animate-spin border-2 border-vivid-tangerine border-t-transparent" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">{run.workflow.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTimeAgo(run.createdAt)}
                              {run.triggerType === 'manual' && ' • Manual trigger'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={
                              run.status === 'completed'
                                ? 'default'
                                : run.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className={
                              run.status === 'completed'
                                ? 'bg-green-500 text-white'
                                : run.status === 'running'
                                  ? 'bg-vivid-tangerine text-white'
                                  : ''
                            }
                          >
                            {run.status}
                          </Badge>
                          {run.duration && (
                            <span className="text-sm text-muted-foreground">
                              {(run.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRun(run)
                              setLogModalOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Workflow Detail Content Component
function WorkflowDetailContent({
  workflowId,
  onClose,
  onEdit,
  onRun,
}: {
  workflowId: string
  onClose: () => void
  onEdit: (workflow: WorkflowData) => void
  onRun: () => void
}) {
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkflow = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/workflows/${workflowId}`)
        const result = await response.json()
        if (result.success) {
          setWorkflow(result.data)
        }
      } catch (err) {
        console.error('Error fetching workflow:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchWorkflow()
  }, [workflowId])

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12" />)}</div>
  }

  if (!workflow) {
    return <div className="text-center py-8 text-muted-foreground">Workflow not found</div>
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          {workflow.name}
          <Badge
            variant={workflow.status === 'active' ? 'default' : 'secondary'}
            className={
              workflow.status === 'active'
                ? 'bg-green-500 text-white'
                : workflow.status === 'paused'
                  ? 'bg-yellow-500/20 text-yellow-600'
                  : ''
            }
          >
            {workflow.status}
          </Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <p className="text-muted-foreground">{workflow.description || 'No description'}</p>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Runs</p>
              <p className="text-lg font-bold">{workflow.runCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Success</p>
              <p className="text-lg font-bold text-green-500">{workflow.successRate || 0}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Trigger</p>
              <p className="text-sm font-medium capitalize">{workflow.triggerType}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Last Run</p>
              <p className="text-sm font-medium">{formatTimeAgo(workflow.lastRunAt || new Date())}</p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Visualization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Workflow Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {workflow.nodes.map((node, index) => (
                <div key={node.id} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1 min-w-[80px]">
                    <div className={`h-10 w-10 flex items-center justify-center ${node.type === 'trigger' ? 'bg-yellow-500' :
                      node.type === 'condition' ? 'bg-blue-500' :
                        node.type === 'delay' ? 'bg-purple-500' :
                          node.type === 'sendEmail' ? 'bg-green-500' :
                            'bg-vivid-tangerine'
                      }`}>
                      {node.type === 'trigger' && <Zap className="h-5 w-5 text-white" />}
                      {node.type === 'condition' && <ArrowRight className="h-5 w-5 text-white" />}
                      {node.type === 'delay' && <Clock className="h-5 w-5 text-white" />}
                      {node.type === 'sendEmail' && <Mail className="h-5 w-5 text-white" />}
                      {node.type === 'enrich' && <Sparkles className="h-5 w-5 text-white" />}
                      {node.type === 'score' && <BarChart3 className="h-5 w-5 text-white" />}
                      {!['trigger', 'condition', 'delay', 'sendEmail', 'enrich', 'score'].includes(node.type) && <Play className="h-5 w-5 text-white" />}
                    </div>
                    <p className="text-xs text-muted-foreground text-center truncate w-full">
                      {String(node.data?.label || node.type)}
                    </p>
                  </div>
                  {index < workflow.nodes.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-vivid-tangerine hover:bg-tangerine-dark"
            onClick={onRun}
            disabled={workflow.status !== 'active'}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Now
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => onEdit(workflow)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  )
}

// Workflow Form Component
function WorkflowForm({
  workflow,
  onClose,
  onSubmit,
}: {
  workflow: WorkflowData | null
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({
    name: workflow?.name || '',
    description: workflow?.description || '',
    category: workflow?.category || '',
    triggerType: workflow?.triggerType || 'manual',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Workflow Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Workflow"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What does this workflow do?"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category || ''}
            onValueChange={(v) => setFormData({ ...formData, category: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {templateCategories.map(cat => (
                <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="triggerType">Trigger Type</Label>
          <Select
            value={formData.triggerType || 'manual'}
            onValueChange={(v) => setFormData({ ...formData, triggerType: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="schedule">Schedule</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-vivid-tangerine hover:bg-tangerine-dark" disabled={loading}>
          {loading ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </div>
    </form>
  )
}
