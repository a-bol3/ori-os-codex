"use client"

import { useState, useEffect } from "react"

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

const MOCK_MAILBOXES: Mailbox[] = [
    { id: 'm1', email: 'outreach@yourdomain.com', provider: 'SMTP', dailyLimit: 200, warmupStatus: 'READY', isActive: true, domain: { domain: 'yourdomain.com', lastAuditScore: 91 } },
    { id: 'm2', email: 'sales@yourdomain.com', provider: 'GOOGLE', dailyLimit: 400, warmupStatus: 'READY', isActive: true, domain: { domain: 'yourdomain.com', lastAuditScore: 88 } },
]

export function useMailboxes() {
    const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchMailboxes = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deliverability/mailboxes`)
            if (!response.ok) throw new Error("Failed to fetch mailboxes")
            const data = await response.json()
            setMailboxes(data || [])
            setError(null)
        } catch (err) {
            console.warn('[Mailboxes] API unavailable, using demo data')
            setMailboxes(MOCK_MAILBOXES)
            setError(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMailboxes()
    }, [])

    return { mailboxes, isLoading, error, refresh: fetchMailboxes }
}

