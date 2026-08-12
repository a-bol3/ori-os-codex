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

const MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'm1', name: 'Q1 SaaS Outreach — VP Engineering', status: 'RUNNING', recipients: 142, sent: 97, opened: 37, replies: 14, openRate: '38%', objective: 'Book demo calls', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: 'm2', name: 'Enterprise Finance — CFO Sequence', status: 'PAUSED', recipients: 55, sent: 31, opened: 7, replies: 4, openRate: '22%', objective: 'Drive enterprise deals', createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: 'm3', name: 'Cold Outreach APAC — Winter 2026', status: 'DRAFT', recipients: 0, sent: 0, opened: 0, replies: 0, openRate: '0%', objective: 'Expand into APAC', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
]

const MOCK_MESSAGES: InboxMessage[] = [
    { id: 'm1', from: 'Marcus Rivera', subject: 'Re: Q1 SaaS Outreach — VP Engineering', preview: 'Hey, this is really timely. Would love to hop on a quick call this week...', time: '2m ago', unread: true },
    { id: 'm2', from: 'Elena Volkov', subject: 'Re: Q1 SaaS Outreach — VP Engineering', preview: 'Thanks for reaching out! We are actually evaluating similar solutions right now...', time: '1h ago', unread: true },
    { id: 'm3', from: 'James Okonkwo', subject: 'Re: Enterprise Finance — CFO Sequence', preview: 'Could you send over more info on pricing? We have budget allocated for Q2...', time: '3h ago', unread: false },
]

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
            if (process.env.NODE_ENV === "development") {
                console.warn('[Engagement] API unavailable, using demo data')
                setCampaigns(MOCK_CAMPAIGNS)
                setMessages(MOCK_MESSAGES)
                setError(null)
            } else {
                setCampaigns([])
                setMessages([])
                setError(getErrorMessage(err, "Failed to fetch engagement data"))
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { campaigns, messages, isLoading, error, refresh: fetchData }
}
