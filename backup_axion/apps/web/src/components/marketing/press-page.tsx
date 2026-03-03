'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Newspaper, 
  Calendar, 
  ArrowRight, 
  ChevronLeft, 
  Share2, 
  Building2,
  Target,
  Shield,
  Users,
  Handshake
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const pressReleases = [
  {
    id: 'launch-ori-os',
    slug: 'launch-ori-os-gdpr-first-revenue-os',
    title: 'Ori‑CraftLabs Launches Ori‑OS: A GDPR‑First Revenue OS for Lean Agencies',
    date: 'January 2026',
    category: 'Product Launch',
    icon: Rocket,
    tags: ['press-release', 'product-launch', 'ori-os'],
    excerpt: 'Ori‑CraftLabs today announced the launch of Ori‑OS, a Revenue OS that helps B2B agencies, consultancies, and tech SMEs run their outbound, CRM, automations, and docs from one GDPR‑aware platform.',
    content: `Ori‑CraftLabs today announced the launch of **Ori‑OS**, a Revenue OS that helps B2B agencies, consultancies, and tech SMEs run their outbound, CRM, automations, and docs from one GDPR‑aware platform.

Built in Europe for EU‑focused teams, Ori‑OS aims to replace the typical "Frankenstack" of data tools, outbound tools, CRM add‑ons, wikis, and custom automations.

## Solving the Frankenstack problem

Many lean B2B teams rely on a patchwork of tools:

- A data provider for leads.
- An outbound platform for sequences.
- A CRM for deals.
- A separate workspace for docs and playbooks.
- An automation tool to glue everything together.

Ori‑OS brings these elements into a single, multi‑tenant workspace designed around real revenue workflows instead of individual point solutions.

> "Our customers don't want yet another tool. They want one place where outbound, pipeline, tasks, and docs actually work together — and where they can answer basic questions about data and compliance," said the founder of Ori‑CraftLabs.

## Built for EU‑centric teams

Ori‑OS is particularly focused on EU‑based agencies and tech SMEs that need:

- GDPR‑aware patterns for B2B outbound.
- Global suppression and lawful‑basis tracking.
- EU‑hosted infrastructure and clear sub‑processor documentation.

While available globally, the product roadmap and defaults are anchored in European expectations for privacy and compliance.

## Key capabilities at launch

At launch, Ori‑OS includes:

- Workspaces for agencies and their clients.
- A central lead database with segmentation and basic enrichment.
- Deliverability‑safe outbound sequences across multiple mailboxes.
- Lightweight CRM features (pipelines, tasks, timelines).
- Notion‑like docs tied to workspaces and deals.
- Basic automation workflows for revenue processes.

Future releases will deepen integrations with popular CRMs and add more pre‑built templates for verticals like SaaS and consulting.

## Availability

Ori‑OS is available today for early customers in Europe, the UK, and North America, with pricing starting from €69 per month for small teams and scaling to multi‑workspace plans for agencies.

Interested teams can request a demo or start a trial at ori-os.com.

## About Ori‑CraftLabs

Ori‑CraftLabs is a European software company focused on building lean, compliant tools for B2B revenue teams. Its flagship product, Ori‑OS, is a Revenue OS that helps agencies, consultancies, and tech SMEs run their lead generation, outbound, CRM, and automations from one platform.

For media inquiries, contact: press@ori‑craftlabs.com`,
  },
  {
    id: 'multi-workspace-dashboards',
    slug: 'ori-os-multi-workspace-dashboards',
    title: 'Ori‑OS Introduces Multi‑Workspace Dashboards for Client‑Centric Agencies',
    date: 'February 2026',
    category: 'Product Update',
    icon: BarChart3,
    tags: ['press-release', 'product-update', 'dashboards'],
    excerpt: 'Ori‑CraftLabs, the company behind revenue operations platform Ori‑OS, today announced multi‑workspace dashboards, a new capability designed for agencies and consultancies that manage multiple clients on a single OS.',
    content: `Ori‑CraftLabs, the company behind revenue operations platform Ori‑OS, today announced **multi‑workspace dashboards**, a new capability designed for agencies and consultancies that manage multiple clients on a single OS.

The feature gives agency leaders a consolidated view of performance across client workspaces, while still allowing deep dives per account.

## One view across all clients

Previously, agencies could run each client inside its own workspace, but reporting required switching contexts. With multi‑workspace dashboards, they can now:

- See aggregate metrics across selected client workspaces.
- Compare outbound performance, pipeline progress, and meetings booked.
- Spot clients that need attention before the next QBR.

> "Agencies told us the most painful part of QBRs wasn't analysis, it was data assembly. Multi‑workspace dashboards let them walk into a review with a live view instead of a deck built the night before," said the founder of Ori‑CraftLabs.

## Designed for agency workflows

The new dashboards are built around common agency questions:

- Which clients are generating the most meetings this month?
- Where are deals stuck across our portfolio?
- Which campaigns are pulling their weight across accounts?

Users can filter by workspace, date range, and stage, and then click into individual workspaces for more detail.

## Available now to Growth and Agency Pro plans

Multi‑workspace dashboards are available today for customers on the Growth and Agency Pro plans. Existing workspaces will automatically appear in the dashboard selector; no separate setup is required.

More information and a walkthrough of the new dashboards can be found on the Ori‑OS Changelog and documentation.

## About Ori‑CraftLabs

Ori‑CraftLabs builds Ori‑OS, a GDPR‑aware Revenue OS that helps B2B agencies, consultancies, and tech SMEs run their lead generation, outbound, CRM, and automations from one platform.

Media contact: press@ori‑craftlabs.com`,
  },
  {
    id: 'lawful-basis-tracking',
    slug: 'ori-os-lawful-basis-tracking',
    title: 'Ori‑OS Adds Lawful‑Basis Tracking to Support GDPR‑Aware Outbound',
    date: 'February 2026',
    category: 'Compliance',
    icon: Shield,
    tags: ['press-release', 'gdpr', 'product-update'],
    excerpt: 'Ori‑CraftLabs today announced the rollout of lawful‑basis tracking in Ori‑OS, giving customers a structured way to record and reference their legal basis for processing B2B contact data in the context of GDPR.',
    content: `Ori‑CraftLabs today announced the rollout of **lawful‑basis tracking** in Ori‑OS, giving customers a structured way to record and reference their legal basis for processing B2B contact data in the context of GDPR.

The feature is aimed at agencies, consultancies, and tech SMEs that want to run B2B outbound in a more defensible way.

## Making lawful‑basis decisions visible

With the new feature, Ori‑OS customers can:

- Set lawful‑basis labels at list or contact level (e.g. legitimate interest, contract, consent, other).
- Add notes explaining why a particular contact or segment is considered relevant.
- See when a contact was added and under which basis.

> "We're not a law firm, and Ori‑OS doesn't tell you which lawful basis to choose. But we can make it easier to document decisions and show that you're thinking about privacy instead of ignoring it," said the founder of Ori‑CraftLabs.

## Supporting GDPR‑aware workflows

Lawful‑basis tracking integrates with other Ori‑OS capabilities:

- Exports can include lawful‑basis fields and notes.
- Suppression and opt‑out handling can be viewed alongside lawful‑basis context.
- Workspaces can build standard operating procedures around list creation and review.

The goal is to make GDPR‑aware workflows more practical for lean teams that don't have full‑time compliance staff.

## General availability

Lawful‑basis tracking is now available to all Ori‑OS customers at no additional charge. Related documentation and examples are published in the Ori‑OS Help Center.

## About Ori‑CraftLabs

Ori‑CraftLabs builds Ori‑OS, a Revenue OS that unifies lead generation, outbound, CRM, automations, and docs for lean B2B teams, with a particular focus on EU‑centric, GDPR‑aware operations.

Media contact: press@ori‑craftlabs.com`,
  },
  {
    id: 'design-partner-program',
    slug: 'ori-os-design-partner-program',
    title: 'Ori‑CraftLabs Launches Design Partner Program for RevOps‑Focused Agencies',
    date: 'March 2026',
    category: 'Partnership',
    icon: Handshake,
    tags: ['press-release', 'partners', 'revops'],
    excerpt: 'Ori‑CraftLabs has launched a Design Partner Program for B2B agencies and consultancies that want to help shape the future of its Revenue OS, Ori‑OS.',
    content: `Ori‑CraftLabs has launched a **Design Partner Program** for B2B agencies and consultancies that want to help shape the future of its Revenue OS, Ori‑OS.

The program is aimed at teams that run multi‑client outbound and RevOps projects and want closer input into product direction.

## What design partners receive

Selected design partners gain:

- Early access to new features and templates.
- Direct feedback sessions with the Ori‑OS product team.
- Priority consideration for roadmap items that align with the product vision.
- Time‑limited commercial incentives for initial seats or workspaces.

> "Our best ideas come from teams who are deep in the work — running outbound, cleaning lists, fighting for deliverability, and answering hard questions from their clients. The Design Partner Program formalizes that relationship," said the founder of Ori‑CraftLabs.

## Who the program is for

The program is intended for:

- B2B agencies with at least a few ongoing outbound retainers.
- RevOps consultancies implementing processes across multiple clients.
- Lean in‑house teams that behave like agencies for internal stakeholders.

Participants should be willing to:

- Share workflows, challenges, and success metrics.
- Test new features and provide structured feedback.
- Participate in case studies or anonymized learnings where appropriate.

## How to apply

Interested agencies and consultancies can apply via the Ori‑OS website or contact the team directly at partners@ori‑craftlabs.com.

Applications will be evaluated based on fit with Ori‑OS's target segments, use cases, and willingness to engage collaboratively.

## About Ori‑CraftLabs

Ori‑CraftLabs builds Ori‑OS, a GDPR‑aware Revenue OS that helps B2B agencies, consultancies, and tech SMEs run their lead generation, outbound, CRM, and automations from one platform.

Media contact: press@ori‑craftlabs.com`,
  },
  {
    id: 'revops-partner-network',
    slug: 'ori-os-revops-partner-network',
    title: 'Ori‑OS Announces RevOps Partner Network for Freelancers and Boutiques',
    date: 'March 2026',
    category: 'Partnership',
    icon: Users,
    tags: ['press-release', 'partners', 'revops', 'freelancers'],
    excerpt: 'Ori‑CraftLabs today announced the Ori‑OS RevOps Partner Network, a program that enables RevOps freelancers and boutique consultancies to deliver Ori‑OS implementations and ongoing RevOps services to their clients.',
    content: `Ori‑CraftLabs today announced the **Ori‑OS RevOps Partner Network**, a program that enables RevOps freelancers and boutique consultancies to deliver Ori‑OS implementations and ongoing RevOps services to their clients.

The network gives partners a way to package "RevOps OS setup" as a repeatable service underpinned by Ori‑OS.

## Turning RevOps expertise into productized services

RevOps specialists often design processes across fragmented stacks. With Ori‑OS, they can:

- Implement standardized workspaces and workflows.
- Reuse proven templates and playbooks across clients.
- Offer clear packages (setup, optimization, ongoing management).

Partners in the Ori‑OS network receive:

- Preferential pricing for internal use.
- Access to implementation guides and templates.
- Sales and enablement materials for pitching Ori‑OS‑based services.

> "We've seen independent RevOps experts build impressive systems with whatever tools their clients already have. The partner network is about giving them a purpose‑built OS so they can spend more time on strategy and less on plumbing," said the founder of Ori‑CraftLabs.

## Program benefits

Partner benefits include:

- Listed status as an Ori‑OS RevOps Partner (subject to criteria).
- Co‑marketing opportunities such as case studies and webinars.
- Early access to features and roadmap discussions.
- Option to co‑create niche templates (e.g., for specific verticals).

## How to join

RevOps freelancers and consultancies can express interest via partners@ori‑craftlabs.com or by applying through the Ori‑OS website.

Ori‑CraftLabs will prioritize partners who:

- Work with B2B agencies, consultancies, or tech SMEs.
- Have hands‑on experience with outbound, CRM, and revenue workflows.
- Share Ori‑OS's focus on lean, compliant operations.

## About Ori‑CraftLabs

Ori‑CraftLabs builds Ori‑OS, a Revenue OS for lean B2B teams that want to replace a fragmented revenue stack with one GDPR‑aware platform for leads, outbound, CRM, automations, and docs.

Media contact: press@ori‑craftlabs.com`,
  },
]

