'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Building2,
  Handshake,
  Activity,
  Calendar,
  Mail,
  Phone,
  ArrowRight,
  Check,
  TrendingUp,
  LayoutGrid,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const features = [
  {
    icon: Building2,
    title: 'Company Management',
    description: 'Track companies with detailed profiles, contacts, deals, and activities in one place.',
  },
  {
    icon: Users,
    title: 'Contact Database',
    description: 'Store unlimited contacts with custom fields, tags, and full interaction history.',
  },
  {
    icon: Handshake,
    title: 'Deal Pipeline',
    description: 'Visual pipeline view with drag-and-drop, stages, values, and probability tracking.',
  },
  {
    icon: Activity,
    title: 'Activity Tracking',
    description: 'Log calls, emails, meetings, and notes. See full interaction history at a glance.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Built-in calendar with meeting scheduling, reminders, and availability sharing.',
  },
  {
    icon: TrendingUp,
    title: 'Pipeline Analytics',
    description: 'Real-time dashboards showing conversion rates, velocity, and revenue forecasts.',
  },
]

const pipelineStages = [
  { name: 'Lead', count: 45, value: '$450K' },
  { name: 'Qualified', count: 28, value: '$280K' },
  { name: 'Proposal', count: 15, value: '$150K' },
  { name: 'Negotiation', count: 8, value: '$80K' },
  { name: 'Won', count: 12, value: '$120K' },
]

const integrations = [
  'Slack', 'Google Calendar', 'Outlook', 'Zoom', 'HubSpot', 'Salesforce', 
  'Mailchimp', 'Zapier', 'Google Sheets', 'QuickBooks'
]

export function MarketingCRMPage() {
  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <Badge className="mb-6 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Users className="h-3 w-3 mr-1" />
                  CRM Module
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Unified Relationship Hub
                </h1>
                <p className="text-xl text-white/60 mb-8">
                  Manage all your contacts, companies, deals, and activities in one powerful CRM. Built for modern sales teams.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setCurrentView('dashboard')}>
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => useAppStore.getState().setMarketingPage('demo')}>
                    Watch Demo
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gunmetal border border-white/10 p-4 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4 text-sm text-white/60">
                    <LayoutGrid className="h-4 w-4" />
                    Pipeline View
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {pipelineStages.map((stage, i) => (
                      <div key={i} className="text-center">
                        <div className="bg-gunmetal-light p-2 mb-2">
                          <div className="text-lg font-bold text-white">{stage.count}</div>
                          <div className="text-xs text-white/40">{stage.name}</div>
                        </div>
                        <div className="text-xs text-vivid-tangerine">{stage.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '100%', label: 'Pipeline Visibility' },
                { value: '50%', label: 'Less Manual Work' },
                { value: '2x', label: 'Faster Closing' },
                { value: 'Zero', label: 'Data Silos' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-vivid-tangerine">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Everything You Need to Close Deals</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                A full-featured CRM that works the way you work.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all h-full">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 bg-blue-500/20 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-white/60">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Connects With Your Stack</h2>
              <p className="text-lg text-white/60">
                Native integrations with the tools you already use
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-4">
              {integrations.map((integration, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="px-4 py-2 bg-gunmetal border border-white/10 text-white/60 hover:text-white hover:border-vivid-tangerine/50 transition">
                    {integration}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Ready to Unify Your Sales Data?</h2>
              <p className="text-lg text-white/60 mb-8">
                Start your free trial and see the difference a unified CRM makes.
              </p>
              <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setCurrentView('dashboard')}>
                Start Free Trial
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
