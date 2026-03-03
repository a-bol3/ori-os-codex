'use client'

import { useEffect, useState, useCallback } from 'react'

interface Contact {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  title: string | null
  status: string
  company: {
    id: string
    name: string
  } | null
  createdAt: string
}

interface UseContactsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

interface UseContactsResult {
  data: Contact[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  loading: boolean
  error: string | null
  refetch: () => void
  createContact: (contact: Partial<Contact>) => Promise<boolean>
}

export function useContacts(params: UseContactsParams = {}): UseContactsResult {
  const { page = 1, limit = 20, search = '', status = '' } = params
  const [data, setData] = useState<Contact[]>([])
  const [pagination, setPagination] = useState<UseContactsResult['pagination']>(null)
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

  const createContact = useCallback(async (contact: Partial<Contact>): Promise<boolean> => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Create contact error:', err)
      return false
    }
  }, [fetchData])

  return { data, pagination, loading, error, refetch: fetchData, createContact }
}
