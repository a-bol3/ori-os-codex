import { useState, useEffect, useCallback } from 'react'

// Types
export interface Block {
  id: string
  pageId: string
  type: string
  content: any
  properties: any
  parentId: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkspacePage {
  id: string
  organizationId: string
  parentId: string | null
  title: string
  icon: string | null
  coverImage: string | null
  content: any
  type: string
  fullWidth: boolean
  isPublic: boolean
  order: number
  isArchived: boolean
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
  children?: WorkspacePage[]
  blocks?: Block[]
  database?: KnowledgeDatabase
  parent?: WorkspacePage
}

export interface KnowledgeDatabase {
  id: string
  organizationId: string
  pageId: string
  name: string
  description: string | null
  icon: string | null
  createdAt: Date
  updatedAt: Date
  page?: WorkspacePage
  properties?: KnowledgeProperty[]
  views?: KnowledgeView[]
  rows?: KnowledgeRow[]
  rowCount?: number
}

export interface KnowledgeProperty {
  id: string
  databaseId: string
  name: string
  type: string
  config: any
  order: number
}

export interface KnowledgeView {
  id: string
  databaseId: string
  name: string
  type: string
  filters: any
  sorts: any
  groupBy: string | null
  visibleProperties: any
  isDefault: boolean
}

export interface KnowledgeRow {
  id: string
  databaseId: string
  values: Record<string, any>
  order: number
  linkedContactId: string | null
  linkedCompanyId: string | null
  linkedDealId: string | null
  createdAt: Date
  updatedAt: Date
  comments?: KnowledgeComment[]
}

export interface KnowledgeComment {
  id: string
  rowId: string
  userId: string | null
  content: string
  resolved: boolean
  resolvedAt: Date | null
  createdAt: Date
}

// Hook for pages list
export function usePages(parentId?: string | null) {
  const [pages, setPages] = useState<WorkspacePage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (parentId !== undefined) {
        params.append('parentId', parentId || 'null')
      }

      const response = await fetch(`/api/pages?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setPages(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch pages')
    } finally {
      setLoading(false)
    }
  }, [parentId])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const createPage = async (pageData: Partial<WorkspacePage>) => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      })
      const data = await response.json()

      if (data.success) {
        setPages(prev => [...prev, data.data])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create page' }
    }
  }

  return {
    pages,
    loading,
    error,
    refetch: fetchPages,
    createPage,
  }
}

// Hook for single page
export function usePage(id: string | null) {
  const [page, setPage] = useState<WorkspacePage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/pages/${id}`)
      const data = await response.json()

      if (data.success) {
        setPage(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch page')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  const updatePage = async (updates: Partial<WorkspacePage>) => {
    if (!id) return { success: false, error: 'No page ID' }

    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await response.json()

      if (data.success) {
        setPage(prev => prev ? { ...prev, ...data.data } : data.data)
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to update page' }
    }
  }

  const deletePage = async () => {
    if (!id) return { success: false, error: 'No page ID' }

    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to delete page' }
    }
  }

  return {
    page,
    loading,
    error,
    refetch: fetchPage,
    updatePage,
    deletePage,
  }
}

// Hook for blocks
export function useBlocks(pageId: string | null) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBlocks = useCallback(async () => {
    if (!pageId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/pages/${pageId}/blocks`)
      const data = await response.json()

      if (data.success) {
        setBlocks(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch blocks')
    } finally {
      setLoading(false)
    }
  }, [pageId])

  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  const createBlock = async (blockData: Partial<Block>) => {
    if (!pageId) return { success: false, error: 'No page ID' }

    try {
      const response = await fetch(`/api/pages/${pageId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData),
      })
      const data = await response.json()

      if (data.success) {
        setBlocks(prev => [...prev, data.data])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create block' }
    }
  }

  const updateBlocks = async (updates: { id: string; order: number }[]) => {
    if (!pageId) return { success: false, error: 'No page ID' }

    try {
      const response = await fetch(`/api/pages/${pageId}/blocks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: updates }),
      })
      const data = await response.json()

      if (data.success) {
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to update blocks' }
    }
  }

  return {
    blocks,
    loading,
    error,
    refetch: fetchBlocks,
    createBlock,
    updateBlocks,
    setBlocks,
  }
}

// Hook for databases
export function useDatabases() {
  const [databases, setDatabases] = useState<KnowledgeDatabase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDatabases = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/databases')
      const data = await response.json()

      if (data.success) {
        setDatabases(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch databases')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDatabases()
  }, [fetchDatabases])

  const createDatabase = async (dbData: { name: string; description?: string; icon?: string }) => {
    try {
      const response = await fetch('/api/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbData),
      })
      const data = await response.json()

      if (data.success) {
        setDatabases(prev => [data.data, ...prev])
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create database' }
    }
  }

  return {
    databases,
    loading,
    error,
    refetch: fetchDatabases,
    createDatabase,
  }
}

// Hook for single database
export function useDatabase(id: string | null) {
  const [database, setDatabase] = useState<KnowledgeDatabase | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDatabase = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/databases/${id}`)
      const data = await response.json()

      if (data.success) {
        setDatabase(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch database')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDatabase()
  }, [fetchDatabase])

  const createRow = async (values: Record<string, any>) => {
    if (!id) return { success: false, error: 'No database ID' }

    try {
      const response = await fetch(`/api/databases/${id}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      })
      const data = await response.json()

      if (data.success) {
        setDatabase(prev => {
          if (!prev) return prev
          return {
            ...prev,
            rows: [...(prev.rows || []), data.data],
          }
        })
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create row' }
    }
  }

  return {
    database,
    loading,
    error,
    refetch: fetchDatabase,
    createRow,
  }
}

// Hook for page tree (recursive pages)
export function usePageTree() {
  const [pages, setPages] = useState<WorkspacePage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch all pages without parent filter, we'll build the tree
      const response = await fetch('/api/pages')
      const data = await response.json()

      if (data.success) {
        setPages(data.data)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch pages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  // Build tree structure
  const buildTree = (pages: WorkspacePage[]): WorkspacePage[] => {
    const rootPages = pages.filter(p => !p.parentId)
    const getChildPages = (parentId: string): WorkspacePage[] => {
      return pages
        .filter(p => p.parentId === parentId)
        .map(p => ({ ...p, children: getChildPages(p.id) }))
    }
    return rootPages.map(p => ({ ...p, children: getChildPages(p.id) }))
  }

  const pageTree = buildTree(pages)

  const createPage = async (pageData: Partial<WorkspacePage>) => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      })
      const data = await response.json()

      if (data.success) {
        fetchPages() // Refetch to rebuild tree
        return { success: true, data: data.data }
      }
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: 'Failed to create page' }
    }
  }

  return {
    pages,
    pageTree,
    loading,
    error,
    refetch: fetchPages,
    createPage,
  }
}
