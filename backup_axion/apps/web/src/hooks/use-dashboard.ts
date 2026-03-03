'use client'

import { useState, useEffect } from 'react'

export interface DashboardData {
  contacts: { total: number; thisMonth: number; growth: number }
  companies: { total: number; thisMonth: number }
  deals: { total: number; value: number; byStage: any[] }
  campaigns: { total: number; active: number; sent: number; opened: number }
  workflows: { total: number; active: number; runs: number }
  recentActivity: Array<{
    id: string
    title: string
    description: string
    time: string
    type: string
  }>
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const result = await response.json()
        setData(result)
      } catch (err: any) {
        console.error('Dashboard fetch error:', err)
        setError(err)

        // Fallback to demo data if API fails (as per Phase 2 requirements)
        setData({
          contacts: { total: 1240, thisMonth: 145, growth: 12 },
          companies: { total: 856, thisMonth: 32 },
          deals: { total: 42, value: 245000, byStage: [] },
          campaigns: { total: 12, active: 3, sent: 4500, opened: 2100 },
          workflows: { total: 8, active: 5, runs: 124 },
          recentActivity: [
            { id: '1', title: 'New Contact', description: 'John Doe added to CRM', time: new Date().toISOString(), type: 'contact' },
            { id: '2', title: 'Campaign Sent', description: 'Q1 Outreach campaign launched', time: new Date().toISOString(), type: 'email' },
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return { data, loading, error }
}
