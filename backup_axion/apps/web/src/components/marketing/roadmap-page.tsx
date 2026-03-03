'use client'

import { motion } from 'framer-motion'
import { Rocket, Clock, Calendar, LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import roadmapContent from '@content/product/roadmap-content.json'
import type { RoadmapContent } from '@/types/content'

const content = roadmapContent as RoadmapContent

// Map column keys to icons
const columnIcons: Record<string, LucideIcon> = {
  now: Rocket,
  next: Clock,
  later: Calendar,
}

export function RoadmapPage() {
  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {content.hero.title}
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                {content.hero.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Roadmap Columns */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {(Object.keys(content.items) as Array<keyof typeof content.items>).map((key, i) => {
                const column = content.columns[key]
                const items = content.items[key]
                const IconComponent = columnIcons[key] || Rocket
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-gunmetal border-white/10 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`h-10 w-10 flex items-center justify-center ${column.iconBg}`}>
                            <IconComponent className={`h-5 w-5 ${column.iconColor}`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{column.title}</h3>
                            <p className="text-sm text-white/60">{column.subtitle}</p>
                          </div>
                        </div>

                        <ul className="space-y-6">
                          {items.map((item) => (
                            <li key={item.id} className="border-l-2 border-white/10 pl-4">
                              <h4 className="font-medium text-white/90 mb-1">{item.name}</h4>
                              <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
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
                {content.footer.note}
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
