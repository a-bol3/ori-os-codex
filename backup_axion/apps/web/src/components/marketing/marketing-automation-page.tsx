'use client'

import { motion } from 'framer-motion'
import {
  Workflow,
  Zap,
  GitBranch,
  Clock,
  Webhook,
  Mail,
  MessageSquare,
  Database,
  ArrowRight,
  Check,
  Play,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const features = [
  {
    icon: GitBranch,
    title: 'Visual Workflow Builder',
    description: 'Drag-and-drop interface to build complex automations without code. Like n8n, but built for sales.',
  },
  {
    icon: Webhook,
    title: 'Webhook Triggers',
    description: 'Connect any app with webhooks. Trigger workflows from form submissions, CRM events, or API calls.',
  },
  {
    icon: Clock,
    title: 'Time-Based Triggers',
    description: 'Schedule workflows to run at specific times, delays between steps, or recurring schedules.',
  },
  {
    icon: Zap,
    title: 'Conditional Logic',
    description: 'Add branching logic based on contact attributes, behavior, or custom conditions.',
  },
  {
    icon: Mail,
    title: 'Email Actions',
    description: 'Send personalized emails, add to sequences, or update email status automatically.',
  },
  {
    icon: Database,
    title: 'CRM Updates',
    description: 'Automatically update contacts, create deals, log activities, and sync data across systems.',
  },
]

const templates = [
  { name: 'Lead Nurturing Sequence', steps: 5, category: 'Email' },
  { name: 'New Lead Welcome', steps: 3, category: 'Onboarding' },
  { name: 'Deal Stage Automation', steps: 4, category: 'Pipeline' },
  { name: 'Re-engagement Campaign', steps: 6, category: 'Retention' },
  { name: 'Trial Expiration', steps: 4, category: 'Sales' },
  { name: 'Meeting Follow-up', steps: 3, category: 'Engagement' },
]

const triggers = [
  { icon: Mail, name: 'Email Opened' },
  { icon: MessageSquare, name: 'Form Submitted' },
  { icon: Clock, name: 'Time Delay' },
  { icon: Database, name: 'CRM Updated' },
  { icon: Webhook, name: 'Webhook Received' },
  { icon: Sparkles, name: 'AI Analyzed' },
]

export function MarketingAutomationPage() {
  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <Badge className="mb-6 bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Workflow className="h-3 w-3 mr-1" />
                  Automation Module
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Visual Workflow Builder
                </h1>
                <p className="text-xl text-white/60 mb-8">
                  Automate repetitive tasks with a powerful, no-code workflow builder. 50+ templates to get you started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setCurrentView('dashboard')}>
                    Start Building
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2" onClick={() => useAppStore.getState().setMarketingPage('demo')}>
                    <Play className="h-4 w-4" />
                    See How It Works
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gunmetal border border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-purple-500/20 flex items-center justify-center">
                      <Workflow className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="font-medium">Lead Nurturing Workflow</span>
                  </div>
                  <div className="space-y-3">
                    {['Trigger: New lead added', 'Wait: 2 days', 'Send: Welcome email', 'If: Opened email?', 'Yes → Add to sequence'].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gunmetal-light flex items-center justify-center text-xs text-white/60">
                          {i + 1}
                        </div>
                        <div className="flex-1 bg-gunmetal-light px-3 py-2 text-sm text-white/80">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Triggers */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-white/40 mb-6 text-sm">TRIGGER WORKFLOWS FROM</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {triggers.map((trigger, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-gunmetal border border-white/10"
                >
                  <trigger.icon className="h-5 w-5 text-purple-400" />
                  <span className="text-sm text-white/80">{trigger.name}</span>
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
              <h2 className="text-4xl font-bold mb-4">Build Any Automation You Can Imagine</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Powerful features to automate your entire sales and marketing process.
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
                      <div className="h-12 w-12 bg-purple-500/20 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-purple-400" />
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

        {/* Templates */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Start With Templates</h2>
              <p className="text-lg text-white/60">
                50+ pre-built workflows ready to use or customize
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 hover:border-purple-500/50 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{template.name}</p>
                          <p className="text-sm text-white/60">{template.steps} steps • {template.category}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/40" />
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Ready to Automate Your Workflow?</h2>
              <p className="text-lg text-white/60 mb-8">
                Start your free trial and build your first automation in minutes.
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
