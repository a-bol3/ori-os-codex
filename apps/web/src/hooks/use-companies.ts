"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchWorkspaceJson, getErrorMessage } from "@/lib/api-client"

export interface Company {
    id: string
    name: string
    domain?: string
    industry?: string
    size?: string
    location?: string
    description?: string
    status: "Customer" | "Prospect" | "Lead"
    contactsCount: number
}

interface CompanyApiItem {
    id: string
    name: string
    domain?: string | null
    industry?: string | null
    size?: string | null
    sizeBand?: string | null
    city?: string | null
    country?: string | null
    description?: string | null
    status?: Company["status"] | null
    contacts?: unknown[]
    _count?: {
        contacts?: number
    }
}

interface CompanyListResponse {
    items: CompanyApiItem[]
    total: number
    limit: number
    offset: number
    hasMore: boolean
}

export function useCompanies() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCompanies = useCallback(async () => {
        setIsLoading(true)
        try {
            const payload = await fetchWorkspaceJson<CompanyApiItem[] | CompanyListResponse>("/api/workspace/crm/companies")
            const data = Array.isArray(payload) ? payload : payload.items

            const normalizedData: Company[] = data.map((company) => ({
                id: company.id,
                name: company.name,
                domain: company.domain ?? undefined,
                industry: company.industry ?? undefined,
                description: company.description ?? undefined,
                status: company.status || 'Prospect',
                location: company.city
                    ? `${company.city}, ${company.country || ''}`.trim().replace(/,$/, '')
                    : (company.country || '-'),
                size: company.sizeBand || company.size || '-',
                contactsCount: company._count?.contacts ?? company.contacts?.length ?? 0,
            }))

            setCompanies(normalizedData)
            setError(null)
        } catch (err) {
            setCompanies([])
            setError(getErrorMessage(err, "Failed to fetch companies"))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCompanies()
    }, [fetchCompanies])

    return { companies, isLoading, error, refresh: fetchCompanies }
}
