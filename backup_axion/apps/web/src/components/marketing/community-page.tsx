'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Calendar,
  MessageSquare,
  Video,
  ArrowRight,
  BookOpen,
  Sparkles,
  FileText,
  Lightbulb,
  FlaskConical,
  HelpCircle,
  LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'
import communityContent from '@content/resources/community-content.json'
import type { CommunityContent } from '@/types/content'

const content = communityContent as CommunityContent

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Sparkles,
  FileText,
  Lightbulb,
  FlaskConical,
  HelpCircle,
  Video,
  MessageSquare,
  Calendar,
  Users,
}

const whyJoinIcons = [BookOpen, Sparkles, FileText]
const contributeIcons = [Lightbulb, FlaskConical, HelpCircle]
const channelIcons: Record<string, LucideIcon> = {
  officeHours: Video,
  slack: MessageSquare,
  webinars: Calendar,
}

export function CommunityPage() {
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
              className="text-center"
            >
              <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-vivid-tangerine" />
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

        {/* Why Join Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">{content.whyJoin.title}</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {content.whyJoin.points.map((point, i) => {
                const IconComponent = whyJoinIcons[i] || BookOpen
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-gunmetal border-white/10 h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-vivid-tangerine" />
                          </div>
                          <p className="text-white/80">{point}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Community Channels Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">Community channels</h2>
            </motion.div>

            <div className="space-y-6">
              {(Object.keys(content.channels) as Array<keyof typeof content.channels>).map((key, i) => {
                const channel = content.channels[key]
                const IconComponent = channelIcons[key] || MessageSquare
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-gunmetal border-white/10">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                          <div className="h-14 w-14 bg-vivid-tangerine/20 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-7 w-7 text-vivid-tangerine" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-3">{channel.title}</h3>
                            <p className="text-white/60 mb-4">{channel.description}</p>
                            {channel.guidelines && (
                              <div className="mb-4 p-4 bg-white/5 border border-white/10">
                                <p className="text-sm font-medium text-white/80 mb-2">Guidelines:</p>
                                <ul className="text-sm text-white/60 space-y-1">
                                  {channel.guidelines.map((guideline, j) => (
                                    <li key={j}>• {guideline}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {channel.cta && (
                              <Button className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setMarketingPage('contact')}>
                                {channel.cta}
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            )}
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

        {/* Ways to Contribute Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold">{content.contribute.title}</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {content.contribute.points.map((point, i) => {
                const IconComponent = contributeIcons[i] || Lightbulb
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-gunmetal border-white/10 h-full hover:border-vivid-tangerine/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-vivid-tangerine" />
                          </div>
                          <p className="text-white/80">{point}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vivid-tangerine/20 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">{content.cta.title}</h2>
              <p className="text-lg text-white/60 mb-8">
                {content.cta.subtitle}
              </p>
              <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => useAppStore.getState().setMarketingPage('contact')}>
                {content.cta.button}
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
