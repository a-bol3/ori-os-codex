'use client'

import { useEffect, useState, useCallback } from 'react'

// Types
interface Contact {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  title: string | null
  department: string | null
  seniority: string | null
  linkedin: string | null
  twitter: string | null
  status: string
  source: string | null
  score: number | null
  companyId: string | null
  company: {
    id: string
    name: string
    industry: string | null
  } | null
  lastContactedAt: string | null
  openCount: number
  responseCount: number
  clickCount: number
  gdprConsent: boolean
  createdAt: string
}

interface Company {
  id: string
  name: string
  domain: string | null
  website: string | null
  logo: string | null
  description: string | null
  industry: string | null
  size: string | null
  revenue: string | null
  type: string | null
  status: string
  city: string | null
  state: string | null
  country: string | null
  score: number | null
  _count?: {
    contacts: number
    deals: number
  }
  createdAt: string
}

interface Deal {
  id: string
  name: string
  value: number | null
  currency: string
  probability: number | null
  stage: string
  status: string
  expectedCloseDate: string | null
  actualCloseDate: string | null
  companyId: string | null
  primaryContactId: string | null
  company: {
    id: string
    name: string
    industry: string | null
  } | null
  primaryContact: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
  } | null
  createdAt: string
}

interface Activity {
  id: string
  type: string
  title: string | null
  description: string | null
  metadata: string | null
  occurredAt: string
  contact: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
  } | null
  company: {
    id: string
    name: string
  } | null
  deal: {
    id: string
    name: string
  } | null
}

interface CRMStats {
  totalContacts: number
  totalCompanies: number
  pipelineValue: number
  winRate: number
  dealsByStage: Record<string, { count: number; value: number }>
}

// Hook for CRM Stats
export function useCRMStats() {
  const [stats, setStats] = useState<CRMStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [contactsRes, companiesRes, dealsRes] = await Promise.all([
        fetch('/api/contacts?limit=1'),
        fetch('/api/companies?limit=1'),
        fetch('/api/deals?limit=100'),
      ])

      const contactsData = await contactsRes.json()
      const companiesData = await companiesRes.json()
      const dealsData = await dealsRes.json()

      if (contactsData.success && companiesData.success && dealsData.success) {
        const deals = dealsData.data || []
        const pipelineValue = deals
          .filter((d: Deal) => d.status === 'open')
          .reduce((sum: number, d: Deal) => sum + (d.value || 0), 0)

        const wonDeals = deals.filter((d: Deal) => d.status === 'won').length
        const totalClosed = deals.filter((d: Deal) => d.status === 'won' || d.status === 'lost').length
        const winRate = totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : 0

        const dealsByStage: Record<string, { count: number; value: number }> = {}
        deals.filter((d: Deal) => d.status === 'open').forEach((d: Deal) => {
          if (!dealsByStage[d.stage]) {
            dealsByStage[d.stage] = { count: 0, value: 0 }
          }
          dealsByStage[d.stage].count++
          dealsByStage[d.stage].value += d.value || 0
        })

        setStats({
          totalContacts: contactsData.pagination?.total || 0,
          totalCompanies: companiesData.pagination?.total || 0,
          pipelineValue,
          winRate,
          dealsByStage,
        })
      }
    } catch (err) {
      setError('Failed to fetch CRM stats')
      console.error('CRM stats error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

// Hook for Contacts
interface UseContactsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  companyId?: string
}

export function useCRMContacts(params: UseContactsParams = {}) {
  const { page = 1, limit = 20, search = '', status = '', companyId = '' } = params
  const [data, setData] = useState<Contact[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      queryParams.set('limit', limit.toString())
      if (search) queryParams.set('search', search)
      if (status) queryParams.set('status', status)

      const response = await fetch(`/api/contacts?${queryParams}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.error || 'Failed to fetch contacts')
      }
    } catch (err) {
      setError('Failed to fetch contacts')
      console.error('Contacts fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, status])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createContact = useCallback(async (contact: Partial<Contact>): Promise<Contact | null> => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return result.data
      }
      return null
    } catch (err) {
      console.error('Create contact error:', err)
      return null
    }
  }, [fetchData])

  const updateContact = useCallback(async (id: string, updates: Partial<Contact>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Update contact error:', err)
      return false
    }
  }, [fetchData])

  const deleteContact = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Delete contact error:', err)
      return false
    }
  }, [fetchData])

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchData,
    createContact,
    updateContact,
    deleteContact,
  }
}

// Hook for Companies
interface UseCompaniesParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export function useCRMCompanies(params: UseCompaniesParams = {}) {
  const { page = 1, limit = 20, search = '', status = '' } = params
  const [data, setData] = useState<Company[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      queryParams.set('limit', limit.toString())
      if (search) queryParams.set('search', search)
      if (status) queryParams.set('status', status)

      const response = await fetch(`/api/companies?${queryParams}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.error || 'Failed to fetch companies')
      }
    } catch (err) {
      setError('Failed to fetch companies')
      console.error('Companies fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, status])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createCompany = useCallback(async (company: Partial<Company>): Promise<Company | null> => {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return result.data
      }
      return null
    } catch (err) {
      console.error('Create company error:', err)
      return null
    }
  }, [fetchData])

  const updateCompany = useCallback(async (id: string, updates: Partial<Company>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Update company error:', err)
      return false
    }
  }, [fetchData])

  const deleteCompany = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Delete company error:', err)
      return false
    }
  }, [fetchData])

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchData,
    createCompany,
    updateCompany,
    deleteCompany,
  }
}

// Hook for Deals
interface UseDealsParams {
  page?: number
  limit?: number
  stage?: string
  status?: string
}

export function useCRMDeals(params: UseDealsParams = {}) {
  const { page = 1, limit = 20, stage = '', status = '' } = params
  const [data, setData] = useState<Deal[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      queryParams.set('limit', limit.toString())
      if (stage) queryParams.set('stage', stage)
      if (status) queryParams.set('status', status)

      const response = await fetch(`/api/deals?${queryParams}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.error || 'Failed to fetch deals')
      }
    } catch (err) {
      setError('Failed to fetch deals')
      console.error('Deals fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, limit, stage, status])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createDeal = useCallback(async (deal: Partial<Deal>): Promise<Deal | null> => {
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return result.data
      }
      return null
    } catch (err) {
      console.error('Create deal error:', err)
      return null
    }
  }, [fetchData])

  const updateDeal = useCallback(async (id: string, updates: Partial<Deal>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Update deal error:', err)
      return false
    }
  }, [fetchData])

  const deleteDeal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Delete deal error:', err)
      return false
    }
  }, [fetchData])

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchData,
    createDeal,
    updateDeal,
    deleteDeal,
  }
}

// Hook for single entity details
export function useContactDetails(id: string | null) {
  const [data, setData] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/contacts/${id}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch contact')
      }
    } catch (err) {
      setError('Failed to fetch contact')
      console.error('Contact details error:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  return { data, loading, error, refetch: fetchDetails }
}

export function useCompanyDetails(id: string | null) {
  const [data, setData] = useState<(Company & { contacts: Contact[]; deals: Deal[]; activities: Activity[]; totalValue: number }) | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/companies/${id}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch company')
      }
    } catch (err) {
      setError('Failed to fetch company')
      console.error('Company details error:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  return { data, loading, error, refetch: fetchDetails }
}

export function useDealDetails(id: string | null) {
  const [data, setData] = useState<(Deal & { activities: Activity[] }) | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/deals/${id}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch deal')
      }
    } catch (err) {
      setError('Failed to fetch deal')
      console.error('Deal details error:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  return { data, loading, error, refetch: fetchDetails }
}
