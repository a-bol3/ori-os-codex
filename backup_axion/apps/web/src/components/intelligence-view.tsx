'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Linkedin,
  Mail,
  Phone,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Target,
  BarChart3,
  ChevronDown,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserPlus,
  Building,
  ArrowRight,
  X,
  Zap,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { useLeadSearch, useEnrichment, useAnalysis } from '@/hooks/use-intelligence'
import { useContacts } from '@/hooks/use-contacts'
import { toast } from 'sonner'

interface Lead {
  id: string
  firstName: string | null
  lastName: string | null
  name: string
  email: string | null
  phone: string | null
  title: string | null
  seniority: string | null
  linkedin: string | null
  company: {
    id: string
    name: string
    industry: string | null
    size: string | null
    website: string | null
    location: string
  } | null
  score: number
  status: string
  lastActivity: string
  enrichmentStatus: string | null
  gdprConsent: boolean
  createdAt: string
}

export function IntelligenceView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('discover')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedSeniority, setSelectedSeniority] = useState('all-levels')
  const [selectedCompanySize, setSelectedCompanySize] = useState('all-sizes')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [leadDetailOpen, setLeadDetailOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [enrichingLeads, setEnrichingLeads] = useState(false)

  const { setCurrentView } = useAppStore()
  const { data: searchResult, loading: searchLoading, error: searchError, search } = useLeadSearch()
  const { stats: enrichmentStats, queue: enrichmentQueue, loading: enrichmentLoading, refetch: refetchEnrichment, startEnrichment } = useEnrichment()
  const { data: analysisData, loading: analysisLoading, refetch: refetchAnalysis } = useAnalysis('overview')
  const { createContact } = useContacts({})

  // Initial search on mount
  useEffect(() => {
    search({})
  }, [search])

  const handleSearch = useCallback(() => {
    search({
      query: searchQuery,
      industry: selectedIndustry === 'all' ? undefined : selectedIndustry,
      seniority: selectedSeniority === 'all-levels' ? undefined : selectedSeniority,
      companySize: selectedCompanySize === 'all-sizes' ? undefined : selectedCompanySize,
      location: selectedLocation || undefined,
    })
    setSelectedLeads([])
  }, [search, searchQuery, selectedIndustry, selectedSeniority, selectedCompanySize, selectedLocation])

  const handleLeadSelect = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (searchResult?.data) {
      if (selectedLeads.length === searchResult.data.length) {
        setSelectedLeads([])
      } else {
        setSelectedLeads(searchResult.data.map(l => l.id))
      }
    }
  }

  const handleAddToCRM = async (lead: Lead) => {
    const success = await createContact({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      title: lead.title,
      status: 'lead',
    })
    if (success) {
      toast.success(`${lead.name} added to CRM!`)
    } else {
      toast.error('Failed to add to CRM')
    }
  }

  const handleEnrichSelected = async () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to enrich')
      return
    }
    setEnrichingLeads(true)
    const result = await startEnrichment(selectedLeads)
    if (result) {
      toast.success(`Started enriching ${result.contactCount} leads`)
      setSelectedLeads([])
    } else {
      toast.error('Failed to start enrichment')
    }
    setEnrichingLeads(false)
  }

  const handleViewProfile = (lead: Lead) => {
    setSelectedLead(lead)
    setLeadDetailOpen(true)
  }

  const handleExport = () => {
    if (!searchResult?.data || searchResult.data.length === 0) {
      toast.error('No data to export')
      return
    }
    
    const leadsToExport = selectedLeads.length > 0 
      ? searchResult.data.filter(l => selectedLeads.includes(l.id))
      : searchResult.data
    
    const csvContent = [
      ['Name', 'Email', 'Title', 'Company', 'Industry', 'Score', 'Status'].join(','),
      ...leadsToExport.map(l => [
        l.name,
        l.email || '',
        l.title || '',
        l.company?.name || '',
        l.company?.industry || '',
        l.score,
        l.status,
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${leadsToExport.length} leads`)
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500'
    if (score >= 65) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'destructive'
      case 'warm': return 'default'
      default: return 'secondary'
    }
  }

  const leads = searchResult?.data || []
  const pagination = searchResult?.pagination

  return (
    <div className="space-y-6 p-6">
      {/* Lead Detail Dialog */}
      <Dialog open={leadDetailOpen} onOpenChange={setLeadDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-vivid-tangerine text-white">
                      {selectedLead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      {selectedLead.name}
                      <Badge variant={getStatusColor(selectedLead.status) as "destructive" | "default" | "secondary"}>
                        {selectedLead.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedLead.title} at {selectedLead.company?.name || 'Unknown Company'}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Scores */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Lead Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(selectedLead.score)}`}>
                        {selectedLead.score}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Enrichment</p>
                      <Badge variant={selectedLead.enrichmentStatus === 'complete' ? 'default' : 'secondary'}>
                        {selectedLead.enrichmentStatus || 'Not started'}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">GDPR Consent</p>
                      <Badge variant={selectedLead.gdprConsent ? 'default' : 'destructive'}>
                        {selectedLead.gdprConsent ? 'Granted' : 'Not granted'}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedLead.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selectedLead.email}`} className="text-vivid-tangerine hover:underline">
                          {selectedLead.email}
                        </a>
                      </div>
                    )}
                    {selectedLead.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.phone}</span>
                      </div>
                    )}
                    {selectedLead.linkedin && (
                      <div className="flex items-center gap-2 text-sm">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <a href={`https://${selectedLead.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-vivid-tangerine hover:underline">
                          {selectedLead.linkedin}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Company Info */}
                {selectedLead.company && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {selectedLead.company.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Industry</p>
                          <p className="font-medium">{selectedLead.company.industry || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium">{selectedLead.company.size || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{selectedLead.company.location || 'Unknown'}</p>
                        </div>
                        {selectedLead.company.website && (
                          <div>
                            <p className="text-muted-foreground">Website</p>
                            <a href={selectedLead.company.website} target="_blank" rel="noopener noreferrer" className="text-vivid-tangerine hover:underline text-sm">
                              {selectedLead.company.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-vivid-tangerine hover:bg-tangerine-dark" onClick={() => handleAddToCRM(selectedLead)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to CRM
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => startEnrichment([selectedLead.id])}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enrich Data
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView('engagement')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Intelligence Center</h1>
          <p className="text-muted-foreground">Find, enrich, and analyze your target accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => { refetchEnrichment(); refetchAnalysis(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
          <Button 
            size="sm" 
            className="bg-vivid-tangerine hover:bg-tangerine-dark"
            onClick={() => { setSearchQuery(''); handleSearch(); }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Search
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, title, or keywords..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSeniority} onValueChange={setSelectedSeniority}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Seniority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-levels">All Levels</SelectItem>
                <SelectItem value="c-level">C-Level</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="mid">Mid-Level</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCompanySize} onValueChange={setSelectedCompanySize}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sizes">All Sizes</SelectItem>
                <SelectItem value="1-10">1-10</SelectItem>
                <SelectItem value="11-50">11-50</SelectItem>
                <SelectItem value="51-200">51-200</SelectItem>
                <SelectItem value="201-500">201-500</SelectItem>
                <SelectItem value="501-1000">501-1000</SelectItem>
                <SelectItem value="1000+">1000+</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-vivid-tangerine hover:bg-tangerine-dark" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="card-hover cursor-pointer" onClick={() => setCurrentView('crm')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-vivid-tangerine" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                    <p className="text-xl font-bold">{pagination?.total || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover cursor-pointer" onClick={() => { setSearchQuery(''); handleSearch(); }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hot Leads</p>
                    <p className="text-xl font-bold">{leads.filter(l => l.status === 'hot').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover cursor-pointer" onClick={() => setCurrentView('crm')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Companies</p>
                    <p className="text-xl font-bold">{new Set(leads.map(l => l.company?.id).filter(Boolean)).size}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-xl font-bold">
                      {leads.length > 0 ? Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Discovery Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Discovery Sources</CardTitle>
              <CardDescription>Data aggregated from multiple sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { source: 'LinkedIn', count: leads.filter(l => l.linkedin).length, icon: Linkedin },
                  { source: 'Email Validated', count: leads.filter(l => l.email).length, icon: Mail },
                  { source: 'Company Data', count: leads.filter(l => l.company).length, icon: Building2 },
                  { source: 'Enriched', count: leads.filter(l => l.enrichmentStatus === 'complete').length, icon: Sparkles },
                ].map((source) => (
                  <div
                    key={source.source}
                    className="flex items-center gap-3 border border-border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <source.icon className="h-6 w-6 text-vivid-tangerine" />
                    <div>
                      <p className="text-sm text-muted-foreground">{source.source}</p>
                      <p className="text-lg font-bold">{source.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>Discovered Leads</CardTitle>
                {selectedLeads.length > 0 && (
                  <Badge variant="secondary">{selectedLeads.length} selected</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedLeads.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleEnrichSelected} disabled={enrichingLeads}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {enrichingLeads ? 'Enriching...' : 'Enrich Selected'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedLeads([])}>
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {selectedLeads.length === leads.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-10 w-10" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                  <p className="text-muted-foreground">{searchError}</p>
                  <Button variant="outline" onClick={handleSearch} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leads found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {leads.map((lead, index) => (
                      <motion.div
                        key={lead.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                        className={`flex items-center justify-between border p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          selectedLeads.includes(lead.id) ? 'border-vivid-tangerine bg-vivid-tangerine/5' : 'border-border'
                        }`}
                        onClick={() => handleLeadSelect(lead.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-vivid-tangerine text-white">
                              {lead.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{lead.name || 'Unknown'}</p>
                              <Badge variant={getStatusColor(lead.status) as "destructive" | "default" | "secondary"} className="text-xs">
                                {lead.status}
                              </Badge>
                              {lead.enrichmentStatus === 'complete' && (
                                <Badge variant="outline" className="text-xs text-green-500 border-green-500">
                                  Enriched
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {lead.title || 'Unknown title'} at {lead.company?.name || 'Unknown company'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center hidden md:block">
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className={`font-bold ${getScoreColor(lead.score)}`}>{lead.score}</p>
                          </div>
                          <div className="text-center hidden lg:block">
                            <p className="text-xs text-muted-foreground">Industry</p>
                            <p className="text-sm font-medium">{lead.company?.industry || 'Unknown'}</p>
                          </div>
                          <div className="text-center hidden lg:block">
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-medium">{lead.company?.location || 'Unknown'}</p>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewProfile(lead)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleAddToCRM(lead)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewProfile(lead)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddToCRM(lead)}>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Add to CRM
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => startEnrichment([lead.id])}>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Enrich Data
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setCurrentView('engagement')}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Add to Campaign
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

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => search({ ...searchResult.filters, page: pagination.page - 1 })}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => search({ ...searchResult.filters, page: pagination.page + 1 })}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrichment" className="space-y-6">
          {/* Enrichment Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Enriched</p>
                    <p className="text-xl font-bold">{enrichmentStats?.totalEnriched.toLocaleString() || 0}</p>
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
                    <p className="text-xl font-bold">{enrichmentStats?.pendingEnrichment || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data Points</p>
                    <p className="text-xl font-bold">{enrichmentStats?.dataPoints || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-vivid-tangerine" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-xl font-bold">{enrichmentStats?.lastUpdated || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrichment Queue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Enrichment Queue</CardTitle>
                <CardDescription>Contacts and companies being enriched</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={refetchEnrichment}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {enrichmentLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : enrichmentQueue.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No enrichment jobs in progress</p>
                  <Button 
                    variant="link" 
                    className="text-vivid-tangerine"
                    onClick={() => setActiveTab('discover')}
                  >
                    Select leads to enrich
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrichmentQueue.map((job) => (
                    <div key={job.id} className="flex items-center justify-between border border-border p-4">
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={job.progress} />
                        </div>
                        <span className="text-sm font-medium">{job.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Enrichment Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Enrichment</CardTitle>
              <CardDescription>Enrich your existing data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => { setActiveTab('discover'); handleSelectAll(); }}>
                  <Users className="h-6 w-6 text-vivid-tangerine" />
                  <span>Enrich All Contacts</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setCurrentView('crm')}>
                  <Building className="h-6 w-6 text-blue-500" />
                  <span>Enrich Companies</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => toast.info('LinkedIn sync coming soon!')}>
                  <Linkedin className="h-6 w-6 text-[#0A66C2]" />
                  <span>Sync from LinkedIn</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {analysisLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : analysisData && 'overview' in analysisData ? (
            <>
              {/* Overview Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-vivid-tangerine" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Contacts</p>
                        <p className="text-xl font-bold">{analysisData.overview.totalContacts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Companies</p>
                        <p className="text-xl font-bold">{analysisData.overview.totalCompanies}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Hot Leads</p>
                        <p className="text-xl font-bold">{analysisData.overview.hotLeads}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Score</p>
                        <p className="text-xl font-bold">{analysisData.overview.avgScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-vivid-tangerine" />
                    AI-Powered Insights
                  </CardTitle>
                  <CardDescription>Intelligent analysis of your lead data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisData.insights.map((insight, i) => (
                    <div key={i} className="border border-border p-4">
                      <div className="flex items-start gap-3">
                        {insight.type === 'trend' && <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />}
                        {insight.type === 'opportunity' && <Target className="h-5 w-5 text-vivid-tangerine mt-0.5" />}
                        {insight.type === 'alert' && <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                        <div>
                          <p className="font-medium">{insight.title}</p>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Next Steps</CardTitle>
                  <CardDescription>AI-suggested actions based on your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-center justify-between border border-border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setCurrentView('crm')}
                      >
                        <div className="flex items-center gap-3">
                          {rec.priority === 'high' ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : rec.priority === 'medium' ? (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          <div>
                            <p className="font-medium">{rec.action}</p>
                            <p className="text-sm text-muted-foreground">{rec.target}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={
                            rec.priority === 'high' ? 'border-red-500 text-red-500' :
                            rec.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                            'border-green-500 text-green-500'
                          }>
                            {rec.priority}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Generate Full Report */}
              <Button className="w-full bg-vivid-tangerine hover:bg-tangerine-dark" size="lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Full Analysis Report
              </Button>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
