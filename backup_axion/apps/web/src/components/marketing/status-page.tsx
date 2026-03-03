'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Server,
  Mail,
  Zap,
  Database,
  Plug,
  Globe,
  ChevronDown,
  ChevronUp,
  Bell,
  Rss,
  LucideIcon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import statusContent from '@content/resources/status-content.json'
import type { StatusPageContent, StatusIncidentSample } from '@/types/content'

const content = statusContent as StatusPageContent

// Map component IDs to icons
const componentIcons: Record<string, LucideIcon> = {
  app: Globe,
  api: Server,
  mail_sending: Mail,
  automation_engine: Zap,
  database: Database,
  integrations: Plug,
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'bg-green-500'
    case 'degraded':
      return 'bg-yellow-500'
    case 'partial':
      return 'bg-orange-500'
    case 'outage':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'degraded':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'partial':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'outage':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'investigating':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'identified':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'monitoring':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'resolved':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

// Generate 90 days of uptime data
const generateUptimeData = () => {
  const days: { date: Date, status: string }[] = []
  for (let i = 89; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Mostly operational with occasional minor issues
    const random = Math.random()
    let status = 'operational'
    if (random > 0.98) status = 'outage'
    else if (random > 0.95) status = 'partial'
    else if (random > 0.90) status = 'degraded'
    days.push({ date, status })
  }
  return days
}

const uptimeData = generateUptimeData()

function IncidentCard({ incident }: { incident: StatusIncidentSample }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="bg-gunmetal border-white/10">
      <CardContent className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-white/60">{incident.date}</span>
                <Badge className={getStatusBadge(incident.status)}>
                  {content.history.labels[incident.status as keyof typeof content.history.labels]}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg">{incident.title}</h3>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-white/40 shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-white/40 shrink-0" />
            )}
          </div>
          <p className="text-white/60">{incident.impact}</p>
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <h4 className="text-sm font-medium text-white/80 mb-4">Timeline</h4>
            <div className="space-y-4">
              {incident.timeline.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 ${getStatusColor(event.status)}`} />
                    {i < incident.timeline.length - 1 && (
                      <div className="w-px h-full bg-white/20 flex-1 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-white/60">{event.time}</span>
                      <Badge variant="outline" className={getStatusBadge(event.status)}>
                        {content.history.labels[event.status as keyof typeof content.history.labels]}
                      </Badge>
                    </div>
                    <p className="text-white/70">{event.message}</p>
                  </div>
                </div>
              ))}
            </div>
            {incident.nextSteps && (
              <div className="mt-4 p-4 bg-white/5">
                <h4 className="text-sm font-medium text-white/80 mb-2">Next steps</h4>
                <p className="text-white/60 text-sm">{incident.nextSteps}</p>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export function StatusPage() {
  const [activeFilter, setActiveFilter] = useState<'24h' | '7d' | '30d'>('30d')

  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="relative max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="h-16 w-16 bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Activity className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {content.hero.title}
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
                {content.hero.subtitle}
              </p>

              {/* Overall Status */}
              <Card className="bg-gunmetal border-white/10 inline-block">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 bg-green-500 animate-pulse" />
                    <span className="font-medium">{content.badges.operational}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-xl font-semibold mb-2">{content.overview.title}</h2>
              <p className="text-white/60">{content.overview.subtitle}</p>
            </motion.div>
          </div>
        </section>

        {/* Components */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-2">{content.components.title}</h2>
              <p className="text-white/60">{content.components.subtitle}</p>
            </motion.div>

            <div className="space-y-3">
              {content.components.items.map((component, i) => {
                const IconComponent = componentIcons[component.id] || Server
                return (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-gunmetal border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-vivid-tangerine/20 flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-vivid-tangerine" />
                            </div>
                            <div>
                              <h3 className="font-medium">{component.name}</h3>
                              <p className="text-sm text-white/60">{component.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-white/60 hidden sm:block">{component.uptime} uptime</span>
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 ${getStatusColor(component.status)}`} />
                              <Badge className={getStatusBadge(component.status)}>
                                {component.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Historical Uptime */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-2">{content.uptime.title}</h2>
              <p className="text-white/60">{content.uptime.subtitle}</p>
            </motion.div>

            {/* Uptime Grid */}
            <Card className="bg-gunmetal border-white/10 mb-6">
              <CardContent className="p-6">
                <div className="flex gap-0.5 flex-wrap">
                  {uptimeData.map((day, i) => (
                    <div
                      key={i}
                      className={`h-3 w-3 ${getStatusColor(day.status)}`}
                      title={`${day.date.toLocaleDateString()} - ${day.status}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-white/40">
                  <span>90 days ago</span>
                  <span>Today</span>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500" />
                <span className="text-white/60">{content.uptime.legend.operational}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-yellow-500" />
                <span className="text-white/60">{content.uptime.legend.degraded}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-orange-500" />
                <span className="text-white/60">{content.uptime.legend.partial}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500" />
                <span className="text-white/60">{content.uptime.legend.outage}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Incident History */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-2">{content.history.title}</h2>
              <p className="text-white/60 mb-6">{content.history.subtitle}</p>

              {/* Filters */}
              <div className="flex gap-2">
                {[
                  { key: '24h', label: content.history.filters.last24h },
                  { key: '7d', label: content.history.filters.last7d },
                  { key: '30d', label: content.history.filters.last30d },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                    className={`px-4 py-2 text-sm transition ${activeFilter === filter.key
                      ? 'bg-vivid-tangerine text-white'
                      : 'bg-gunmetal border border-white/10 text-white/70 hover:text-white hover:border-vivid-tangerine/50'
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="space-y-4">
              {content.incidents.map((incident, i) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <IncidentCard incident={incident} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscribe */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
                <Bell className="h-6 w-6 text-vivid-tangerine" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{content.footer.title}</h2>
              <p className="text-white/60 mb-6">
                {content.footer.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gunmetal border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-vivid-tangerine/50"
                />
                <Button className="bg-vivid-tangerine hover:bg-tangerine-dark text-white" onClick={() => alert('Status subscription feature coming soon!')}>
                  {content.footer.subscribeCta}
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <button className="flex items-center gap-2 text-white/60 hover:text-white transition">
                  <Rss className="h-4 w-4" />
                  {content.footer.rssLabel}
                </button>
              </div>
              <p className="text-sm text-white/40 mt-6">
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
