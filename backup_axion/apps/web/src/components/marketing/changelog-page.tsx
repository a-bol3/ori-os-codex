'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import changelogContent from '@content/product/changelog-content.json'
import type { ChangelogContent, ChangelogEntryType } from '@/types/content'

const content = changelogContent as ChangelogContent

type FilterType = 'all' | 'new' | 'improved' | 'fixed'

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: content.filters.all },
  { id: 'new', label: content.filters.features },
  { id: 'improved', label: content.filters.improvements },
  { id: 'fixed', label: content.filters.fixes },
]

const getBadgeVariant = (type: ChangelogEntryType) => {
  switch (type) {
    case 'new':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'improved':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'fixed':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    default:
      return 'bg-white/10 text-white/60 border-white/20'
  }
}

export function ChangelogPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filteredReleases = content.releases.map(release => ({
    ...release,
    changes: activeFilter === 'all' 
      ? release.changes 
      : release.changes.filter(change => change.type === activeFilter),
  })).filter(release => release.changes.length > 0)

  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {content.hero.title}
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                {content.hero.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-vivid-tangerine text-white'
                      : 'bg-gunmetal text-white/60 hover:text-white hover:bg-gunmetal/80'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Releases Timeline */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-white/10" />

              <div className="space-y-8">
                {filteredReleases.map((release, i) => (
                  <motion.div
                    key={release.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-12 md:pl-20"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-2 md:left-6 top-6 w-4 h-4 bg-vivid-tangerine border-4 border-coffee-bean" />

                    <Card className="bg-gunmetal border-white/10">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-vivid-tangerine font-mono text-sm">{release.version}</span>
                              <span className="text-white/40">–</span>
                              <h3 className="text-lg font-semibold">{release.title}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Calendar className="h-4 w-4" />
                            {release.date}
                          </div>
                        </div>

                        <ul className="space-y-3">
                          {release.changes.map((change, j) => (
                            <li key={j} className="flex items-start gap-3">
                              <Badge className={`${getBadgeVariant(change.type)} border shrink-0`}>
                                {content.entryLabels[change.type]}
                              </Badge>
                              <span className="text-white/70 text-sm pt-0.5">{change.text}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-white/50 text-sm">
                {content.footerNote}
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
