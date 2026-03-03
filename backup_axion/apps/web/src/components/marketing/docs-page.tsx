'use client'

import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Rocket, 
  Building2, 
  Users, 
  Mail, 
  Workflow, 
  Shield, 
  CreditCard, 
  Plug, 
  Wrench,
  ArrowRight,
  ChevronRight,
  LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'
import docsContent from '@content/resources/docs-content.json'
import type { DocsContent, DocsSection } from '@/types/content'

const content = docsContent as DocsContent

// Map section IDs to icons
const sectionIcons: Record<string, LucideIcon> = {
  quick_start: Rocket,
  workspaces_crm: Building2,
  contacts_lists: Users,
  campaigns_outbound: Mail,
  automations: Workflow,
  compliance_privacy: Shield,
  billing_subscription: CreditCard,
  integrations_api: Plug,
  troubleshooting: Wrench,
}

export function DocsPage() {
  const { setMarketingPage } = useAppStore()

  const handleContactSupport = () => {
    setMarketingPage('contact')
    window.scrollTo(0, 0)
  }

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
                <BookOpen className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {content.hero.title}
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                {content.hero.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Documentation Sections */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-6">
              {content.sections.map((section: DocsSection, i: number) => {
                const IconComponent = sectionIcons[section.id] || BookOpen
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/30 transition-all overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Header */}
                          <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 bg-gunmetal-light/30">
                            <div className="flex items-start gap-4">
                              <div className={`h-12 w-12 ${section.color} flex items-center justify-center flex-shrink-0`}>
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div>
                                <Badge variant="outline" className={`mb-2 ${section.badge}`}>
                                  {i + 1}
                                </Badge>
                                <h3 className="font-semibold text-lg">{section.title}</h3>
                                <p className="text-sm text-white/60 mt-1">{section.description}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Items */}
                          <div className="p-6 md:w-2/3">
                            <ul className="space-y-3">
                              {section.items.map((item, j) => (
                                <motion.li
                                  key={j}
                                  initial={{ opacity: 0, x: -10 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: i * 0.05 + j * 0.05 }}
                                >
                                  <button className="w-full flex items-center gap-3 text-left p-3 hover:bg-white/5 transition-colors group">
                                    <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-vivid-tangerine transition-colors" />
                                    <span className="text-white/80 group-hover:text-white transition-colors">{item}</span>
                                  </button>
                                </motion.li>
                              ))}
                            </ul>
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

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-4">Can&apos;t find what you&apos;re looking for?</h2>
              <p className="text-white/60 mb-8">
                Our support team is here to help. Reach out and we&apos;ll get back to you within 24 hours.
              </p>
              <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={handleContactSupport}>
                Contact support
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
