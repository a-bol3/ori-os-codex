"use client"

import { useState, useEffect } from "react"

export interface Contact {
    id: string
    firstName: string
    lastName: string
    name?: string // Virtual property for UI
    email: string
    phone?: string
    jobTitle?: string
    company?: string // Virtual property for UI
    location?: string
    status: "Active" | "Inactive"
}

const MOCK_CONTACTS: Contact[] = [
    { id: 'm1', firstName: 'Sarah', lastName: 'Chen', name: 'Sarah Chen', email: 'sarah@techflow.io', jobTitle: 'VP of Engineering', company: 'TechFlow', location: 'San Francisco, US', status: 'Active' },
    { id: 'm2', firstName: 'Marcus', lastName: 'Rivera', name: 'Marcus Rivera', email: 'm.rivera@acmecorp.com', jobTitle: 'CTO', company: 'Acme Corp', location: 'Austin, US', status: 'Active' },
    { id: 'm3', firstName: 'Elena', lastName: 'Volkov', name: 'Elena Volkov', email: 'elena@datavault.eu', jobTitle: 'Head of Data', company: 'DataVault', location: 'Berlin, DE', status: 'Active' },
    { id: 'm4', firstName: 'James', lastName: 'Okonkwo', name: 'James Okonkwo', email: 'james@cloudsync.io', jobTitle: 'CEO', company: 'CloudSync', location: 'London, UK', status: 'Active' },
    { id: 'm5', firstName: 'Priya', lastName: 'Sharma', name: 'Priya Sharma', email: 'priya@nexusai.com', jobTitle: 'Product Director', company: 'NexusAI', location: 'Bengaluru, IN', status: 'Inactive' },
]

export function useContacts() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchContacts = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/contacts`)
            if (!response.ok) throw new Error("Failed to fetch contacts")
            const data = await response.json()

            const normalizedData = data.map((c: any) => ({
                ...c,
                name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
                company: c.company?.name || c.organization?.name || '—',
                location: c.country || '—',
                status: c.optOut ? 'Inactive' : 'Active',
            }))

            setContacts(normalizedData)
            setError(null)
        } catch (err) {
            console.warn('[Contacts] API unavailable, using demo data')
            setContacts(MOCK_CONTACTS)
            setError(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchContacts()
    }, [])

    return { contacts, isLoading, error, refresh: fetchContacts }
}

