"use client"

import { useState, useEffect } from "react"
import { apiFetch, getErrorMessage } from "@/lib/api-client"

export interface Mailbox {
    id: string
    email: string
    provider: string
    dailyLimit: number
    warmupStatus: string
    isActive: boolean
    domain?: {
        domain: string
        lastAuditScore?: number
    }
}

export function useMailboxes() {
    const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchMailboxes = async () => {
        setIsLoading(true)
        try {
            const response = await apiFetch("/deliverability/mailboxes")
            const data = await response.json()
            setMailboxes(data || [])
            setError(null)
        } catch (err) {
            console.warn('[Mailboxes] API unavailable', err)
            setMailboxes([])
            setError(getErrorMessage(err, "Failed to fetch mailboxes"))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMailboxes()
    }, [])

    return { mailboxes, isLoading, error, refresh: fetchMailboxes }
}
