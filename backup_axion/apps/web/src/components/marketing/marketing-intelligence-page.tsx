'use client'

import { motion } from 'framer-motion'
import {
  Target,
  Search,
  Database,
  Sparkles,
  Globe,
  Linkedin,
  Building2,
  Users,
  ArrowRight,
  Check,
  BarChart3,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const features = [
  {
    icon: Search,
    title: 'Advanced Lead Search',
    description: 'Search millions of contacts and companies with powerful filters like job title, industry, company size, and technologies used.',
  },
  {
    icon: Database,
    title: 'Data Enrichment',
    description: 'Auto-enrich leads with 50+ data points including verified emails, phone numbers, social profiles, and company intelligence.',
  },
  {
    icon: Sparkles,
    title: 'AI Lead Scoring',
    description: 'AI-powered scoring algorithm that prioritizes leads based on fit, intent, and likelihood to convert.',
  },
  {
    icon: Globe,
    title: 'Technographic Data',
    description: 'See what technologies your prospects use—from CRMs to marketing tools—to personalize your outreach.',
  },
  {
    icon: Building2,
    title: 'Company Intelligence',
    description: 'Firmographic data including revenue, employee count, funding rounds, and recent news for better targeting.',
  },
  {
    icon: Users,
    title: 'Buying Committee Detection',
    description: 'Identify key decision-makers and champions within target accounts for multi-threaded sales approaches.',
  },
]

const dataPoints = [
  { label: 'Verified Emails', value: '50+' },
  { label: 'Phone Numbers', value: 'Direct' },
  { label: 'Social Profiles', value: 'LinkedIn, Twitter' },
  { label: 'Company Data', value: '30+ fields' },
  { label: 'Technographics', value: '1000+ tools' },
  { label: 'Intent Data', value: 'Real-time' },
]

const useCases = [
  {
    title: 'Sales Teams',
    description: 'Build targeted prospect lists with verified contact data and reach out with personalized messaging.',
    stat: '3x more responses',
  },
  {
    title: 'Marketing Teams',
    description: 'Enrich your CRM data and create targeted segments for campaigns and ABM initiatives.',
    stat: '40% better targeting',
  },
  {
    title: 'Recruiters',
    description: 'Find and connect with passive candidates using comprehensive professional data.',
    stat: '60% faster sourcing',
  },
]

export function MarketingIntelligencePage() {
  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-vivid-tangerine/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <Badge className="mb-6 bg-vivid-tangerine/20 text-vivid-tangerine border-vivid-tangerine/30">
                  <Target className="h-3 w-3 mr-1" />
                  Intelligence Module
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Find & Enrich Leads at Scale
                </h1>
                <p className="text-xl text-white/60 mb-8">
                  Access a database of millions of contacts and companies. Enrich with 50+ data points, score with AI, and prioritize your best opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setCurrentView('dashboard')}>
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => useAppStore.getState().setMarketingPage('demo')}>
                    See It In Action
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gunmetal border border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-vivid-tangerine/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-vivid-tangerine" />
                    </div>
                    <div>
                      <p className="font-medium">Lead Search</p>
                      <p className="text-sm text-white/60">2,456 results found</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['VP of Sales', 'SaaS Companies', '50-200 employees', 'Using Salesforce'].map((filter, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-vivid-tangerine" />
                        <span className="text-white/80">{filter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Data Points */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {dataPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-lg font-bold text-vivid-tangerine">{point.value}</div>
                  <div className="text-sm text-white/60">{point.label}</div>
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
              <h2 className="text-4xl font-bold mb-4">Everything You Need to Find Perfect Leads</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Powerful search, enrichment, and scoring tools to build your pipeline.
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
                      <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-vivid-tangerine" />
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

        {/* Use Cases */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Built for Revenue Teams</h2>
              <p className="text-lg text-white/60">See how different teams use Intelligence</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                      <p className="text-white/60 mb-4">{useCase.description}</p>
                      <div className="text-2xl font-bold text-vivid-tangerine">{useCase.stat}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
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
              <h2 className="text-4xl font-bold mb-6">Ready to Find Your Best Leads?</h2>
              <p className="text-lg text-white/60 mb-8">
                Start your free trial and access millions of contacts today.
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
