'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter,
  ArrowRight,
  Check,
  Layers,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const features = [
  {
    icon: BarChart3,
    title: 'Real-Time Dashboards',
    description: 'Live metrics for every aspect of your sales process. Customizable widgets and layouts.',
  },
  {
    icon: TrendingUp,
    title: 'Revenue Forecasting',
    description: 'AI-powered predictions based on historical data and current pipeline.',
  },
  {
    icon: PieChart,
    title: 'Conversion Funnels',
    description: 'Visualize conversion rates at every stage. Identify bottlenecks instantly.',
  },
  {
    icon: Activity,
    title: 'Activity Analytics',
    description: 'Track emails sent, calls made, meetings booked. Team and individual metrics.',
  },
  {
    icon: Calendar,
    title: 'Trend Analysis',
    description: 'Week-over-week, month-over-month comparisons. Spot trends before they become obvious.',
  },
  {
    icon: Download,
    title: 'Custom Reports',
    description: 'Build and schedule custom reports. Export to CSV, PDF, or send to Slack.',
  },
]

const metrics = [
  { label: 'Revenue Tracked', value: '$12M+' },
  { label: 'Deals Analyzed', value: '50K+' },
  { label: 'Reports Generated', value: '100K+' },
  { label: 'Time Saved', value: '10hrs/wk' },
]

const dashboards = [
  { name: 'Sales Overview', widgets: 8 },
  { name: 'Pipeline Health', widgets: 6 },
  { name: 'Team Performance', widgets: 10 },
  { name: 'Email Analytics', widgets: 5 },
  { name: 'Activity Tracker', widgets: 7 },
  { name: 'Revenue Forecast', widgets: 4 },
]

export function MarketingAnalyticsPage() {
  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <Badge className="mb-6 bg-rose-500/20 text-rose-400 border-rose-500/30">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analytics Module
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Deep Insights & Funnels
                </h1>
                <p className="text-xl text-white/60 mb-8">
                  Understand every metric that matters. Real-time dashboards, custom reports, and AI-powered insights to optimize your pipeline.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setMarketingPage('demo')}>
                    See It In Action
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => useAppStore.getState().setMarketingPage('features')}>
                    View Sample Reports
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gunmetal border border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-rose-500/20 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-rose-400" />
                      </div>
                      <span className="font-medium">Revenue Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      +23.5%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[
                      { label: 'MRR', value: '$125K' },
                      { label: 'Pipeline', value: '$1.2M' },
                      { label: 'Won', value: '45' },
                      { label: 'Avg Deal', value: '$8.5K' },
                    ].map((metric, i) => (
                      <div key={i} className="bg-gunmetal-light p-3">
                        <p className="text-xs text-white/40">{metric.label}</p>
                        <p className="text-xl font-bold text-white">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-24 bg-gunmetal-light flex items-center justify-center">
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                        <div
                          key={i}
                          className="w-6 bg-rose-500/50 "
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Metrics */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {metrics.map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-vivid-tangerine">{metric.value}</div>
                  <div className="text-sm text-white/60">{metric.label}</div>
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
              <h2 className="text-4xl font-bold mb-4">Analytics That Drive Results</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Go beyond vanity metrics. Get insights that actually help you close more deals.
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
                      <div className="h-12 w-12 bg-rose-500/20 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-rose-400" />
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

        {/* Dashboards */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Pre-Built Dashboards</h2>
              <p className="text-lg text-white/60">
                Start with templates or build your own from scratch
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboards.map((dashboard, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 hover:border-rose-500/50 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gunmetal-light flex items-center justify-center">
                            <Layers className="h-5 w-5 text-white/60" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{dashboard.name}</p>
                            <p className="text-sm text-white/60">{dashboard.widgets} widgets</p>
                          </div>
                        </div>
                        <Eye className="h-4 w-4 text-white/40" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Ready to Understand Your Pipeline?</h2>
              <p className="text-lg text-white/60 mb-8">
                Start your free trial and get insights in minutes.
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
