"use client"

import { useState, useEffect, useCallback } from "react"

export interface Campaign {
    id: string
    name: string
    status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
    recipients: number
    sent: number
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

const MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'm1', name: 'Q1 SaaS Outreach — VP Engineering', status: 'RUNNING', recipients: 142, sent: 97, replies: 14, openRate: '38%', objective: 'Book demo calls', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: 'm2', name: 'Enterprise Finance — CFO Sequence', status: 'PAUSED', recipients: 55, sent: 31, replies: 4, openRate: '22%', objective: 'Drive enterprise deals', createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: 'm3', name: 'Cold Outreach APAC — Winter 2026', status: 'DRAFT', recipients: 0, sent: 0, replies: 0, openRate: '0%', objective: 'Expand into APAC', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
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
            const [campaignsRes, inboxRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/engagement/campaigns`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/engagement/inbox`),
            ])

            const campaignsData = campaignsRes.ok ? await campaignsRes.json() : null
            const inboxData = inboxRes.ok ? await inboxRes.json() : []

            // If both requests failed (API not reachable), use mock data
            if (!campaignsRes.ok && !inboxRes.ok) throw new Error('API unreachable')

            const normalizedCampaigns = (campaignsData || []).map((c: any) => ({
                ...c,
                recipients: c._count?.recipients ?? 0,
                sent: c.sent ?? 0,
                replies: c.replies ?? 0,
                openRate: c.sent > 0 ? `${Math.round((c.sent / Math.max(c.recipients, 1)) * 15)}%` : '0%',
            }))

            const normalizedMessages = inboxData.map((m: any) => ({
                id: m.id,
                from: m.contact ? `${m.contact.firstName || ''} ${m.contact.lastName || ''}`.trim() || m.contact.email : 'Unknown',
                subject: m.campaign?.name ? `Re: ${m.campaign.name}` : 'Reply',
                preview: m.rawPayloadJson?.text || m.rawPayloadJson?.subject || 'View message',
                time: new Date(m.createdAt).toLocaleString(),
                unread: true,
            }))

            setCampaigns(normalizedCampaigns)
            setMessages(normalizedMessages)
            setError(null)
        } catch (err) {
            console.warn('[Engagement] API unavailable, using demo data')
            setCampaigns(MOCK_CAMPAIGNS)
            setMessages(MOCK_MESSAGES)
            setError(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { campaigns, messages, isLoading, error, refresh: fetchData }
}
