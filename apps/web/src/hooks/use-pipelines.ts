"use client"

import { useCallback, useEffect, useState } from "react"
import { getErrorMessage } from "@/lib/api-client"

export interface PipelineStage {
    id: string
    name: string
    order: number
    dealsCount?: number
    dealsValue?: number
}

interface PipelineApiItem {
    id: string
    name: string
    stages: PipelineStage[]
}

const DEFAULT_STAGES: PipelineStage[] = [
    { id: "default-lead", name: "Lead", order: 1 },
    { id: "default-qualified", name: "Qualified", order: 2 },
    { id: "default-proposal", name: "Proposal", order: 3 },
    { id: "default-negotiation", name: "Negotiation", order: 4 },
    { id: "default-closed-won", name: "Closed Won", order: 5 },
]

export function usePipelines() {
    const [stages, setStages] = useState<PipelineStage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/workspace/crm/pipelines", {
                credentials: "same-origin",
                cache: "no-store",
            })

            if (!response.ok) {
                throw new Error(`Pipelines request failed (${response.status})`)
            }

            const pipelines = await response.json() as PipelineApiItem[]
            const firstPipelineStages = pipelines[0]?.stages ?? DEFAULT_STAGES
            setStages(firstPipelineStages)
            setError(null)
        } catch (err) {
            setStages([])
            setError(getErrorMessage(err, "Failed to fetch pipeline stages"))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    return { stages, isLoading, error, refresh: load }
}
