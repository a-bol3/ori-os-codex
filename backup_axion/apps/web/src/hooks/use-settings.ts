import { useState, useEffect, useCallback } from 'react'

export interface OrganizationSettings {
  id: string
  name: string
  slug: string
  logo: string | null
  website: string | null
  industry: string | null
  size: string | null
  plan: string
  timezone: string
  locale: string
  currency: string
  gdprEnabled: boolean
  gdprDefaultRetention: number | null
  gdprContactEmail: string | null
}

export interface UserSettings {
  id: string
  email: string
  name: string | null
  image: string | null
  timezone: string
  locale: string
  theme: string
}

export function useSettings() {
  const [organization, setOrganization] = useState<OrganizationSettings | null>(null)
  const [user, setUser] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (data.success) {
        setOrganization(data.data.organization)
        setUser(data.data.user)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = async (updates: { organization?: Partial<OrganizationSettings>; user?: Partial<UserSettings> }) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()

      if (data.success) {
        if (updates.organization) {
          setOrganization(prev => prev ? { ...prev, ...updates.organization } : null)
        }
        if (updates.user) {
          setUser(prev => prev ? { ...prev, ...updates.user } : null)
        }
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to update settings' }
    }
  }

  return { organization, user, loading, error, refetch: fetchSettings, updateSettings }
}
