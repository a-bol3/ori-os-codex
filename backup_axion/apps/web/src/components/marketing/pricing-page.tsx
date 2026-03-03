'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  ArrowRight, 
  HelpCircle, 
  Zap, 
  Building2, 
  Crown,
  Database,
  Mail,
  ShieldCheck,
  FileText,
  Workflow,
  Calendar,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const plans = [
  {
    name: 'Starter',
    badge: 'Solo & Micro Agencies',
    price: { monthly: 69, yearly: 49 },
    yearlyDiscount: '29%',
    description: 'Starter is for solo consultants and very small teams validating their outbound motion. You get a complete Revenue OS — lead database, sequences, just‑enough CRM, and docs — without committing to a big‑ticket stack.',
    summary: {
      users: '2 users',
      workspaces: '1 workspace',
      contacts: '15,000 contacts',
      emails: '20,000 emails per month',
      automations: '10 active automations',
    },
    features: [
      'Core lead database with flexible filtering and tagging.',
      'Email sequences with reply tracking and basic performance views.',
      'Simple pipeline, tasks, and notes for deals and opportunities.',
      'Notion‑like docs for scripts, playbooks, and client notes.',
      'Email support and guided in‑app onboarding checklists.',
    ],
    bestFor: [
      'Solo consultants and micro‑agencies running 1 main workspace.',
      'Teams that want to replace spreadsheets + basic outreach without complex setup.',
    ],
    highlighted: false,
    icon: Zap,
    cta: 'Start free trial',
  },
  {
    name: 'Growth',
    badge: 'Agency OS',
    price: { monthly: 199, yearly: 149 },
    yearlyDiscount: '25%',
    description: 'Growth is the default plan for 3–15 person agencies and consultancies running multiple client retainers. It\'s designed to replace a stack of outbound, CRM add‑ons, project tools, and a wiki with one opinionated OS.',
    summary: {
      users: '5 users',
      workspaces: '3 workspaces',
      contacts: '75,000 contacts',
      emails: '100,000 emails per month',
      automations: '40 active automations',
    },
    features: [
      'Multi‑workspace management for your agency and client workspaces.',
      'Advanced workflows with branches, triggers, and task creation.',
      'Campaign, pipeline, and basic funnel reporting across workspaces.',
      'Basic audit logs for imports, exports, campaign launches, and key changes.',
      'Priority email support so you\'re not stuck waiting in a generic queue.',
      'One live onboarding workshop (60–90 minutes) to configure your first workflows.',
    ],
    bestFor: [
      'Agencies and consultancies with 2–5 active retainers or internal "clients".',
      'Teams that want to standardize how they run outbound and account management without a heavy CRM suite.',
    ],
    highlighted: true,
    icon: Building2,
    cta: 'Start free trial',
    secondaryCta: 'Talk to us',
  },
  {
    name: 'Agency Pro',
    badge: 'Multi‑Client RevOps OS',
    price: { monthly: 399, yearly: 299 },
    yearlyDiscount: '25%',
    description: 'Agency Pro is for multi‑client agencies and RevOps shops that want to standardize how they run revenue operations across many accounts. It includes more resources, deeper reporting, and hands‑on implementation help.',
    summary: {
      users: '10 users',
      workspaces: '8 workspaces',
      contacts: '250,000 contacts',
      emails: '300,000 emails per month',
      automations: '120 active automations',
    },
    features: [
      'Per‑client dashboards for meetings, pipeline, and SLAs.',
      'Advanced templates and playbooks per client type or niche.',
      'Enhanced audit logs and compliance controls.',
      'Priority support with a private Slack or Teams channel.',
      'Guided rollout for your own workspace plus your first two client workspaces (implementation normally priced separately).',
    ],
    bestFor: [
      'Agencies with 6+ retainers or aggressive growth plans.',
      'RevOps specialists who want to deliver Ori‑OS setups as part of their services.',
    ],
    highlighted: false,
    icon: Crown,
    cta: 'Talk to sales',
  },
]

const includedFeatures = [
  {
    icon: ShieldCheck,
    title: 'EU‑hosted, GDPR‑aware infrastructure by default.',
  },
  {
    icon: Mail,
    title: 'Deliverability‑safe outbound with warm‑up guidance and global suppression lists.',
  },
  {
    icon: Database,
    title: 'Central lead database, CRM pipelines, tasks, and activity timelines.',
  },
  {
    icon: FileText,
    title: 'Notion‑like docs for playbooks, briefs, and client notes.',
  },
  {
    icon: Workflow,
    title: 'No‑code automations and reusable campaign templates.',
  },
  {
    icon: Calendar,
    title: 'Access to changelog and roadmap so you can see what\'s shipping next.',
  },
]

