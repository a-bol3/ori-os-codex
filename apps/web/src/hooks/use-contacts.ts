"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchWorkspaceJson, getErrorMessage } from "@/lib/api-client"

export interface Contact {
    id: string
    firstName: string
    lastName: string
    name?: string
    email: string
    phone?: string
    jobTitle?: string
    companyId?: string
    company?: string
    location?: string
    status: "Active" | "Inactive"
}

interface ContactApiItem {
    id: string
    firstName?: string | null
    lastName?: string | null
    email: string
    phone?: string | null
    jobTitle?: string | null
    country?: string | null
    optOut?: boolean | null
    company?: {
        id?: string | null
        name?: string | null
    } | null
    organization?: {
        name?: string | null
    } | null
}

interface ContactListResponse {
    items: ContactApiItem[]
    total: number
    limit: number
    offset: number
    hasMore: boolean
}

export function useContacts() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchContacts = useCallback(async () => {
        setIsLoading(true)
        try {
            const payload = await fetchWorkspaceJson<ContactApiItem[] | ContactListResponse>("/api/workspace/crm/contacts")
            const data = Array.isArray(payload) ? payload : payload.items

            const normalizedData: Contact[] = data.map((contact) => ({
                id: contact.id,
                firstName: contact.firstName ?? '',
                lastName: contact.lastName ?? '',
                name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
                email: contact.email,
                phone: contact.phone ?? undefined,
                jobTitle: contact.jobTitle ?? undefined,
                companyId: contact.company?.id ?? undefined,
                company: contact.company?.name || contact.organization?.name || '-',
                location: contact.country || '-',
                status: contact.optOut ? 'Inactive' : 'Active',
            }))

            setContacts(normalizedData)
            setError(null)
        } catch (err) {
            setContacts([])
            setError(getErrorMessage(err, "Failed to fetch contacts"))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchContacts()
    }, [fetchContacts])

    return { contacts, isLoading, error, refresh: fetchContacts }
}
