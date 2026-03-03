"use client"

import { useState, useEffect, useCallback } from "react"

export interface Deal {
    id: string
    name: string
    value: number
    stage: string
    probability: number
    expectedClose?: string
    company?: string // Virtual property for UI
    owner?: string // Virtual property for UI
}

const MOCK_DEALS: Deal[] = [
    { id: 'm1', name: 'Acme Corp Enterprise License', value: 85000, stage: 'Negotiation', probability: 75, expectedClose: '2026-03-15', company: 'Acme Corp', owner: 'James K.' },
    { id: 'm2', name: 'TechFlow SaaS Bundle', value: 42000, stage: 'Proposal', probability: 55, expectedClose: '2026-03-30', company: 'TechFlow', owner: 'Anna S.' },
    { id: 'm3', name: 'DataVault Integration', value: 31500, stage: 'Qualified', probability: 40, expectedClose: '2026-04-10', company: 'DataVault', owner: 'James K.' },
    { id: 'm4', name: 'CloudSync Platform', value: 29000, stage: 'Lead', probability: 25, expectedClose: '2026-04-30', company: 'CloudSync', owner: 'Anna S.' },
    { id: 'm5', name: 'NexusAI Pilot', value: 18000, stage: 'Qualified', probability: 35, expectedClose: '2026-05-01', company: 'NexusAI', owner: 'James K.' },
]

export function useDeals() {
    const [deals, setDeals] = useState<Deal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDeals = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/deals`)
            if (!response.ok) throw new Error("Failed to fetch deals")
            const data = await response.json()

            const normalizedData = data.map((d: any) => ({
                ...d,
                // API returns valueAmount, frontend expects value
                value: d.valueAmount ?? d.value ?? 0,
                // API returns stage as a relation object with a name field
                stage: d.stage?.name ?? d.stageName ?? d.stage ?? 'Unknown',
                // Company from relation
                company: d.company?.name ?? d.organization?.name ?? '—',
                owner: d.owner?.name ?? '—',
                expectedClose: d.closeDate
                    ? new Date(d.closeDate).toLocaleDateString()
                    : d.expectedCloseDate
                        ? new Date(d.expectedCloseDate).toLocaleDateString()
                        : 'TBD',
                // Probability from stage if not set
                probability: d.probability ?? d.stage?.probability ?? 0,
            }))

            setDeals(normalizedData)
            setError(null)
        } catch (err) {
            console.warn('[Deals] API unavailable, using demo data')
            setDeals(MOCK_DEALS)
            setError(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDeals()
    }, [fetchDeals])

    return { deals, isLoading, error, refresh: fetchDeals }
}

