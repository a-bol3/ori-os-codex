"use client"

import { useEffect, useState } from "react"
import { fetchWorkspaceJson, getErrorMessage } from "@/lib/api-client"

export interface IcpProfile {
    id: string
    name: string
    criteriaJson: any
    blacklistPersonasJson: any
    regionsJson: any
    createdAt: string
    updatedAt: string
}

export function useIcpProfiles() {
    const [profiles, setProfiles] = useState<IcpProfile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfiles = async () => {
        setIsLoading(true)
        try {
            const data = await fetchWorkspaceJson<{ items?: IcpProfile[] } | IcpProfile[]>("/api/workspace/intelligence/icp")
            setProfiles(Array.isArray(data) ? data : (data.items ?? []))
            setError(null)
        } catch (err) {
            setProfiles([])
            setError(getErrorMessage(err, "Failed to fetch ICP profiles"))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchProfiles() }, [])

    return { profiles, isLoading, error, refresh: fetchProfiles }
}
