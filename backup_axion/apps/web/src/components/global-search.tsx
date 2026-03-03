'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  User,
  Building2,
  DollarSign,
  Mail,
  Zap,
  FileText,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSearch, useGlobalSearch, type SearchResult } from '@/hooks/use-search'

const typeIcons: Record<string, React.ReactNode> = {
  contact: <User className="h-4 w-4" />,
  company: <Building2 className="h-4 w-4" />,
  deal: <DollarSign className="h-4 w-4" />,
  campaign: <Mail className="h-4 w-4" />,
  workflow: <Zap className="h-4 w-4" />,
  page: <FileText className="h-4 w-4" />,
}

interface GlobalSearchProps {
  onNavigate?: (type: string, id: string) => void
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const { open, query, setQuery, closeSearch } = useGlobalSearch()
  const { results, loading } = useSearch(query)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleSelect = (result: SearchResult) => {
    if (onNavigate) {
      onNavigate(result.type, result.id)
    }
    closeSearch()
  }

  const allResults = [
    ...results.contacts,
    ...results.companies,
    ...results.deals,
    ...results.campaigns,
    ...results.workflows,
    ...results.pages,
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={closeSearch}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <div className="bg-card shadow-2xl border border-border overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search contacts, companies, deals..."
                  className="border-0 shadow-none focus-visible:ring-0 text-lg"
                />
                {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                <Button variant="ghost" size="icon" onClick={closeSearch}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Results */}
              <ScrollArea className="max-h-[400px]">
                {query.length >= 2 && (
                  <div className="p-2">
                    {allResults.length === 0 && !loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>No results found for "{query}"</p>
                      </div>
                    ) : (
                      <>
                        {results.contacts.length > 0 && (
                          <ResultSection title="Contacts" results={results.contacts} onSelect={handleSelect} />
                        )}
                        {results.companies.length > 0 && (
                          <ResultSection title="Companies" results={results.companies} onSelect={handleSelect} />
                        )}
                        {results.deals.length > 0 && (
                          <ResultSection title="Deals" results={results.deals} onSelect={handleSelect} />
                        )}
                        {results.campaigns.length > 0 && (
                          <ResultSection title="Campaigns" results={results.campaigns} onSelect={handleSelect} />
                        )}
                        {results.workflows.length > 0 && (
                          <ResultSection title="Workflows" results={results.workflows} onSelect={handleSelect} />
                        )}
                        {results.pages.length > 0 && (
                          <ResultSection title="Pages" results={results.pages} onSelect={handleSelect} />
                        )}
                      </>
                    )}
                  </div>
                )}

                {query.length < 2 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Start typing to search...</p>
                    <p className="text-sm mt-1">Search across contacts, companies, deals, and more</p>
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="p-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-muted border border-border">ESC</kbd>
                  <span>to close</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-muted border border-border">↑↓</kbd>
                  <span>to navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-muted border border-border">↵</kbd>
                  <span>to select</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ResultSection({
  title,
  results,
  onSelect,
}: {
  title: string
  results: SearchResult[]
  onSelect: (result: SearchResult) => void
}) {
  return (
    <div className="mb-2">
      <p className="text-xs font-medium text-muted-foreground px-2 py-1">{title}</p>
      {results.map((result) => (
        <button
          key={result.id}
          onClick={() => onSelect(result)}
          className="w-full flex items-center gap-3 px-2 py-2 hover:bg-muted text-left"
        >
          <span className="text-lg">{result.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{result.title}</p>
            <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </button>
      ))}
    </div>
  )
}
