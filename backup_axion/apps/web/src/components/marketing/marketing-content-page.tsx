'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  PenTool,
  Sparkles,
  FolderTree,
  Users,
  Clock,
  Search,
  ArrowRight,
  Check,
  Layers,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const features = [
  {
    icon: PenTool,
    title: 'AI Content Assistant',
    description: 'Generate emails, blog posts, and social content with AI. Edit and refine with natural language.',
  },
  {
    icon: FolderTree,
    title: 'Document Management',
    description: 'Organize docs in folders and subfolders. Notion-like editing with blocks and embeds.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time editing, comments, mentions, and version history for all your content.',
  },
  {
    icon: Sparkles,
    title: 'Templates Library',
    description: '100+ templates for proposals, case studies, email sequences, and more.',
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find anything across all your docs with AI-powered semantic search.',
  },
  {
    icon: Clock,
    title: 'Content Calendar',
    description: 'Plan and schedule content. Visual calendar view with deadlines and assignments.',
  },
]

const contentTypes = [
  { name: 'Sales Proposals', icon: FileText },
  { name: 'Email Templates', icon: Layers },
  { name: 'Blog Posts', icon: BookOpen },
  { name: 'Case Studies', icon: FileText },
  { name: 'Playbooks', icon: BookOpen },
  { name: 'Meeting Notes', icon: FileText },
]

const aiFeatures = [
  'Generate first drafts in seconds',
  'Summarize long documents',
  'Rewrite for different tones',
  'Translate to 20+ languages',
  'Extract key points and action items',
]

export function MarketingContentPage() {
  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-500/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <Badge className="mb-6 bg-pink-500/20 text-pink-400 border-pink-500/30">
                  <FileText className="h-3 w-3 mr-1" />
                  Content Module
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  AI-Powered Content Operations
                </h1>
                <p className="text-xl text-white/60 mb-8">
                  Create, organize, and collaborate on content. AI-powered writing assistance and smart organization for sales and marketing teams.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setCurrentView('dashboard')}>
                    Start Writing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => useAppStore.getState().setMarketingPage('features')}>
                    View Templates
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gunmetal border border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-pink-500/20 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-pink-400" />
                    </div>
                    <span className="font-medium">AI Assistant</span>
                  </div>
                  <div className="bg-gunmetal-light p-4 mb-4">
                    <p className="text-sm text-white/60 mb-2">Prompt:</p>
                    <p className="text-white">Write a follow-up email for a demo call...</p>
                  </div>
                  <div className="bg-gunmetal-light p-4">
                    <p className="text-sm text-white/60 mb-2">Generated:</p>
                    <p className="text-white/80 text-sm">
                      Hi [First Name], Thank you for taking the time to meet with me today. I enjoyed learning about [Company]&apos;s goals for...
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Types */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-white/40 mb-6 text-sm">CREATE AND MANAGE</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {contentTypes.map((type, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3 p-4 bg-gunmetal border border-white/10"
                >
                  <div className="h-10 w-10 bg-pink-500/20 flex items-center justify-center">
                    <type.icon className="h-5 w-5 text-pink-400" />
                  </div>
                  <span className="text-sm text-white/80">{type.name}</span>
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
              <h2 className="text-4xl font-bold mb-4">Everything You Need for Content</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                From creation to collaboration, manage your entire content workflow.
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
                      <div className="h-12 w-12 bg-pink-500/20 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-pink-400" />
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

        {/* AI Features */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="mb-6 bg-pink-500/20 text-pink-400 border-pink-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
                <h2 className="text-4xl font-bold mb-6">AI That Writes With You</h2>
                <p className="text-lg text-white/60 mb-8">
                  Don&apos;t start from scratch. Let AI help you create better content, faster.
                </p>
                <ul className="space-y-4">
                  {aiFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 bg-pink-500/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-pink-400" />
                      </div>
                      <span className="text-white/80">{feature}</span>
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
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-pink-400" />
                      <span className="font-medium">AI Writing Assistant</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { prompt: 'Make it more professional', time: '2s' },
                        { prompt: 'Add a call-to-action', time: '1s' },
                        { prompt: 'Shorten to 100 words', time: '1s' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-gunmetal-light p-3">
                          <span className="text-white/80 text-sm">{item.prompt}</span>
                          <span className="text-xs text-pink-400">{item.time}</span>
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
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Ready to Create Better Content?</h2>
              <p className="text-lg text-white/60 mb-8">
                Start your free trial and let AI help you write.
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
