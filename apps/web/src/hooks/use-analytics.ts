"use client"

import { useState, useEffect } from "react"

export interface AnalyticsData {
    revenue: { total: string; change: string; trend: 'up' | 'down' };
    leads: { total: string; change: string; trend: 'up' | 'down' };
    conversion: { total: string; change: string; trend: 'up' | 'down' };
    dealSize: { total: string; change: string; trend: 'up' | 'down' };
    sources: Array<{ source: string, value: number, color: string }>;
    revenueTrend: Array<{ month: string, revenue: number }>;
    funnel: Array<{ stage: string, count: number, value: number }>;
}

export function useAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true)
            try {
                const [overviewRes, trendRes, funnelRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/overview`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/revenue-trend`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/funnel`)
                ])

                if (!overviewRes.ok || !trendRes.ok || !funnelRes.ok)
                    throw new Error("Failed to fetch analytics data")

                const overview = await overviewRes.json()
                const revenueTrend = await trendRes.json()
                const funnel = await funnelRes.json()

                setData({
                    ...overview,
                    revenueTrend,
                    funnel: funnel || []
                })
            } catch (err) {
                console.error('Fetch analytics failed, using mock data:', err)
                setData({
                    revenue: { total: '$1.4M', change: '+24%', trend: 'up' },
                    leads: { total: '3,120', change: '+15%', trend: 'up' },
                    conversion: { total: '3.4%', change: '+0.9%', trend: 'up' },
                    dealSize: { total: '$45K', change: '-2%', trend: 'down' },
                    sources: [
                        { source: 'Organic Search', value: 38, color: 'bg-blue-500' },
                        { source: 'Paid Ads', value: 25, color: 'bg-green-500' },
                        { source: 'Referrals', value: 22, color: 'bg-tangerine' },
                        { source: 'Direct', value: 15, color: 'bg-purple-500' },
                    ],
                    revenueTrend: [
                        { month: 'Jan', revenue: 45000 },
                        { month: 'Feb', revenue: 52000 },
                        { month: 'Mar', revenue: 48000 },
                        { month: 'Apr', revenue: 61000 },
                        { month: 'May', revenue: 55000 },
                        { month: 'Jun', revenue: 67000 },
                    ],
                    funnel: [
                        { stage: 'Prospecting', count: 120, value: 1200000 },
                        { stage: 'Qualification', count: 80, value: 800000 },
                        { stage: 'Proposal', count: 45, value: 450000 },
                        { stage: 'Negotiation', count: 20, value: 200000 },
                        { stage: 'Closed Won', count: 12, value: 120000 },
                    ]
                })
            } finally {
                setIsLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

    return { data, isLoading }
}
