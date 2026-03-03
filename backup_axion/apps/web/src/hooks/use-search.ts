import { useState, useCallback, useEffect } from 'react'

export interface SearchResult {
  id: string
  type: 'contact' | 'company' | 'deal' | 'campaign' | 'workflow' | 'page'
  title: string
  subtitle: string
  icon: string
}

export interface SearchResults {
  contacts: SearchResult[]
  companies: SearchResult[]
  deals: SearchResult[]
  campaigns: SearchResult[]
  workflows: SearchResult[]
  pages: SearchResult[]
}

export function useSearch(query: string, debounceMs = 300) {
  const [results, setResults] = useState<SearchResults>({
    contacts: [],
    companies: [],
    deals: [],
    campaigns: [],
    workflows: [],
    pages: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults({
        contacts: [],
        companies: [],
        deals: [],
        campaigns: [],
        workflows: [],
        pages: [],
      })
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs, performSearch])

  return { results, loading, error, search: performSearch }
}

export function useGlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const openSearch = useCallback(() => {
    setOpen(true)
    setQuery('')
  }, [])

  const closeSearch = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape' && open) {
        closeSearch()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, closeSearch])

  return { open, query, setQuery, openSearch, closeSearch }
}
