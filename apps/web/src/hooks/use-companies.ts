"use client"

import { useState, useEffect } from "react"

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

const MOCK_COMPANIES: Company[] = [
    { id: 'm1', name: 'Acme Corp', domain: 'acmecorp.com', industry: 'Technology', size: '500-1000', location: 'Austin, US', status: 'Customer', contactsCount: 8 },
    { id: 'm2', name: 'TechFlow', domain: 'techflow.io', industry: 'SaaS', size: '50-200', location: 'San Francisco, US', status: 'Customer', contactsCount: 3 },
    { id: 'm3', name: 'DataVault', domain: 'datavault.eu', industry: 'Data & Analytics', size: '200-500', location: 'Berlin, DE', status: 'Prospect', contactsCount: 5 },
    { id: 'm4', name: 'CloudSync', domain: 'cloudsync.io', industry: 'Infrastructure', size: '10-50', location: 'London, UK', status: 'Lead', contactsCount: 2 },
    { id: 'm5', name: 'NexusAI', domain: 'nexusai.com', industry: 'Artificial Intelligence', size: '10-50', location: 'Bengaluru, IN', status: 'Lead', contactsCount: 1 },
]

export function useCompanies() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCompanies = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/companies`)
            if (!response.ok) throw new Error("Failed to fetch companies")
            const data = await response.json()

            const normalizedData = data.map((c: any) => ({
                ...c,
                status: c.status || 'Prospect',
                location: c.city ? `${c.city}, ${c.country || ''}`.trim().replace(/,$/, '') : (c.country || '—'),
                size: c.sizeBand || c.size || '—',
                contactsCount: c._count?.contacts ?? c.contacts?.length ?? 0,
            }))

            setCompanies(normalizedData)
            setError(null)
        } catch (err) {
            console.warn('[Companies] API unavailable, using demo data')
            setCompanies(MOCK_COMPANIES)
            setError(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCompanies()
    }, [])

    return { companies, isLoading, error, refresh: fetchCompanies }
}

