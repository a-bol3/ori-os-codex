"use client"

import { useCallback, useEffect, useState } from "react"
import { apiFetch, getErrorMessage } from "@/lib/api-client"

export interface CrmTask {
    id: string
    title: string
    description?: string | null
    status: "pending" | "completed"
    dueDate?: string | null
    createdAt?: string
}

export interface CrmActivity {
    id: string
    subject?: string | null
    body?: string | null
    type?: string
    createdAt: string
    metadataJson?: Record<string, unknown> | null
}

export interface CrmAuditLog {
    id: string
    action: string
    entityType?: string | null
    entityId?: string | null
    createdAt: string
    metadataJson?: Record<string, unknown> | null
}

interface CrmRecordDetail {
    id: string
    createdAt?: string
    tasks?: CrmTask[]
    activities?: CrmActivity[]
    auditLogs?: CrmAuditLog[]
    [key: string]: unknown
}

export function useCrmRecordDetails(
    entity: "contacts" | "companies" | "deals",
    recordId?: string | null,
) {
    const [detail, setDetail] = useState<CrmRecordDetail | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        if (!recordId) {
            setDetail(null)
            setError(null)
            return
        }

        setIsLoading(true)
        try {
            const response = await apiFetch(`/crm/${entity}/${recordId}`)
            const data = await response.json() as CrmRecordDetail
            setDetail(data)
            setError(null)
        } catch (err) {
            setDetail(null)
            setError(getErrorMessage(err, `Failed to fetch ${entity} detail`))
        } finally {
            setIsLoading(false)
        }
    }, [entity, recordId])

    useEffect(() => {
        void refresh()
    }, [refresh])

    const createTask = useCallback(async (payload: {
        title: string
        description?: string
        dueDate?: string
        contactId?: string
        companyId?: string
        dealId?: string
    }) => {
        await apiFetch("/crm/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        await refresh()
    }, [refresh])

    const createNote = useCallback(async (payload: {
        subject: string
        body: string
        contactId?: string
        companyId?: string
        dealId?: string
    }) => {
        await apiFetch("/activities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "NOTE",
                ...payload,
            }),
        })
        await refresh()
    }, [refresh])

    const updateTask = useCallback(async (taskId: string, payload: {
        title?: string
        description?: string
        dueDate?: string | null
        status?: "pending" | "completed"
    }) => {
        await apiFetch(`/crm/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        await refresh()
    }, [refresh])

    return { detail, isLoading, error, refresh, createTask, createNote, updateTask }
}