// Import icons that weren't at the top
import { Rocket, BarChart3 } from 'lucide-react'

type PressRelease = typeof pressReleases[0]

function PressCard({ release, onClick }: { release: PressRelease; onClick: () => void }) {
  return (
    <Card 
      className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center flex-shrink-0">
            <release.icon className="h-6 w-6 text-vivid-tangerine" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-vivid-tangerine/20 text-vivid-tangerine border-vivid-tangerine/30">
                {release.category}
              </Badge>
              <span className="text-sm text-white/40 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {release.date}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-vivid-tangerine transition-colors">{release.title}</h3>
            <p className="text-white/60 text-sm line-clamp-2">{release.excerpt}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/40 flex-shrink-0 group-hover:text-vivid-tangerine transition-colors" />
        </div>
      </CardContent>
    </Card>
  )
}

function PressReleaseView({ release, onBack }: { release: PressRelease; onBack: () => void }) {
  const { setCurrentView, setMarketingPage } = useAppStore()
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: release.title,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }
  
  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Press Release Header */}
        <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Press
              </button>

              <Badge className="bg-vivid-tangerine/20 text-vivid-tangerine border-vivid-tangerine/30 mb-4">
                Press Release
              </Badge>

              <h1 className="text-3xl md:text-4xl font-bold mb-6">{release.title}</h1>
              
              <div className="flex items-center gap-6 text-white/60 mb-8">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {release.date}
                </span>
                <Badge variant="outline" className="border-white/20 text-white/60">
                  {release.category}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white/60 hover:text-white hover:bg-white/10"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Press Release Content */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-vivid-tangerine
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-white/70 prose-p:leading-relaxed
                prose-li:text-white/70
                prose-strong:text-white
                prose-blockquote:border-l-vivid-tangerine prose-blockquote:bg-gunmetal/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:-lg
                prose-code:text-vivid-tangerine prose-code:bg-gunmetal prose-code:px-2 prose-code:py-1
                prose-ul:list-disc prose-ul:pl-6
                prose-ol:list-decimal prose-ol:pl-6
              "
            >
              <div className="whitespace-pre-wrap">
                {release.content.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-2xl font-semibold text-vivid-tangerine mt-8 mb-4">{line.replace('## ', '')}</h2>
                  }
                  if (line.startsWith('> ')) {
                    return <blockquote key={i} className="border-l-4 border-vivid-tangerine bg-gunmetal/50 py-4 px-6 my-4 italic text-white/80">{line.replace('> ', '')}</blockquote>
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="text-white/70 ml-6">{line.replace('- ', '')}</li>
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="text-white font-semibold">{line.replace(/\*\*/g, '')}</p>
                  }
                  if (line.includes('**')) {
                    const parts = line.split(/\*\*([^*]+)\*\*/)
                    return <p key={i} className="text-white/70">{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}</p>
                  }
                  if (line.trim() === '') {
                    return <br key={i} />
                  }
                  return <p key={i} className="text-white/70">{line}</p>
                })}
              </div>
            </motion.article>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-4">Want to learn more?</h2>
              <p className="text-white/60 mb-8">
                Contact our press team or start a free trial to see Ori-OS in action.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2"
                  onClick={() => setCurrentView('dashboard')}
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setMarketingPage('contact')}
                >
                  Contact Press Team
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

