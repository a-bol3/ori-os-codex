'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle,
  Rocket,
  Building2,
  Mail,
  Workflow,
  Shield,
  CreditCard,
  Plug,
  Wrench,
  Search,
  ChevronDown,
  MessageCircle,
  ArrowRight,
  LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'
import helpContent from '@content/resources/help-center-content.json'
import type { HelpCenterContent, HelpCategoryItem, HelpFaqItem } from '@/types/content'

const content = helpContent as HelpCenterContent

// Map category IDs to icons
const categoryIcons: Record<string, LucideIcon> = {
  getting_started: Rocket,
  workspaces_crm: Building2,
  campaigns_outbound: Mail,
  automations: Workflow,
  compliance_privacy: Shield,
  billing_subscription: CreditCard,
  integrations_api: Plug,
  troubleshooting: Wrench,
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gunmetal border-white/10 overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-white">{question}</h3>
              <ChevronDown
                className={`h-5 w-5 text-vivid-tangerine transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
            <motion.div
              initial={false}
              animate={{
                height: isOpen ? 'auto' : 0,
                opacity: isOpen ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-white/60 mt-4 pt-4 border-t border-white/10">{answer}</p>
            </motion.div>
          </CardContent>
        </button>
      </Card>
    </motion.div>
  )
}

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
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
                <HelpCircle className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{content.hero.title}</h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-10">
                {content.hero.subtitle}
              </p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="text"
                    placeholder={content.hero.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gunmetal border border-white/10 py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine/50 focus:border-vivid-tangerine/50 transition-all"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold">{content.categories.title}</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {content.categories.items.map((cat: HelpCategoryItem, i: number) => {
                const IconComponent = categoryIcons[cat.id] || HelpCircle
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all cursor-pointer h-full group">
                      <CardContent className="p-6">
                        <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center mb-4 group-hover:bg-vivid-tangerine/30 transition-colors">
                          <IconComponent className="h-6 w-6 text-vivid-tangerine" />
                        </div>
                        <h3 className="font-semibold mb-2">{cat.title}</h3>
                        <p className="text-sm text-white/60">{cat.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold">{content.faqs.title}</h2>
            </motion.div>

            <div className="space-y-4">
              {content.faqs.items.map((faq: HelpFaqItem, i: number) => (
                <FAQItem key={faq.id} question={faq.question} answer={faq.answer} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{content.contact.title}</h2>
              <p className="text-white/60 mb-2">{content.contact.subtitle}</p>
              <p className="text-white/60 mb-6">{content.contact.inApp}</p>
              <p className="text-white mb-8">
                <a
                  href={`mailto:${content.contact.email}`}
                  className="text-vivid-tangerine hover:text-vivid-tangerine/80 transition-colors font-medium"
                >
                  {content.contact.email}
                </a>
              </p>
              <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={handleContactSupport}>
                Contact Support
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
