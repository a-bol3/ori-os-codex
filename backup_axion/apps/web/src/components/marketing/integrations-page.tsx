'use client'

import { motion } from 'framer-motion'
import {
  Mail,
  Calendar,
  Building2,
  Database,
  Webhook,
  ArrowRight,
  Check,
  Plug,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const categories = [
  {
    icon: Mail,
    title: 'Email & Calendar',
    description: 'Connect Google Workspace or Microsoft 365 to send campaigns, track replies, and log meetings without leaving Ori-OS.',
    features: ['Mailbox connection', 'Sending', 'Reply sync', 'Meeting tracking'],
  },
  {
    icon: Building2,
    title: 'CRM & Pipelines',
    description: 'Keep Ori-OS as your outbound and client OS while syncing key fields to your primary CRM.',
    features: ['CSV imports/exports', 'HubSpot (planned)', 'Pipedrive (planned)', 'Salesforce (planned)'],
  },
  {
    icon: Database,
    title: 'Data & Enrichment',
    description: 'Bring your own lists from providers like Apollo or LinkedIn exports and layer compliance-aware enrichment.',
    features: ['CSV import', 'Apollo exports', 'LinkedIn exports', 'Enrichment APIs'],
  },
  {
    icon: Webhook,
    title: 'Webhooks & API',
    description: 'Use our API and webhooks to sync events into your data warehouse, BI, or custom tools.',
    features: ['Event webhooks', 'REST API', 'Custom integrations', 'Data sync'],
  },
]

const plannedIntegrations = [
  'HubSpot native connector',
  'Pipedrive sync',
  'Salesforce integration',
  'Zapier connector',
  'Slack notifications',
  'Google Sheets sync',
]

export function IntegrationsPage() {
  const { setMarketingPage } = useAppStore()

  const handleTalkToUs = () => {
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
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-500/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
                <Plug className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Integrate Ori-OS into the stack you already use
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">
                Connect your email, calendars, CRMs, and data sources so Ori-OS becomes the brain of your revenue operations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={handleTalkToUs}>
                  Talk to us
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setMarketingPage('api')}
                >
                  View API docs
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Integration Categories */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {categories.map((category, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all h-full">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center mb-4">
                        <category.icon className="h-6 w-6 text-vivid-tangerine" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                      <p className="text-white/60 mb-4">{category.description}</p>
                      <ul className="space-y-2">
                        {category.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-white/70">
                            <Check className="h-4 w-4 text-vivid-tangerine" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Note */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gunmetal border-white/10">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Our approach to data sources</h3>
                <p className="text-white/60 mb-4">
                  We respect site terms and GDPR expectations and do not automate banned scraping flows. 
                  You can bring your own data from compliant sources, and we help you manage it responsibly.
                </p>
                <p className="text-white/60">
                  Ori-OS is designed to be <strong className="text-white">compliance-first</strong>, 
                  not an afterthought. We prioritize integrations that keep your data practices clean and defensible.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Planned Integrations */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Coming soon</h2>
              <p className="text-white/60">
                We&apos;re actively building these integrations based on customer feedback.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3">
              {plannedIntegrations.map((integration, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="px-4 py-2 bg-gunmetal border border-white/10 text-white/70"
                >
                  {integration}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vivid-tangerine/20 via-transparent to-green-500/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Need a specific integration?</h2>
              <p className="text-lg text-white/60 mb-8">
                Let&apos;s talk about your stack and how Ori-OS can fit in.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={handleTalkToUs}>
                  Talk to us
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setMarketingPage('api')}
                >
                  View API docs
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
