import { useState, useEffect, useCallback } from 'react'

// Types
export interface GDPRRequest {
  id: string
  type: string
  status: string
  contactEmail: string
  contactId: string | null
  downloadUrl: string | null
  expiresAt: Date | null
  errorMessage: string | null
  requestedAt: Date
  completedAt: Date | null
  createdAt: Date
}

export interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId: string | null
  changes: string | null
  metadata: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  userId: string | null
}

export interface ComplianceProfile {
  id: string
  name: string
  description: string | null
  gdprEnabled: boolean
  ccpaEnabled: boolean
  contactRetentionDays: number | null
  activityRetentionDays: number | null
  requireConsent: boolean
  consentTypes: string | null
  allowedCountries: string | null
  restrictedData: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Hook for GDPR requests
export function useGDPRRequests(status?: string, type?: string) {
  const [requests, setRequests] = useState<GDPRRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (type) params.append('type', type)

      const response = await fetch(`/api/gdpr-requests?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setRequests(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch GDPR requests')
    } finally {
      setLoading(false)
    }
  }, [status, type])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const createRequest = async (requestData: { type: string; contactEmail: string; contactId?: string }) => {
    try {
      const response = await fetch('/api/gdpr-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })
      const data = await response.json()

      if (data.success) {
        setRequests(prev => [data.data, ...prev])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create request' }
    }
  }

  const processRequest = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/gdpr-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, completedAt: status === 'completed' ? new Date() : null }),
      })
      const data = await response.json()

      if (data.success) {
        setRequests(prev => prev.map(r => r.id === id ? data.data : r))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to update request' }
    }
  }

  return { requests, loading, error, refetch: fetchRequests, createRequest, processRequest }
}

// Hook for audit logs
export function useAuditLogs(action?: string, resource?: string) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (action) params.append('action', action)
      if (resource) params.append('resource', resource)

      const response = await fetch(`/api/audit-logs?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }, [action, resource])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { logs, loading, error, refetch: fetchLogs }
}

// Hook for compliance profiles
export function useComplianceProfiles() {
  const [profiles, setProfiles] = useState<ComplianceProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/compliance-profiles')
      const data = await response.json()

      if (data.success) {
        setProfiles(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch profiles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const createProfile = async (profileData: Partial<ComplianceProfile>) => {
    try {
      const response = await fetch('/api/compliance-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })
      const data = await response.json()

      if (data.success) {
        setProfiles(prev => [...prev, data.data])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create profile' }
    }
  }

  const updateProfile = async (id: string, updates: Partial<ComplianceProfile>) => {
    try {
      const response = await fetch(`/api/compliance-profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()

      if (data.success) {
        setProfiles(prev => prev.map(p => p.id === id ? data.data : p))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to update profile' }
    }
  }

  const deleteProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/compliance-profiles/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        setProfiles(prev => prev.filter(p => p.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to delete profile' }
    }
  }

  return { profiles, loading, error, refetch: fetchProfiles, createProfile, updateProfile, deleteProfile }
}

// Hook for compliance stats
export function useComplianceStats() {
  const [stats, setStats] = useState({
    gdprRequests: 0,
    pendingRequests: 0,
    suppressionCount: 0,
    auditEvents: 0,
    consentRate: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const [gdprRes, auditRes, contactsRes] = await Promise.all([
        fetch('/api/gdpr-requests'),
        fetch('/api/audit-logs?limit=1000'),
        fetch('/api/contacts?limit=1000'),
      ])

      const [gdprData, auditData, contactsData] = await Promise.all([
        gdprRes.json(),
        auditRes.json(),
        contactsRes.json(),
      ])

      const gdprRequests = gdprData.success ? gdprData.data : []
      const auditLogs = auditData.success ? auditData.data : []
      const contacts = contactsData.success ? contactsData.data : []

      const consented = contacts.filter((c: { gdprConsent: boolean }) => c.gdprConsent).length
      const consentRate = contacts.length > 0 ? ((consented / contacts.length) * 100).toFixed(1) : '0'

      setStats({
        gdprRequests: gdprRequests.length,
        pendingRequests: gdprRequests.filter((r: { status: string }) => r.status === 'pending').length,
        suppressionCount: Math.floor(Math.random() * 100) + 100, // Mock for now
        auditEvents: auditLogs.length,
        consentRate: parseFloat(consentRate),
      })
    } catch (err) {
      console.error('Error fetching compliance stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}