const addons = [
  {
    category: 'Extra contacts',
    items: [
      { name: '+50,000 contacts', price: '€49 / month' },
      { name: '+150,000 contacts', price: '€99 / month' },
    ],
  },
  {
    category: 'Extra workspaces (for Growth and Agency Pro)',
    items: [
      { name: '+1 workspace', price: '€39 / month' },
    ],
  },
  {
    category: 'Extra mailboxes / warm‑up slots',
    items: [
      { name: 'Beyond your included limit', price: '€15 / mailbox / month' },
    ],
  },
  {
    category: 'Done‑for‑you setup (for Starter or complex migrations)',
    items: [
      { name: 'List migration, campaign setup, deliverability review', price: 'From €600 one‑time' },
    ],
  },
]

const faqs = [
  {
    question: 'How does pricing compare to stacking multiple tools?',
    answer: 'For a typical 5–10 person team, the combined cost of separate tools for data, outbound, CRM, docs, and automations often lands in the hundreds per user per month once seats and credits are included. Ori‑OS bundles lead gen, outreach, light CRM, workspaces, and workflows into a flat account price, usually at a lower total cost for your use case.',
  },
  {
    question: 'Can we start small and expand later?',
    answer: 'Yes. Many teams start on Starter or Growth with a small number of workspaces. As you sign more clients or add new product lines, you can add contacts, mailboxes, and workspaces or move to Agency Pro without re‑architecting your stack.',
  },
  {
    question: 'Are you EU‑compliant and GDPR‑aware?',
    answer: 'Ori‑OS is built with EU customers in mind. We host in the EU where possible, provide global unsubscribe and suppression, basic audit logs, and tools to record lawful‑basis information for contacts. You remain responsible for your own legal obligations, and we support you with product features and documentation.',
  },
  {
    question: 'Do you offer discounts?',
    answer: 'Annual plans include up to 25% savings versus monthly billing. For selected early agencies that fit our ideal customer profile, we may also offer time‑limited "design partner" pricing in exchange for structured feedback and case studies, not permanent discounts.',
  },
  {
    question: 'What happens if we outgrow our plan?',
    answer: 'When you approach contacts, workspace, or mailbox limits, we\'ll let you know well in advance. From there you can choose to add specific add‑ons or upgrade to the next plan. We\'re happy to review your usage with you and recommend the most cost‑effective path.',
  },
]

