"use client"

import { useState, useEffect, useCallback } from "react"
import { getErrorMessage } from "@/lib/api-client"

export interface Campaign {
    id: string
    name: string
    status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
    recipients: number
    sent: number
    opened: number
    replies: number
    openRate: string
    objective?: string
    createdAt?: string
}

export interface InboxMessage {
    id: string
    from: string
    subject: string
    preview: string
    time: string
    unread: boolean
}

interface CampaignApiItem {
    id: string
    name: string
    status: Campaign['status']
    recipients?: number
    sent?: number
    opened?: number
    replies?: number
    objective?: string
    createdAt?: string
    _count?: {
        recipients?: number
    }
}

interface InboxApiItem {
    id: string
    createdAt: string
    contact?: {
        firstName?: string | null
        lastName?: string | null
        email?: string | null
    } | null
    campaign?: {
        name?: string | null
    } | null
    rawPayloadJson?: {
        text?: string | null
        subject?: string | null
    } | null
}

export function useEngagement() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [messages, setMessages] = useState<InboxMessage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [campaignsResult, inboxResult] = await Promise.allSettled([
                fetch("/api/workspace/engagement/campaigns", {
                    credentials: "same-origin",
                    cache: "no-store",
                }),
                fetch("/api/workspace/engagement/inbox", {
                    credentials: "same-origin",
                    cache: "no-store",
                }),
            ])

            if (campaignsResult.status !== "fulfilled") {
                throw campaignsResult.reason
            }

            const campaignsRes = campaignsResult.value

            if (!campaignsRes.ok) {
                const payload = await campaignsRes.json().catch(() => ({ message: null }))
                throw new Error(typeof payload?.message === "string" ? payload.message : typeof payload?.error === "string" ? payload.error : "Failed to load campaigns")
            }

            const campaignsData: CampaignApiItem[] | null = await campaignsRes.json()
            let inboxData: InboxApiItem[] = []

            if (inboxResult.status === "fulfilled") {
                const inboxRes = inboxResult.value

                if (inboxRes.ok) {
                    inboxData = await inboxRes.json()
                } else {
                    console.warn("[Engagement] Inbox endpoint returned an error. Continuing without inbox data.")
                }
            } else {
                console.warn("[Engagement] Inbox endpoint is unavailable. Continuing without inbox data.")
            }

            const normalizedCampaigns: Campaign[] = (campaignsData || []).map((campaign) => {
                const recipients = campaign._count?.recipients ?? campaign.recipients ?? 0
                const sent = campaign.sent ?? 0
                const opened = campaign.opened ?? 0
                const replies = campaign.replies ?? 0

                return {
                    ...campaign,
                    recipients,
                    sent,
                    opened,
                    replies,
                    openRate: sent > 0 ? `${Math.round((opened / Math.max(sent, 1)) * 100)}%` : '0%',
                }
            })

            const normalizedMessages: InboxMessage[] = inboxData.map((message) => ({
                id: message.id,
                from: message.contact ? `${message.contact.firstName || ''} ${message.contact.lastName || ''}`.trim() || message.contact.email || 'Unknown' : 'Unknown',
                subject: message.campaign?.name ? `Re: ${message.campaign.name}` : 'Reply',
                preview: message.rawPayloadJson?.text || message.rawPayloadJson?.subject || 'View message',
                time: new Date(message.createdAt).toLocaleString(),
                unread: true,
            }))

            setCampaigns(normalizedCampaigns)
            setMessages(normalizedMessages)
            setError(null)
        } catch (err) {
            setCampaigns([])
            setMessages([])
            setError(getErrorMessage(err, "Failed to fetch engagement data"))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { campaigns, messages, isLoading, error, refresh: fetchData }
}
