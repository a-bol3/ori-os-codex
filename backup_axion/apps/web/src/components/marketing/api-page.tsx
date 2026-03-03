'use client'

import { motion } from 'framer-motion'
import { 
  Code, 
  Key, 
  Database, 
  Webhook, 
  FileCode, 
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Layers,
  Zap,
  LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'
import apiContent from '@content/resources/api-content.json'
import type { ApiContent, ApiSection } from '@/types/content'

const content = apiContent as ApiContent

// Map section IDs to icons
const sectionIcons: Record<string, LucideIcon> = {
  overview: Layers,
  core_resources: Database,
  webhooks: Webhook,
  examples: FileCode,
  best_practices: ShieldCheck,
}

export function APIPage() {
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
              <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
                <Code className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {content.hero.title}
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">
                {content.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setMarketingPage('api')}>
                  Open API Reference
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => useAppStore.getState().setMarketingPage('docs')}>
                  View Documentation
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* API Sections */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold mb-3">Explore the API</h2>
              <p className="text-white/60">Everything you need to integrate Ori-OS with your systems</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.sections.map((section: ApiSection, i: number) => {
                const IconComponent = sectionIcons[section.id] || Database
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all h-full cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`h-10 w-10 ${section.color} flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <Badge variant="outline" className={`mb-2 ${section.badge}`}>
                              {String(i + 1).padStart(2, '0')}
                            </Badge>
                            <h3 className="font-semibold text-lg">{section.title}</h3>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {section.items.map((item, j) => (
                            <li key={j}>
                              <div className="flex items-center gap-2 text-sm text-white/60 group-hover:text-white/80 transition-colors">
                                <ChevronRight className="h-3 w-3 text-white/40" />
                                <span>{item}</span>
                              </div>
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

        {/* Quick Start Code Example */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-vivid-tangerine" />
                <h2 className="text-2xl font-bold">Quick start example</h2>
              </div>
              <p className="text-white/60">Get started with a simple API call</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gunmetal border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gunmetal-light border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500/60" />
                    <div className="h-3 w-3 bg-yellow-500/60" />
                    <div className="h-3 w-3 bg-green-500/60" />
                  </div>
                  <span className="text-xs text-white/40 font-mono">JavaScript</span>
                </div>
                <CardContent className="p-0">
                  <pre className="p-6 overflow-x-auto text-sm">
                    <code className="text-white/80 font-mono whitespace-pre">{content.quickStartCode}</code>
                  </pre>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Authentication Card */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gunmetal border-white/10">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center">
                      <Key className="h-6 w-6 text-vivid-tangerine" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Authentication</h2>
                      <p className="text-white/60 text-sm mt-1">Secure your API requests with Bearer tokens</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-white/70">
                    <p>
                      API keys are managed in your workspace settings. All API requests must include a valid Bearer token in the Authorization header.
                    </p>
                    <div className="bg-gunmetal-light p-4 border border-white/10">
                      <code className="text-sm text-vivid-tangerine">Authorization: Bearer YOUR_API_KEY</code>
                    </div>
                    <p className="text-sm text-white/50">
                      Keep your API keys secure and never share them publicly. Rotate keys periodically for enhanced security.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vivid-tangerine/20 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Ready to build?</h2>
              <p className="text-lg text-white/60 mb-8">
                Open the full API reference to see all endpoints, examples, and SDKs.
              </p>
              <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setMarketingPage('api')}>
                Open API Reference
                <ExternalLink className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
