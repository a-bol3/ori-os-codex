'use client'

import { useEffect, useState, useCallback } from 'react'

// Types
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

interface Workflow {
  id: string
  name: string
  description: string | null
  category: string | null
  status: string
  triggerType: string
  triggerConfig: Record<string, unknown>
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  errorHandling: string
  maxRetries: number
  runCount: number
  successCount: number
  errorCount: number
  lastRunAt: string | null
  isTemplate: boolean
  createdAt: string
  successRate?: number
}

interface WorkflowRun {
  id: string
  workflowId: string
  status: string
  triggerType: string
  triggerData: Record<string, unknown> | null
  startedAt: string | null
  completedAt: string | null
  duration: number | null
  output: Record<string, unknown> | null
  error: string | null
  workflow: {
    id: string
    name: string
    category: string | null
  }
  createdAt: string
}

interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  totalRuns: number
  avgSuccessRate: number
}

// Hook for Workflow Stats
export function useWorkflowStats() {
  const [stats, setStats] = useState<WorkflowStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/workflows?limit=100')
      const result = await response.json()

      if (result.success) {
        const workflows = result.data || []
        const totalRuns = workflows.reduce((sum: number, w: Workflow) => sum + w.runCount, 0)
        const totalSuccess = workflows.reduce((sum: number, w: Workflow) => sum + w.successCount, 0)
        const avgSuccessRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100 * 10) / 10 : 0

        setStats({
          totalWorkflows: workflows.length,
          activeWorkflows: workflows.filter((w: Workflow) => w.status === 'active').length,
          totalRuns,
          avgSuccessRate,
        })
      }
    } catch (err) {
      setError('Failed to fetch workflow stats')
      console.error('Workflow stats error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

// Hook for Workflows List
interface UseWorkflowsParams {
  page?: number
  limit?: number
  status?: string
  category?: string
}

export function useWorkflows(params: UseWorkflowsParams = {}) {
  const { page = 1, limit = 20, status = '', category = '' } = params
  const [data, setData] = useState<Workflow[]>([])
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
      if (status) queryParams.set('status', status)
      if (category) queryParams.set('category', category)

      const response = await fetch(`/api/workflows?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        // Calculate success rate for each workflow
        const workflowsWithRate = result.data.map((w: Workflow) => ({
          ...w,
          successRate: w.runCount > 0 ? Math.round((w.successCount / w.runCount) * 100 * 10) / 10 : 0,
        }))
        setData(workflowsWithRate)
        setPagination(result.pagination)
      } else {
        setError(result.error || 'Failed to fetch workflows')
      }
    } catch (err) {
      setError('Failed to fetch workflows')
      console.error('Workflows fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, limit, status, category])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createWorkflow = useCallback(async (workflow: Partial<Workflow>): Promise<Workflow | null> => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return result.data
      }
      return null
    } catch (err) {
      console.error('Create workflow error:', err)
      return null
    }
  }, [fetchData])

  const updateWorkflow = useCallback(async (id: string, updates: Partial<Workflow>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
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
      console.error('Update workflow error:', err)
      return false
    }
  }, [fetchData])

  const deleteWorkflow = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Delete workflow error:', err)
      return false
    }
  }, [fetchData])

  const runWorkflow = useCallback(async (id: string, triggerData?: Record<string, unknown>): Promise<{ runId: string; status: string } | null> => {
    try {
      const response = await fetch(`/api/workflows/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType: 'manual', triggerData }),
      })
      const result = await response.json()
      if (result.success) {
        fetchData()
        return result.data
      }
      return null
    } catch (err) {
      console.error('Run workflow error:', err)
      return null
    }
  }, [fetchData])

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchData,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    runWorkflow,
  }
}

// Hook for single workflow details
export function useWorkflowDetails(id: string | null) {
  const [data, setData] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/workflows/${id}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch workflow')
      }
    } catch (err) {
      setError('Failed to fetch workflow')
      console.error('Workflow details error:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  return { data, loading, error, refetch: fetchDetails }
}

// Hook for Workflow Runs
interface UseWorkflowRunsParams {
  workflowId?: string
  status?: string
  limit?: number
}

export function useWorkflowRuns(params: UseWorkflowRunsParams = {}) {
  const { workflowId = '', status = '', limit = 20 } = params
  const [data, setData] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('limit', limit.toString())
      if (workflowId) queryParams.set('workflowId', workflowId)
      if (status) queryParams.set('status', status)

      const response = await fetch(`/api/workflow-runs?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch workflow runs')
      }
    } catch (err) {
      setError('Failed to fetch workflow runs')
      console.error('Workflow runs fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [workflowId, status, limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for Workflow Templates
export function useWorkflowTemplates(category?: string) {
  const [data, setData] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      if (category) queryParams.set('category', category)

      const response = await fetch(`/api/workflows/templates?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch templates')
      }
    } catch (err) {
      setError('Failed to fetch templates')
      console.error('Templates fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
