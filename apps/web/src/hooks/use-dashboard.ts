"use client"

import { useState, useEffect } from "react"

export interface DashboardActivity {
    id: string
    title: string
    description: string
    time: string
    type: string
}

export interface DashboardStats {
    total: number
    thisMonth: number
    growth?: number
}

export interface DashboardDealStats {
    total: number
    value: number
    byStage: any[]
}

export interface DashboardCampaignStats {
    total: number
    active: number
    sent: number
    opened: number
    lastSendDate: string | null
}

export interface DashboardWorkflowStats {
    total: number
    active: number
    runs: number
    lastRunDate: string | null
}

export interface DashboardData {
    contacts: DashboardStats
    companies: DashboardStats
    deals: DashboardDealStats
    campaigns: DashboardCampaignStats
    workflows: DashboardWorkflowStats
    seo: { projects: number }
    compliance: { gdprRequests: number }
    recentActivity: DashboardActivity[]
}

const DEMO_DATA: DashboardData = {
    contacts: { total: 2847, thisMonth: 142, growth: 12 },
    companies: { total: 341, thisMonth: 28 },
    deals: { total: 156, value: 1240000, byStage: [] },
    campaigns: { total: 12, active: 3, sent: 18942, opened: 4231, lastSendDate: new Date(Date.now() - 7200000).toISOString() },
    workflows: { total: 24, active: 7, runs: 1560, lastRunDate: new Date(Date.now() - 14400000).toISOString() },
    seo: { projects: 4 },
    compliance: { gdprRequests: 2 },
    recentActivity: [
        { id: '1', title: 'New contact added', description: 'Sarah Chen from TechFlow', time: new Date().toISOString(), type: 'contact' },
        { id: '2', title: 'Deal moved to Negotiation', description: 'Acme Corp Enterprise License', time: new Date(Date.now() - 900000).toISOString(), type: 'deal' },
        { id: '3', title: 'Email campaign launched', description: 'Q1 SaaS Outreach — 142 recipients', time: new Date(Date.now() - 3600000).toISOString(), type: 'campaign' },
    ],
}

export function useDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboard = async () => {
        setIsLoading(true)
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const response = await fetch(`${baseUrl}/dashboard`)
            if (!response.ok) throw new Error("Failed to fetch dashboard data")
            const result = await response.json()
            setData(result)
            setError(null)
        } catch (err) {
            console.warn('[Dashboard] API unavailable, using demo data', err)
            setData(DEMO_DATA)
            // We set error to null because we have a demo fallback, 
            // but we could also keep it if we want to show a warning.
            setError(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    return { data, isLoading, error, refresh: fetchDashboard }
}
