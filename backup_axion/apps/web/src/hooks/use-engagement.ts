import { useState, useEffect, useCallback } from 'react'

// Types
export interface Campaign {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  totalRecipients: number
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  repliedCount: number
  bouncedCount: number
  unsubscribedCount: number
  trackingEnabled: boolean
  unsubscribeLink: boolean
  scheduledAt: Date | null
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  segment?: {
    id: string
    name: string
  }
  steps?: SequenceStep[]
  campaignContacts?: CampaignContact[]
}

export interface SequenceStep {
  id: string
  order: number
  type: string
  delayDays: number
  delayHours: number
  subject: string | null
  bodyHtml: string | null
  sentCount: number
  openedCount: number
  clickedCount: number
  repliedCount: number
}

export interface CampaignContact {
  id: string
  status: string
  currentStep: number
  sentAt: Date | null
  openedAt: Date | null
  repliedAt: Date | null
  contact: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
    company?: {
      id: string
      name: string
    }
  }
}

export interface EmailTemplate {
  id: string
  name: string
  description: string | null
  category: string | null
  subject: string
  previewText: string | null
  bodyHtml: string
  bodyText: string | null
  useCount: number
  createdAt: Date
}

export interface Domain {
  id: string
  domain: string
  status: string
  spfStatus: string
  dkimStatus: string
  dmarcStatus: string
  reputationScore: number | null
  bounceRate: number | null
  spamRate: number | null
  warmupEnabled: boolean
  warmupStatus: string | null
  dailyLimit: number
  monthlyLimit: number
  verifiedAt: Date | null
  mailboxes?: Mailbox[]
}

export interface Mailbox {
  id: string
  email: string
  displayName: string | null
  provider: string
  status: string
  dailySent: number
  dailyLimit: number
}

export interface EngagementStats {
  overview: {
    totalSent: number
    totalDelivered: number
    totalOpened: number
    totalClicked: number
    totalReplied: number
    totalBounced: number
    totalUnsubscribed: number
    openRate: number
    replyRate: number
    clickRate: number
    bounceRate: number
    deliverabilityRate: number
  }
  domains: {
    total: number
    verified: number
    avgReputation: number
  }
  templates: {
    total: number
  }
  campaigns: {
    total: number
    active: number
    draft: number
    completed: number
  }
  dailyStats: Array<{
    date: string
    sent: number
    opened: number
  }>
}

// Hook for campaigns
export function useCampaigns(status?: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (status) params.append('status', status)

      const response = await fetch(`/api/campaigns?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setCampaigns(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const createCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      })
      const data = await response.json()

      if (data.success) {
        setCampaigns(prev => [data.data, ...prev])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create campaign' }
    }
  }

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()

      if (data.success) {
        setCampaigns(prev => prev.map(c => c.id === id ? data.data : c))
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to update campaign' }
    }
  }

  const deleteCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        setCampaigns(prev => prev.filter(c => c.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to delete campaign' }
    }
  }

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  }
}

// Hook for single campaign
export function useCampaign(id: string | null) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaign = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${id}`)
      const data = await response.json()

      if (data.success) {
        setCampaign(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch campaign')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCampaign()
  }, [fetchCampaign])

  return { campaign, loading, error, refetch: fetchCampaign }
}

// Hook for templates
export function useTemplates(search?: string) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const response = await fetch(`/api/templates?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTemplates(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const createTemplate = async (templateData: Partial<EmailTemplate>) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      })
      const data = await response.json()

      if (data.success) {
        setTemplates(prev => [data.data, ...prev])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create template' }
    }
  }

  const updateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()

      if (data.success) {
        setTemplates(prev => prev.map(t => t.id === id ? data.data : t))
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to update template' }
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        setTemplates(prev => prev.filter(t => t.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to delete template' }
    }
  }

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}

// Hook for domains
export function useDomains(status?: string) {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (status) params.append('status', status)

      const response = await fetch(`/api/domains?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setDomains(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch domains')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  const createDomain = async (domainData: { domain: string; dailyLimit?: number; monthlyLimit?: number }) => {
    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(domainData),
      })
      const data = await response.json()

      if (data.success) {
        setDomains(prev => [data.data, ...prev])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create domain' }
    }
  }

  const updateDomain = async (id: string, updates: Partial<Domain>) => {
    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()

      if (data.success) {
        setDomains(prev => prev.map(d => d.id === id ? data.data : d))
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to update domain' }
    }
  }

  const deleteDomain = async (id: string) => {
    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        setDomains(prev => prev.filter(d => d.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to delete domain' }
    }
  }

  return {
    domains,
    loading,
    error,
    refetch: fetchDomains,
    createDomain,
    updateDomain,
    deleteDomain,
  }
}

// Hook for engagement stats
export function useEngagementStats() {
  const [stats, setStats] = useState<EngagementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/engagement/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch engagement stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
