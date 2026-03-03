'use client'

import { useEffect, useState, useCallback } from 'react'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  completedAt: string | null
  contact: {
    id: string
    firstName: string | null
    lastName: string | null
  } | null
  createdAt: string
}

interface UseTasksParams {
  status?: string
  limit?: number
}

interface UseTasksResult {
  data: Task[]
  loading: boolean
  error: string | null
  refetch: () => void
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>
}

export function useTasks(params: UseTasksParams = {}): UseTasksResult {
  const { status, limit = 10 } = params
  const [data, setData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      if (status) queryParams.set('status', status)
      queryParams.set('limit', limit.toString())

      const response = await fetch(`/api/tasks?${queryParams}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch tasks')
      }
    } catch (err) {
      setError('Failed to fetch tasks')
      console.error('Tasks fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [status, limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
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
      console.error('Update task error:', err)
      return false
    }
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, updateTask }
}
