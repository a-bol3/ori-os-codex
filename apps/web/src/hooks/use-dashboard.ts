"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchWorkspaceJson, getErrorMessage } from "@/lib/api-client";

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
    byStage: Array<Record<string, unknown>>
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

export function useDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await fetchWorkspaceJson<DashboardData>("/api/workspace/dashboard")
            setData(result)
            setError(null)
        } catch (err) {
            setData(null)
            setError(getErrorMessage(err, "Failed to fetch dashboard data"))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboard()
    }, [fetchDashboard])

    return { data, isLoading, error, refresh: fetchDashboard }
}
