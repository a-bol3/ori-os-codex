'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  Plus,
  Users,
  Building2,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Calendar,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Star,
  X,
  Linkedin,
  Globe,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserPlus,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import {
  useCRMStats,
  useCRMContacts,
  useCRMCompanies,
  useCRMDeals,
  useContactDetails,
  useCompanyDetails,
  useDealDetails,
} from '@/hooks/use-crm'
import { toast } from 'sonner'
import { CounterUp } from '@/components/ui/counter-up'

const stageColors: Record<string, string> = {
  discovery: 'bg-gray-500',
  qualification: 'bg-blue-500',
  proposal: 'bg-vivid-tangerine',
  negotiation: 'bg-green-500',
  closed_won: 'bg-emerald-500',
  closed_lost: 'bg-red-500',
}

const stageHexColors: Record<string, string> = {
  discovery: '#6b7280',
  qualification: '#3b82f6',
  proposal: '#f77f00',
  negotiation: '#22c55e',
  closed_won: '#10b981',
  closed_lost: '#ef4444',
}

const statusColors: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  prospect: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  qualified: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  customer: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  churned: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const companyStatusColors: Record<string, string> = {
  prospect: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  qualified: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  customer: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  churned: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const STAGES = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

export function CRMView() {
  const [activeTab, setActiveTab] = useState('contacts')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { setCurrentView } = useAppStore()

  // Detail modals
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [companyModalOpen, setCompanyModalOpen] = useState(false)
  const [dealModalOpen, setDealModalOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)

  // Create/Edit modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createType, setCreateType] = useState<'contact' | 'company' | 'deal'>('contact')
  const [editingEntity, setEditingEntity] = useState<{ type: string; id: string } | null>(null)

  // Hooks
  const { stats, loading: statsLoading, refetch: refetchStats } = useCRMStats()
  const {
    data: contacts,
    pagination: contactsPagination,
    loading: contactsLoading,
    refetch: refetchContacts,
    createContact,
    updateContact,
    deleteContact,
  } = useCRMContacts({ search: searchQuery, status: statusFilter === 'all' ? '' : statusFilter })
  const {
    data: companies,
    loading: companiesLoading,
    refetch: refetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useCRMCompanies({ search: searchQuery, status: statusFilter === 'all' ? '' : statusFilter })
  const {
    data: deals,
    loading: dealsLoading,
    refetch: refetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
  } = useCRMDeals({ status: 'open' })

  const { data: contactDetails } = useContactDetails(selectedContactId)
  const { data: companyDetails } = useCompanyDetails(selectedCompanyId)
  const { data: dealDetails } = useDealDetails(selectedDealId)

  // Handlers
  const handleViewContact = (id: string) => {
    setSelectedContactId(id)
    setContactModalOpen(true)
  }

  const handleViewCompany = (id: string) => {
    setSelectedCompanyId(id)
    setCompanyModalOpen(true)
  }

  const handleViewDeal = (id: string) => {
    setSelectedDealId(id)
    setDealModalOpen(true)
  }

  const handleCreate = (type: 'contact' | 'company' | 'deal') => {
    setCreateType(type)
    setEditingEntity(null)
    setCreateModalOpen(true)
  }

  const handleEdit = (type: string, id: string) => {
    setCreateType(type as 'contact' | 'company' | 'deal')
    setEditingEntity({ type, id })
    setCreateModalOpen(true)
  }

  const handleDelete = async (type: string, id: string) => {
    let success = false
    switch (type) {
      case 'contact':
        success = await deleteContact(id)
        break
      case 'company':
        success = await deleteCompany(id)
        break
      case 'deal':
        success = await deleteDeal(id)
        break
    }
    if (success) {
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`)
    } else {
      toast.error(`Failed to delete ${type}`)
    }
  }

  const handleDealStageChange = async (dealId: string, newStage: string) => {
    const success = await updateDeal(dealId, { stage: newStage })
    if (success) {
      toast.success('Deal stage updated')
      refetchStats()
    } else {
      toast.error('Failed to update deal stage')
    }
  }

  const handleExport = () => {
    const dataToExport = activeTab === 'contacts' ? contacts : activeTab === 'companies' ? companies : deals
    if (!dataToExport || dataToExport.length === 0) {
      toast.error('No data to export')
      return
    }

    let csvContent = ''
    if (activeTab === 'contacts') {
      csvContent = [
        ['Name', 'Email', 'Phone', 'Title', 'Company', 'Status', 'Score'].join(','),
        ...contacts.map(c => [
          `${c.firstName || ''} ${c.lastName || ''}`.trim(),
          c.email || '',
          c.phone || '',
          c.title || '',
          c.company?.name || '',
          c.status,
          c.score || '',
        ].join(','))
      ].join('\n')
    } else if (activeTab === 'companies') {
      csvContent = [
        ['Name', 'Domain', 'Industry', 'Size', 'Status', 'Contacts', 'Deals'].join(','),
        ...companies.map(c => [
          c.name,
          c.domain || '',
          c.industry || '',
          c.size || '',
          c.status,
          c._count?.contacts || 0,
          c._count?.deals || 0,
        ].join(','))
      ].join('\n')
    } else {
      csvContent = [
        ['Name', 'Company', 'Value', 'Stage', 'Probability', 'Expected Close'].join(','),
        ...deals.map(d => [
          d.name,
          d.company?.name || '',
          d.value || 0,
          d.stage,
          d.probability || 0,
          d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString() : '',
        ].join(','))
      ].join('\n')
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${dataToExport.length} ${activeTab}`)
  }

  // Pipeline chart data
  const pipelineChartData = stats?.dealsByStage
    ? Object.entries(stats.dealsByStage).map(([stage, data]) => ({
      name: stage.charAt(0).toUpperCase() + stage.slice(1),
      value: data.value,
      color: stageHexColors[stage] || '#999',
    }))
    : []

  // Group deals by stage for Kanban
  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage)
    return acc
  }, {} as Record<string, typeof deals>)

  return (
    <div className="space-y-6 p-6">
      {/* Contact Detail Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {contactDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-vivid-tangerine text-white text-lg">
                      {`${contactDetails.firstName || ''} ${contactDetails.lastName || ''}`.trim().split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      {`${contactDetails.firstName || ''} ${contactDetails.lastName || ''}`.trim()}
                      <Badge className={statusColors[contactDetails.status]} variant="secondary">
                        {contactDetails.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                      {contactDetails.title || 'No title'} {contactDetails.company?.name && `at ${contactDetails.company.name}`}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  {contactDetails.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contactDetails.email}`} className="text-vivid-tangerine hover:underline">
                        {contactDetails.email}
                      </a>
                    </div>
                  )}
                  {contactDetails.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contactDetails.phone}</span>
                    </div>
                  )}
                  {contactDetails.linkedin && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a href={`https://${contactDetails.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-vivid-tangerine hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {contactDetails.score !== null && (
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>Score: <strong className="text-vivid-tangerine">{contactDetails.score}</strong></span>
                    </div>
                  )}
                </div>

                {/* Company Info */}
                {contactDetails.company && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {contactDetails.company.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {contactDetails.company.industry && (
                          <div>
                            <p className="text-muted-foreground">Industry</p>
                            <p className="font-medium">{contactDetails.company.industry}</p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 mt-2 text-vivid-tangerine"
                        onClick={() => {
                          setContactModalOpen(false)
                          handleViewCompany(contactDetails.company!.id)
                        }}
                      >
                        View Company Details <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Engagement Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Mail className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">{contactDetails.openCount}</p>
                      <p className="text-xs text-muted-foreground">Emails Opened</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">{contactDetails.responseCount}</p>
                      <p className="text-xs text-muted-foreground">Responses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <ExternalLink className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">{contactDetails.clickCount}</p>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-vivid-tangerine hover:bg-tangerine-dark" onClick={() => setCurrentView('engagement')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setCurrentView('engagement')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Campaign
                  </Button>
                  <Button variant="outline" onClick={() => { setContactModalOpen(false); handleEdit('contact', contactDetails.id); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Company Detail Modal */}
      <Dialog open={companyModalOpen} onOpenChange={setCompanyModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {companyDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center bg-muted">
                    <Building2 className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {companyDetails.name}
                      <Badge className={companyStatusColors[companyDetails.status]} variant="secondary">
                        {companyDetails.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                      {companyDetails.domain || companyDetails.industry || 'Company details'}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Company Info Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Industry</p>
                    <p className="font-medium">{companyDetails.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="font-medium">{companyDetails.size || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{companyDetails.city && companyDetails.state ? `${companyDetails.city}, ${companyDetails.state}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    {companyDetails.website ? (
                      <a href={companyDetails.website} target="_blank" rel="noopener noreferrer" className="text-vivid-tangerine hover:underline">
                        Visit <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    ) : 'N/A'}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-5 w-5 mx-auto mb-1 text-vivid-tangerine" />
                      <p className="text-lg font-bold">{companyDetails.contacts?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Contacts</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-lg font-bold">{companyDetails.deals?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Deals</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-lg font-bold">${((companyDetails.totalValue || 0) / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">Total Value</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Contacts List */}
                {companyDetails.contacts && companyDetails.contacts.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Contacts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {companyDetails.contacts.slice(0, 5).map(contact => (
                          <div
                            key={contact.id}
                            className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                              setCompanyModalOpen(false)
                              handleViewContact(contact.id)
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-vivid-tangerine text-white text-xs">
                                  {`${contact.firstName || ''} ${contact.lastName || ''}`.trim().split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{`${contact.firstName || ''} ${contact.lastName || ''}`.trim()}</p>
                                <p className="text-xs text-muted-foreground">{contact.title || 'No title'}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Deals List */}
                {companyDetails.deals && companyDetails.deals.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Deals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {companyDetails.deals.slice(0, 5).map(deal => (
                          <div
                            key={deal.id}
                            className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                              setCompanyModalOpen(false)
                              handleViewDeal(deal.id)
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-2 w-2 ${stageColors[deal.stage]}`} />
                              <div>
                                <p className="text-sm font-medium">{deal.name}</p>
                                <p className="text-xs text-muted-foreground">{deal.stage}</p>
                              </div>
                            </div>
                            <span className="font-bold">${((deal.value || 0) / 1000).toFixed(0)}K</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-vivid-tangerine hover:bg-tangerine-dark" onClick={() => handleCreate('contact')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleCreate('deal')}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Create Deal
                  </Button>
                  <Button variant="outline" onClick={() => { setCompanyModalOpen(false); handleEdit('company', companyDetails.id); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Deal Detail Modal */}
      <Dialog open={dealModalOpen} onOpenChange={setDealModalOpen}>
        <DialogContent className="max-w-2xl">
          {dealDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`h-3 w-3 ${stageColors[dealDetails.stage]}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      {dealDetails.name}
                      <Badge variant="outline">{dealDetails.stage.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                      {dealDetails.company?.name || 'No company'}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Deal Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className="text-xl font-bold text-vivid-tangerine">${((dealDetails.value || 0) / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Probability</p>
                    <p className="text-xl font-bold">{dealDetails.probability || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Close</p>
                    <p className="font-medium">{dealDetails.expectedCloseDate ? new Date(dealDetails.expectedCloseDate).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={dealDetails.status === 'open' ? 'default' : dealDetails.status === 'won' ? 'default' : 'destructive'}>
                      {dealDetails.status}
                    </Badge>
                  </div>
                </div>

                {/* Contact */}
                {dealDetails.primaryContact && (
                  <div
                    className="flex items-center gap-3 p-3 border cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setDealModalOpen(false)
                      handleViewContact(dealDetails.primaryContact!.id)
                    }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-vivid-tangerine text-white">
                        {`${dealDetails.primaryContact.firstName || ''} ${dealDetails.primaryContact.lastName || ''}`.trim().split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{`${dealDetails.primaryContact.firstName || ''} ${dealDetails.primaryContact.lastName || ''}`.trim()}</p>
                      <p className="text-sm text-muted-foreground">Primary Contact • {dealDetails.primaryContact.email || 'No email'}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                )}

                {/* Stage Change */}
                <div>
                  <p className="text-sm font-medium mb-2">Move to Stage</p>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.filter(s => s !== dealDetails.stage).map(stage => (
                      <Button
                        key={stage}
                        variant="outline"
                        size="sm"
                        onClick={() => handleDealStageChange(dealDetails.id, stage)}
                      >
                        <div className={`h-2 w-2 ${stageColors[stage]} mr-2`} />
                        {stage.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-vivid-tangerine hover:bg-tangerine-dark" onClick={() => setCurrentView('engagement')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Proposal
                  </Button>
                  <Button variant="outline" onClick={() => { setDealModalOpen(false); handleEdit('deal', dealDetails.id); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? `Edit ${createType}` : `Create ${createType.charAt(0).toUpperCase() + createType.slice(1)}`}
            </DialogTitle>
          </DialogHeader>
          <EntityForm
            type={createType}
            editingId={editingEntity?.id}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={async (data) => {
              let success = false
              if (createType === 'contact') {
                if (editingEntity) {
                  success = await updateContact(editingEntity.id, data) !== null
                } else {
                  success = await createContact(data) !== null
                }
              } else if (createType === 'company') {
                if (editingEntity) {
                  success = await updateCompany(editingEntity.id, data) !== null
                } else {
                  success = await createCompany(data) !== null
                }
              } else if (createType === 'deal') {
                if (editingEntity) {
                  success = await updateDeal(editingEntity.id, data) !== null
                } else {
                  success = await createDeal(data) !== null
                }
              }
              if (success) {
                toast.success(`${createType} ${editingEntity ? 'updated' : 'created'}!`)
                setCreateModalOpen(false)
              } else {
                toast.error(`Failed to ${editingEntity ? 'update' : 'create'} ${createType}`)
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relationship Hub</h1>
          <p className="text-muted-foreground">Manage your contacts, companies, and deals</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-vivid-tangerine hover:bg-tangerine-dark">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleCreate('contact')}>
                <Users className="mr-2 h-4 w-4" />
                Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreate('company')}>
                <Building2 className="mr-2 h-4 w-4" />
                Company
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreate('deal')}>
                <DollarSign className="mr-2 h-4 w-4" />
                Deal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-hover cursor-pointer" onClick={() => setActiveTab('contacts')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-vivid-tangerine" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Contacts</p>
                  <p className="text-xl font-bold tabular-nums">
                    <CounterUp value={stats?.totalContacts || 0} format="number" duration={1500} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer" onClick={() => setActiveTab('companies')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Companies</p>
                  <p className="text-xl font-bold tabular-nums">
                    <CounterUp value={stats?.totalCompanies || 0} format="number" duration={1600} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer" onClick={() => setActiveTab('deals')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pipeline Value</p>
                  <p className="text-xl font-bold tabular-nums">
                    $<CounterUp value={(stats?.pipelineValue || 0) / 1000} format="compact" duration={1700} />K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-xl font-bold tabular-nums">
                    <CounterUp value={stats?.winRate || 0} format="percentage" duration={1400} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pipeline Chart */}
      {pipelineChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-[150px] w-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pipelineChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, 'Value']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-4">
                {pipelineChartData.map((stage) => (
                  <div key={stage.name} className="text-center">
                    <div
                      className="mx-auto mb-2 h-3 w-3"
                      style={{ backgroundColor: stage.color }}
                    />
                    <p className="text-sm text-muted-foreground">{stage.name}</p>
                    <p className="text-lg font-bold">${(stage.value / 1000).toFixed(0)}K</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contacts">
            <Users className="mr-2 h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="companies">
            <Building2 className="mr-2 h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="deals">
            <DollarSign className="mr-2 h-4 w-4" />
            Deals
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && refetchContacts()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => { refetchContacts(); refetchStats(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {contactsLoading ? (
                <div className="divide-y divide-border">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-10 w-10" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No contacts found</p>
                  <Button variant="link" className="text-vivid-tangerine" onClick={() => handleCreate('contact')}>
                    Add your first contact
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[500px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {contacts.map((contact, index) => (
                      <motion.div
                        key={contact.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleViewContact(contact.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-vivid-tangerine text-white">
                              {`${contact.firstName || ''} ${contact.lastName || ''}`.trim().split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown'}</p>
                              <Badge className={statusColors[contact.status]} variant="secondary">
                                {contact.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {contact.title || 'No title'} {contact.company?.name && `at ${contact.company.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden md:block">
                            <p className="text-sm">{contact.email || 'No email'}</p>
                            <p className="text-xs text-muted-foreground">{contact.phone || 'No phone'}</p>
                          </div>
                          <div className="text-center hidden lg:block">
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className="font-bold text-vivid-tangerine">{contact.score || 0}</p>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentView('engagement')}>
                              <Mail className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewContact(contact.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit('contact', contact.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCurrentView('engagement')}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Add to Campaign
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={() => handleDelete('contact', contact.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && refetchCompanies()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => { refetchCompanies(); refetchStats(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {companiesLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No companies found</p>
              <Button variant="link" className="text-vivid-tangerine" onClick={() => handleCreate('company')}>
                Add your first company
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {companies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      className="card-hover cursor-pointer"
                      onClick={() => handleViewCompany(company.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center bg-muted">
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-muted-foreground">{company.domain || company.industry || 'Company'}</p>
                            </div>
                          </div>
                          <Badge className={companyStatusColors[company.status]} variant="secondary">
                            {company.status}
                          </Badge>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Contacts</p>
                            <p className="font-bold">{company._count?.contacts || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Deals</p>
                            <p className="font-bold">{company._count?.deals || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className="font-bold text-vivid-tangerine">{company.score || 0}</p>
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

        {/* Deals Tab - Kanban Style */}
        <TabsContent value="deals" className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => { refetchDeals(); refetchStats(); }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {dealsLoading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deals found</p>
              <Button variant="link" className="text-vivid-tangerine" onClick={() => handleCreate('deal')}>
                Create your first deal
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-4 overflow-x-auto pb-4">
              {STAGES.slice(0, 4).map((stage) => (
                <div key={stage} className="min-w-[280px]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-3 w-3 ${stageColors[stage]}`} />
                    <h3 className="font-medium capitalize">{stage}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {dealsByStage[stage]?.length || 0}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {(dealsByStage[stage] || []).map((deal, index) => (
                        <motion.div
                          key={deal.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className="card-hover cursor-pointer"
                            onClick={() => handleViewDeal(deal.id)}
                          >
                            <CardContent className="p-3">
                              <p className="font-medium text-sm truncate">{deal.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{deal.company?.name || 'No company'}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-bold text-vivid-tangerine">
                                  ${((deal.value || 0) / 1000).toFixed(0)}K
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {deal.probability}%
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {(!dealsByStage[stage] || dealsByStage[stage].length === 0) && (
                      <div className="border-2 border-dashed p-4 text-center text-muted-foreground text-sm">
                        No deals
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Entity Form Component
function EntityForm({
  type,
  editingId,
  onClose,
  onSubmit
}: {
  type: 'contact' | 'company' | 'deal'
  editingId?: string
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  if (type === 'contact') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="VP of Marketing"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status || 'lead'} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-vivid-tangerine hover:bg-tangerine-dark" disabled={loading}>
            {loading ? 'Saving...' : 'Save Contact'}
          </Button>
        </div>
      </form>
    )
  }

  if (type === 'company') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Acme Corp"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={formData.domain || ''}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="acme.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={formData.industry || ''}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="Technology"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Company Size</Label>
            <Select value={formData.size || ''} onValueChange={(v) => setFormData({ ...formData, size: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10</SelectItem>
                <SelectItem value="11-50">11-50</SelectItem>
                <SelectItem value="51-200">51-200</SelectItem>
                <SelectItem value="201-500">201-500</SelectItem>
                <SelectItem value="501-1000">501-1000</SelectItem>
                <SelectItem value="1000+">1000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status || 'prospect'} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website || ''}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://acme.com"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-vivid-tangerine hover:bg-tangerine-dark" disabled={loading}>
            {loading ? 'Saving...' : 'Save Company'}
          </Button>
        </div>
      </form>
    )
  }

  // Deal form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dealName">Deal Name *</Label>
        <Input
          id="dealName"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enterprise Plan - Acme Corp"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Value ($)</Label>
          <Input
            id="value"
            type="number"
            value={formData.value || ''}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="50000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            type="number"
            max="100"
            value={formData.probability || ''}
            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
            placeholder="50"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select value={formData.stage || 'discovery'} onValueChange={(v) => setFormData({ ...formData, stage: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discovery">Discovery</SelectItem>
              <SelectItem value="qualification">Qualification</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedClose">Expected Close</Label>
          <Input
            id="expectedClose"
            type="date"
            value={formData.expectedCloseDate || ''}
            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="bg-vivid-tangerine hover:bg-tangerine-dark" disabled={loading}>
          {loading ? 'Saving...' : 'Save Deal'}
        </Button>
      </div>
    </form>
  )
}
