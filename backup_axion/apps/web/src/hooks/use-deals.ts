'use client'

import { useEffect, useState, useCallback } from 'react'

interface Deal {
  id: string
  name: string
  value: number | null
  currency: string
  stage: string
  status: string
  probability: number | null
  expectedCloseDate: string | null
  company: {
    id: string
    name: string
  } | null
  primaryContact: {
    id: string
    firstName: string | null
    lastName: string | null
  } | null
  createdAt: string
}

interface UseDealsParams {
  page?: number
  limit?: number
  stage?: string
  status?: string
}

interface UseDealsResult {
  data: Deal[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  loading: boolean
  error: string | null
  refetch: () => void
  createDeal: (deal: Partial<Deal>) => Promise<boolean>
}

export function useDeals(params: UseDealsParams = {}): UseDealsResult {
  const { page = 1, limit = 20, stage = '', status = '' } = params
  const [data, setData] = useState<Deal[]>([])
  const [pagination, setPagination] = useState<UseDealsResult['pagination']>(null)
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

  const createDeal = useCallback(async (deal: Partial<Deal>): Promise<boolean> => {
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Create deal error:', err)
      return false
    }
  }, [fetchData])

  return { data, pagination, loading, error, refetch: fetchData, createDeal }
}
