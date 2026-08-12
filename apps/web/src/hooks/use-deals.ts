"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchWorkspaceJson, getErrorMessage } from "@/lib/api-client"

export interface Deal {
    id: string
    name: string
    value: number
    stage: string
    probability: number
    companyId?: string
    contactId?: string
    contactName?: string
    closeDate?: string
    expectedClose?: string
    company?: string
    owner?: string
}

interface DealApiItem {
    id: string
    name: string
    valueAmount?: number | null
    value?: number | null
    probability?: number | null
    closeDate?: string | null
    expectedCloseDate?: string | null
    stage?: {
        name?: string | null
        probability?: number | null
    } | string | null
    stageName?: string | null
    company?: {
        id?: string | null
        name?: string | null
    } | null
    contact?: {
        id?: string | null
        firstName?: string | null
        lastName?: string | null
        email?: string | null
    } | null
    organization?: {
        name?: string | null
    } | null
    owner?: {
        name?: string | null
    } | null
}

interface DealListResponse {
    items: DealApiItem[]
    total: number
    limit: number
    offset: number
    hasMore: boolean
}

export function useDeals() {
    const [deals, setDeals] = useState<Deal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDeals = useCallback(async () => {
        setIsLoading(true)
        try {
            const payload = await fetchWorkspaceJson<DealApiItem[] | DealListResponse>("/api/workspace/crm/deals")
            const data = Array.isArray(payload) ? payload : payload.items

            const normalizedData: Deal[] = data.map((deal) => ({
                id: deal.id,
                name: deal.name,
                value: deal.valueAmount ?? deal.value ?? 0,
                stage: typeof deal.stage === 'string' ? deal.stage : deal.stage?.name ?? deal.stageName ?? 'Unknown',
                probability: deal.probability ?? (typeof deal.stage === 'string' ? 0 : deal.stage?.probability) ?? 0,
                companyId: deal.company?.id ?? undefined,
                contactId: deal.contact?.id ?? undefined,
                contactName: `${deal.contact?.firstName || ''} ${deal.contact?.lastName || ''}`.trim() || deal.contact?.email || undefined,
                closeDate: deal.closeDate ?? deal.expectedCloseDate ?? undefined,
                expectedClose: deal.closeDate
                    ? new Date(deal.closeDate).toLocaleDateString()
                    : deal.expectedCloseDate
                        ? new Date(deal.expectedCloseDate).toLocaleDateString()
                        : 'TBD',
                company: deal.company?.name ?? deal.organization?.name ?? '-',
                owner: deal.owner?.name ?? '-',
            }))

            setDeals(normalizedData)
            setError(null)
        } catch (err) {
            setDeals([])
            setError(getErrorMessage(err, "Failed to fetch deals"))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDeals()
    }, [fetchDeals])

    return { deals, isLoading, error, refresh: fetchDeals }
}
