'use client'

import { useEffect, useState, useCallback } from 'react'

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
    city: string | null
    state: string | null
    country: string | null
  } | null
  score: number
  status: string
  lastActivity: string
  enrichmentStatus: string | null
  gdprConsent: boolean
  createdAt: string
}

interface SearchFilters {
  query?: string
  industry?: string
  seniority?: string
  companySize?: string
  location?: string
  page?: number
  limit?: number
}

interface SearchResult {
  data: Lead[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: SearchFilters
}

interface EnrichmentStats {
  totalEnriched: number
  pendingEnrichment: number
  dataPoints: number
  lastUpdated: string
}

interface EnrichmentJob {
  id: string
  name: string
  description: string | null
  progress: number
  status: string
  startedAt: string
}

interface AnalysisInsight {
  type: string
  title: string
  description: string
}

interface AnalysisRecommendation {
  priority: string
  action: string
  target: string
  reason: string
}

interface AnalysisData {
  overview: {
    totalContacts: number
    totalCompanies: number
    hotLeads: number
    avgScore: number
  }
  insights: AnalysisInsight[]
  recommendations: AnalysisRecommendation[]
}

interface CompanyAnalysis {
  id: string
  name: string
  industry: string | null
  size: string | null
  revenue: string | null
  scores: {
    fit: number
    intent: number
    engagement: number
  }
  contacts: number
  deals: number
  insights: string[]
  recommendedActions: string[]
}

interface ContactAnalysis {
  id: string
  name: string
  title: string | null
  seniority: string | null
  company: string | null
  scores: {
    overall: number
    engagement: number
    influence: number
  }
  engagement: {
    opens: number
    clicks: number
    responses: number
  }
  bestTimeToReach: string
  communicationStyle: string
  recommendedApproach: string[]
}

export function useLeadSearch() {
  const [data, setData] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (filters: SearchFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.query) params.set('q', filters.query)
      if (filters.industry) params.set('industry', filters.industry)
      if (filters.seniority) params.set('seniority', filters.seniority)
      if (filters.companySize) params.set('companySize', filters.companySize)
      if (filters.location) params.set('location', filters.location)
      params.set('page', (filters.page || 1).toString())
      params.set('limit', (filters.limit || 20).toString())

      const response = await fetch(`/api/intelligence/search?${params}`)
      const result = await response.json()
      if (result.success) {
        setData(result)
      } else {
        setError(result.error || 'Search failed')
      }
    } catch (err) {
      setError('Search failed')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, search }
}

export function useEnrichment() {
  const [stats, setStats] = useState<EnrichmentStats | null>(null)
  const [queue, setQueue] = useState<EnrichmentJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEnrichmentData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/intelligence/enrich')
      const result = await response.json()
      if (result.success) {
        setStats(result.data.stats)
        setQueue(result.data.queue)
      } else {
        setError(result.error || 'Failed to fetch enrichment data')
      }
    } catch (err) {
      setError('Failed to fetch enrichment data')
      console.error('Enrichment fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const startEnrichment = useCallback(async (contactIds: string[], type: string = 'contact') => {
    try {
      const response = await fetch('/api/intelligence/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds, type }),
      })
      const result = await response.json()
      if (result.success) {
        fetchEnrichmentData()
        return result.data
      }
      return null
    } catch (err) {
      console.error('Start enrichment error:', err)
      return null
    }
  }, [fetchEnrichmentData])

  useEffect(() => {
    fetchEnrichmentData()
  }, [fetchEnrichmentData])

  return { stats, queue, loading, error, refetch: fetchEnrichmentData, startEnrichment }
}

export function useAnalysis(type: 'overview' | 'company' | 'contact' = 'overview', id?: string) {
  const [data, setData] = useState<AnalysisData | CompanyAnalysis | ContactAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('type', type)
      if (id) params.set('id', id)

      const response = await fetch(`/api/intelligence/analyze?${params}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (err) {
      setError('Analysis failed')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }, [type, id])

  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  return { data, loading, error, refetch: fetchAnalysis }
}
