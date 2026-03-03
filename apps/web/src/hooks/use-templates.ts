"use client"

import { useState, useEffect, useCallback } from "react"

export interface Template {
    id: string
    name: string
    type: string
    uses: number
    lastEdited: string
    status: "Published" | "Draft"
}

export function useTemplates() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/templates`)
            if (!response.ok) throw new Error("Failed to fetch templates")
            const data = await response.json()

            setTemplates(data.length > 0 ? data : [
                { id: '1', name: 'Cold Outreach Template', type: 'Email', uses: 245, lastEdited: '2 days ago', status: 'Published' },
                { id: '2', name: 'Follow-up Sequence', type: 'Email', uses: 189, lastEdited: '1 week ago', status: 'Published' },
                { id: '3', name: 'Product Update Social', type: 'Social', uses: 45, lastEdited: '3 days ago', status: 'Draft' }
            ])
        } catch (err) {
            console.error('Fetch templates failed:', err)
            setTemplates([
                { id: '1', name: 'Cold Outreach Template', type: 'Email', uses: 245, lastEdited: '2 days ago', status: 'Published' }
            ])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates])

    return { templates, isLoading, refresh: fetchTemplates }
}
