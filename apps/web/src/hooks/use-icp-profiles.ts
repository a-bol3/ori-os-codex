"use client"

import { useState, useEffect } from "react"

export interface IcpProfile {
    id: string
    name: string
    criteriaJson: any
    blacklistPersonasJson: any
    regionsJson: any
    createdAt: string
    updatedAt: string
}

const MOCK_ICP_PROFILES: IcpProfile[] = [
    {
        id: 'm1',
        name: 'B2B SaaS – VP Engineering',
        criteriaJson: { industries: ['SaaS', 'Technology'], seniority: ['VP', 'Director', 'C-Level'], companySize: '50-500' },
        blacklistPersonasJson: {},
        regionsJson: { include: ['US', 'CA', 'GB', 'AU'] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'm2',
        name: 'Enterprise – Procurement & Finance',
        criteriaJson: { industries: ['Enterprise', 'Finance', 'Manufacturing'], seniority: ['CFO', 'Head of Procurement'], companySize: '500+' },
        blacklistPersonasJson: {},
        regionsJson: { include: ['DE', 'FR', 'NL', 'US'] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
]

export function useIcpProfiles() {
    const [profiles, setProfiles] = useState<IcpProfile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfiles = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intelligence/icp`)
            if (!response.ok) throw new Error("Failed to fetch ICP profiles")
            const data = await response.json()
            setProfiles(data || [])
            setError(null)
        } catch (err) {
            console.warn('[ICP Profiles] API unavailable, using demo data')
            setProfiles(MOCK_ICP_PROFILES)
            setError(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProfiles()
    }, [])

    return { profiles, isLoading, error, refresh: fetchProfiles }
}