export function PressPage() {
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = ['All', 'Product Launch', 'Product Update', 'Compliance', 'Partnership']
  
  const filteredReleases = activeCategory && activeCategory !== 'All'
    ? pressReleases.filter(r => r.category === activeCategory)
    : pressReleases

  if (selectedRelease) {
    return <PressReleaseView release={selectedRelease} onBack={() => setSelectedRelease(null)} />
  }

  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
                <Newspaper className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Press Room
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                News, announcements, and media resources from Ori‑CraftLabs.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categories.map((category, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveCategory(category === 'All' ? null : category)}
                  className={`px-4 py-2 transition ${
                    (category === 'All' && !activeCategory) || activeCategory === category
                      ? 'bg-vivid-tangerine text-white' 
                      : 'bg-gunmetal border border-white/10 text-white/70 hover:text-white hover:border-vivid-tangerine/50'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-4">
              {filteredReleases.map((release, i) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <PressCard release={release} onClick={() => setSelectedRelease(release)} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Contact */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Media Inquiries</h2>
              <p className="text-white/60 mb-6">
                For press inquiries, interview requests, or media assets, contact our communications team.
              </p>
              <Card className="bg-gunmetal border-white/10 inline-block">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-vivid-tangerine" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Press Contact</p>
                      <a href="mailto:press@ori-craftlabs.com" className="text-vivid-tangerine hover:underline">
                        press@ori-craftlabs.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Press Kit */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold mb-4">Press Kit</h2>
              <p className="text-white/60">
                Download logos, screenshots, and company information.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-vivid-tangerine" />
                  </div>
                  <h3 className="font-semibold mb-2">Logo & Brand Assets</h3>
                  <p className="text-sm text-white/60 mb-4">Official logos in various formats</p>
                  <Button variant="outline" size="sm" className="border-white/20 text-white/70 hover:text-white" onClick={() => alert('Press kit download will be available soon. Contact press@ori-craftlabs.com for assets.')}>
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-4">
                    <Newspaper className="h-8 w-8 text-vivid-tangerine" />
                  </div>
                  <h3 className="font-semibold mb-2">Product Screenshots</h3>
                  <p className="text-sm text-white/60 mb-4">High-res product images</p>
                  <Button variant="outline" size="sm" className="border-white/20 text-white/70 hover:text-white" onClick={() => alert('Press kit download will be available soon. Contact press@ori-craftlabs.com for assets.')}>
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-vivid-tangerine" />
                  </div>
                  <h3 className="font-semibold mb-2">Company Fact Sheet</h3>
                  <p className="text-sm text-white/60 mb-4">Key facts and figures</p>
                  <Button variant="outline" size="sm" className="border-white/20 text-white/70 hover:text-white" onClick={() => alert('Press kit download will be available soon. Contact press@ori-craftlabs.com for assets.')}>
                    Download
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