export function PricingPage() {
  const [isYearly, setIsYearly] = useState(true)
  const { setCurrentView, setMarketingPage } = useAppStore()

  const handleStartTrial = () => {
    setCurrentView('dashboard')
    window.scrollTo(0, 0)
  }

  const handleBookDemo = () => {
    setMarketingPage('demo')
    window.scrollTo(0, 0)
  }

  const handleContact = () => {
    setMarketingPage('contact')
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="heading-gradient">Simple plans for lean</span>{' '}
                <span className="heading-highlight curved-underline">B2B teams</span>
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8 font-normal">
                Flat pricing per account — not per feature. Start small, add workspaces, contacts, and mailboxes as you grow, and stay clearly below the cost of a comparable multi‑tool stack.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm ${!isYearly ? 'text-white' : 'text-white/60'}`}>Monthly</span>
                <button
                  onClick={() => setIsYearly(!isYearly)}
                  className="relative w-14 h-7 bg-gunmetal transition-colors"
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-vivid-tangerine transition-transform ${
                      isYearly ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${isYearly ? 'text-white' : 'text-white/60'}`}>
                  Yearly <span className="text-vivid-tangerine">– save up to 25%</span>
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={handleStartTrial}>
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleBookDemo}>
                  Book a demo
                </Button>
              </div>

              {/* Region Note */}
              <p className="text-sm text-white/40 mt-6">
                These prices are for Region A (EU, EUR). For other regions, adapt visually similar local currency bands.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={plan.highlighted ? 'lg:-mt-4 lg:mb-4' : ''}
                >
                  <Card
                    className={`h-full relative overflow-hidden ${
                      plan.highlighted
                        ? 'bg-gradient-to-b from-vivid-tangerine/20 to-gunmetal border-vivid-tangerine shadow-lg shadow-vivid-tangerine/10'
                        : 'bg-gunmetal border-white/10'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute top-0 left-0 right-0">
                        <Badge className="w-full justify-center  bg-vivid-tangerine text-white py-1.5">
                          Most popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className={`p-6 ${plan.highlighted ? 'pt-12' : ''}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`feature-icon-square ${
                          plan.highlighted ? 'bg-vivid-tangerine/20 border-vivid-tangerine/30' : 'bg-vivid-tangerine/10 border-vivid-tangerine/30'
                        }`}>
                          <plan.icon className={`h-5 w-5 text-vivid-tangerine`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <p className={`text-xs ${plan.highlighted ? 'text-vivid-tangerine' : 'text-white/60'}`}>{plan.badge}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">
                            €{isYearly ? plan.price.yearly : plan.price.monthly}
                          </span>
                          <span className="text-white/60"> / month</span>
                        </div>
                        {isYearly && (
                          <p className="text-sm text-white/60 mt-1">
                            billed annually ({plan.yearlyDiscount} discount)
                          </p>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="bg-white/5 p-4 mb-6 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-vivid-tangerine" />
                          <span className="text-white/80">{plan.summary.users}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-vivid-tangerine" />
                          <span className="text-white/80">{plan.summary.workspaces}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Database className="h-4 w-4 text-vivid-tangerine" />
                          <span className="text-white/80">{plan.summary.contacts}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-vivid-tangerine" />
                          <span className="text-white/80">{plan.summary.emails}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Workflow className="h-4 w-4 text-vivid-tangerine" />
                          <span className="text-white/80">{plan.summary.automations}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-white/60 mb-4">
                        {plan.description}
                      </p>

                      {/* What you get */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-white/80 mb-3">What you get {plan.name !== 'Starter' ? `(everything in ${plan.name === 'Growth' ? 'Starter' : 'Growth'}, plus)` : ''}</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-vivid-tangerine' : 'text-vivid-tangerine'}`} />
                              <span className="text-white/70">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Best for */}
                      <div className="mb-6 p-4 bg-white/5">
                        <h4 className="text-sm font-semibold text-white/80 mb-2">Best for</h4>
                        <ul className="space-y-1">
                          {plan.bestFor.map((item, j) => (
                            <li key={j} className="text-sm text-white/60 flex items-start gap-2">
                              <span className="text-vivid-tangerine">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <Button
                        className={`w-full ${
                          plan.highlighted
                            ? 'bg-vivid-tangerine hover:bg-tangerine-dark text-white'
                            : 'bg-vivid-tangerine hover:bg-tangerine-dark text-white'
                        }`}
                        onClick={plan.name === 'Agency Pro' ? handleContact : handleStartTrial}
                      >
                        {plan.cta}
                      </Button>
                      {plan.secondaryCta && (
                        <Button variant="ghost" className="w-full mt-2 text-white hover:bg-white/10" onClick={handleContact}>
                          {plan.secondaryCta}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold mb-4">
                Everything you need to run lean, compliant <span className="heading-highlight curved-underline">RevOps</span>
              </h2>
              <p className="text-white/60 font-normal">Included in every plan</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {includedFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-gunmetal border border-white/10"
                >
                  <feature.icon className="h-5 w-5 text-vivid-tangerine flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/80">{feature.title}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Add-ons */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold mb-4">Add more clients, contacts, and mailboxes as you grow</h2>
              <p className="text-white/60">
                Start lean. Extend contacts, workspaces, and mailboxes only when you need them.
              </p>
            </motion.div>

            <div className="space-y-6">
              {addons.map((addon, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <h4 className="text-sm font-medium text-white/60 mb-3">{addon.category}</h4>
                  <div className="space-y-2">
                    {addon.items.map((item, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between p-4 bg-gunmetal border border-white/10"
                      >
                        <span className="text-white/80">{item.name}</span>
                        <span className="text-vivid-tangerine font-medium">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-sm text-white/40 mt-8">
              Most agencies won&apos;t hit hard limits in their first months. Ori‑OS will notify you well before you reach thresholds so you can decide whether to extend.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-vivid-tangerine" />
                        {faq.question}
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vivid-tangerine/20 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">
                Ready to see your numbers with Ori‑OS pricing?
              </h2>
              <p className="text-lg text-white/60 mb-8">
                Bring your current stack and we&apos;ll map exactly how Ori‑OS compares on cost, complexity, and compliance for your team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={handleContact}>
                  Book a pricing walkthrough
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleStartTrial}>
                  Start free trial
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
