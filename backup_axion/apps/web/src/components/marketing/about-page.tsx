'use client'

import { motion } from 'framer-motion'
import { Users, Target, Shield, Zap, Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const principles = [
  {
    icon: Shield,
    title: 'Compliance first, not afterthought',
    description: 'We build GDPR-aware features from day one, not as an add-on.',
  },
  {
    icon: Target,
    title: 'Fewer, better features',
    description: 'We say no to feature bloat. Every feature must earn its place.',
  },
  {
    icon: Zap,
    title: 'Opinionated RevOps',
    description: 'We don\'t try to be everything for everyone. We build for lean B2B teams.',
  },
  {
    icon: Heart,
    title: 'Customer-obsessed',
    description: 'We talk to customers weekly. Their feedback shapes our roadmap.',
  },
]

const whoWeBuildFor = [
  { name: 'Outbound agencies', description: 'Running lead gen for multiple clients' },
  { name: 'B2B consultancies', description: 'Offering RevOps as a service' },
  { name: 'RevOps freelancers', description: 'Productizing their expertise' },
  { name: 'Small SaaS/tech teams', description: 'Running lean go-to-market' },
]

export function AboutPage() {
  const { setMarketingPage } = useAppStore()

  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-vivid-tangerine/10 blur-3xl" />

          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                We&apos;re building the Revenue OS for lean B2B teams
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Ori-CraftLabs is a small, EU-based team obsessed with helping agencies and tech SMEs run revenue from one compliant, opinionated OS.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why Ori-OS Exists */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gunmetal border-white/10">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Why Ori-OS exists</h2>
                  <div className="space-y-4 text-white/70">
                    <p>
                      <strong className="text-white">The problem:</strong> Most B2B teams run their revenue on a 
                      &quot;Frankenstack&quot; — Apollo + Lemlist + CRM add-ons + Notion + n8n. Each tool has its own login, 
                      its own data silo, and its own compliance risks.
                    </p>
                    <p>
                      <strong className="text-white">The risk:</strong> Deliverability problems, GDPR violations, 
                      duplicated data, and hours wasted switching between tools.
                    </p>
                    <p>
                      <strong className="text-white">The solution:</strong> Ori-OS brings it all together — 
                      a single, deliverability-safe OS with compliance built in from the start.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Who We Build For */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Who we build for</h2>
              <p className="text-white/60">Ori-OS is purpose-built for these teams</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {whoWeBuildFor.map((team, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 h-full">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold mb-2">{team.name}</h3>
                      <p className="text-sm text-white/60">{team.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">How we work</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: 'Founder-led', description: 'Direct involvement in every major decision.' },
                { title: 'Customer-interview-driven', description: 'We talk to users weekly to understand real needs.' },
                { title: 'Compliance-first', description: 'GDPR, deliverability, and data safety are built in.' },
                { title: 'Remote-friendly', description: 'Distributed team across the EU.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-gunmetal border border-white/10"
                >
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Our principles</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {principles.map((principle, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-4">
                        <principle.icon className="h-6 w-6 text-vivid-tangerine" />
                      </div>
                      <h3 className="font-semibold mb-2">{principle.title}</h3>
                      <p className="text-sm text-white/60">{principle.description}</p>
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
              <h2 className="text-3xl font-bold mb-6">Want to learn more?</h2>
              <p className="text-lg text-white/60 mb-8">
                Explore our product or get in touch with the team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => setMarketingPage('features')}>
                  Explore features
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setMarketingPage('contact')}>
                  Contact us
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
