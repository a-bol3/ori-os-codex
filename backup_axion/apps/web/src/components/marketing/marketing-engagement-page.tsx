'use client'

import { motion } from 'framer-motion'
import {
  Mail,
  Send,
  Inbox,
  Shield,
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Check,
  BarChart3,
  Zap,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const features = [
  {
    icon: Send,
    title: 'Email Sequences',
    description: 'Build multi-step email sequences with personalization, A/B testing, and automatic follow-ups.',
  },
  {
    icon: Inbox,
    title: 'Smart Inbox',
    description: 'Unified inbox for all your email accounts with AI-powered response suggestions and tracking.',
  },
  {
    icon: Shield,
    title: 'Email Warm-up',
    description: 'Automatically warm up new domains and accounts to maximize deliverability from day one.',
  },
  {
    icon: TrendingUp,
    title: 'Deliverability Tools',
    description: 'SPF, DKIM, DMARC monitoring and alerts to ensure your emails reach the inbox.',
  },
  {
    icon: Clock,
    title: 'Send Time Optimization',
    description: 'AI-powered send time optimization based on recipient behavior and timezone.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Shared templates, sequences, and analytics across your entire sales team.',
  },
]

const stats = [
  { value: '98.5%', label: 'Deliverability Rate' },
  { value: '45%', label: 'Avg Open Rate' },
  { value: '12%', label: 'Avg Reply Rate' },
  { value: '3x', label: 'More Responses' },
]

const channels = [
  { icon: Mail, name: 'Email', status: 'Active' },
  { icon: Globe, name: 'LinkedIn', status: 'Active' },
  { icon: Zap, name: 'SMS', status: 'Beta' },
  { icon: Users, name: 'Calls', status: 'Coming Soon' },
]

export function MarketingEngagementPage() {
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
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <Badge className="mb-6 bg-green-500/20 text-green-400 border-green-500/30">
                  <Mail className="h-3 w-3 mr-1" />
                  Engagement Module
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Multi-Channel Outreach
                </h1>
                <p className="text-xl text-white/60 mb-8">
                  Send personalized email sequences at scale. Built-in warm-up, deliverability tools, and analytics to maximize your response rates.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setCurrentView('dashboard')}>
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => useAppStore.getState().setMarketingPage('pricing')}>
                    See Pricing
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gunmetal border border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-green-500/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Email Sequence</p>
                      <p className="text-sm text-white/60">Step 1 of 5</p>
                    </div>
                  </div>
                  <div className="bg-gunmetal-light p-4 mb-4">
                    <p className="text-sm text-white/60 mb-2">Subject:</p>
                    <p className="text-white">Quick question about [Company]</p>
                  </div>
                  <div className="bg-gunmetal-light p-4">
                    <p className="text-sm text-white/60 mb-2">Preview:</p>
                    <p className="text-white/80 text-sm">
                      Hi [First Name], I noticed that [Company] is using [Technology]...
                    </p>
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
              {stats.map((stat, i) => (
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

        {/* Channels */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-white/40 mb-6 text-sm">MULTI-CHANNEL SUPPORT</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {channels.map((channel, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gunmetal border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <channel.icon className="h-5 w-5 text-green-400" />
                    <span className="text-white">{channel.name}</span>
                  </div>
                  <span className="text-xs text-green-400">{channel.status}</span>
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
              <h2 className="text-4xl font-bold mb-4">Everything You Need for Outreach</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                From email sequences to deliverability, we&apos;ve got you covered.
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
                      <div className="h-12 w-12 bg-green-500/20 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-green-400" />
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

        {/* Deliverability */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-6">Never Worry About Deliverability</h2>
                <p className="text-lg text-white/60 mb-8">
                  Our built-in deliverability tools ensure your emails land in the inbox, not the spam folder.
                </p>
                <ul className="space-y-4">
                  {[
                    'Automatic SPF, DKIM, DMARC setup',
                    'Domain health monitoring',
                    'Blacklist detection and alerts',
                    'Reputation scoring',
                    'Email warm-up automation',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 bg-green-500/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-400" />
                      </div>
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gunmetal border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-medium">Domain Health</span>
                      <Badge className="bg-green-500/20 text-green-400">Excellent</Badge>
                    </div>
                    <div className="space-y-4">
                      {['SPF', 'DKIM', 'DMARC', 'MX Records'].map((record, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-white/60">{record}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 bg-gunmetal-light overflow-hidden">
                              <div className="h-full bg-green-500 w-full" />
                            </div>
                            <Check className="h-4 w-4 text-green-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Ready to Scale Your Outreach?</h2>
              <p className="text-lg text-white/60 mb-8">
                Start your free trial and send your first campaign today.
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
