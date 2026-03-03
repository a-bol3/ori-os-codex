'use client'

import { motion } from 'framer-motion'
import {
  Target,
  Mail,
  Building2,
  Workflow,
  Shield,
  BarChart3,
  ArrowRight,
  Check,
  Database,
  Filter,
  Upload,
  Tag,
  FileText,
  History,
  Link2,
  Send,
  Split,
  Eye,
  Ban,
  Calendar,
  Users,
  FolderKanban,
  CheckCircle2,
  Lock,
  Settings,
  Building,
  Rocket,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const pillars = [
  {
    icon: Target,
    title: 'Intelligence',
    subtitle: 'Know who to talk to',
    description: 'Build precise B2B lead lists, segment them by ICP, and keep them clean over time, while keeping lawful‑basis and suppression under control.',
  },
  {
    icon: Mail,
    title: 'Engagement',
    subtitle: 'Reach out without burning domains',
    description: 'Design and send multi‑step outbound campaigns across multiple mailboxes, with built‑in rails to protect deliverability and brand reputation.',
  },
  {
    icon: Building2,
    title: 'CRM & Workspaces',
    subtitle: 'One view per client or product line',
    description: 'Track deals, tasks, documents, and activity in shared workspaces instead of scattering information across multiple tools.',
  },
  {
    icon: Workflow,
    title: 'Automations',
    subtitle: 'Orchestrate workflows without a "glue" tool',
    description: 'Trigger and run revenue workflows based on events across your OS, without stitching together brittle scripts or generic automation platforms.',
  },
  {
    icon: Shield,
    title: 'Compliance & Analytics',
    subtitle: 'Stay EU‑ready while you scale',
    description: 'Bake in suppression, lawful‑basis tracking, and audit logs from day one, and see which campaigns and pipelines actually drive meetings and revenue.',
  },
]

const intelligenceFeatures = [
  { icon: Database, text: 'Central contact and company database across all workspaces.' },
  { icon: Filter, text: 'Flexible filters and saved views by ICP, segment, campaign, or client.' },
  { icon: Upload, text: 'CSV imports from existing sources (e.g. exports from data tools or LinkedIn).' },
  { icon: Tag, text: 'Light enrichment and tagging to keep lists usable instead of messy.' },
  { icon: FileText, text: 'Lawful‑basis fields and notes so you remember why you\'re contacting each person.' },
  { icon: History, text: 'Activity history that shows how contacts have been approached over time.' },
]

const engagementFeatures = [
  { icon: Link2, text: 'Connect Google Workspace and Microsoft 365 mailboxes in a few clicks.' },
  { icon: Send, text: 'Build multi‑step email sequences with delays, conditions, and fallbacks.' },
  { icon: Split, text: 'Distribute sending across multiple mailboxes to spread load and risk.' },
  { icon: Eye, text: 'Automatically detect replies and categorize into basic outcomes (positive, negative, neutral) you can refine over time.' },
  { icon: Ban, text: 'Global suppression and unsubscribe handling to avoid re‑contacting opted‑out addresses.' },
  { icon: Calendar, text: 'Track meetings booked and calendar events back to sequences and campaigns.' },
  { icon: Target, text: 'Simple volume and warm‑up guidance so you don\'t accidentally spike sending.' },
]

const crmFeatures = [
  { icon: FolderKanban, text: 'Visual pipelines tailored to your sales or delivery stages.' },
  { icon: History, text: 'Deal records with full activity timelines (emails, tasks, notes, automations).' },
  { icon: CheckCircle2, text: 'Tasks and reminders across team members, linked to contacts and deals.' },
  { icon: FileText, text: 'Notion‑like pages for playbooks, briefs, meeting notes, and SOPs.' },
  { icon: Building, text: 'Per‑client workspace structure: see exactly what\'s happening for each account.' },
  { icon: Lock, text: 'Role‑based access so the right people see the right workspaces and data.' },
]

const automationFeatures = [
  { icon: Target, text: 'Trigger workflows from key events: new lead added, stage change, reply received, task completed.' },
  { icon: Send, text: 'Define actions: send emails, create tasks, move deals, update fields, send webhooks.' },
  { icon: FileText, text: 'Build reusable playbooks like "first outbound campaign," "re‑engage old leads," or "handover to CSM".' },
  { icon: Building2, text: 'Run workflows per workspace so each client can have their own flavor without chaos.' },
  { icon: Shield, text: 'Safeguards that prevent accidental mass blasts or duplicate triggers.' },
  { icon: Eye, text: 'Simple monitoring: see which workflows are active, how often they run, and where they fail.' },
]

const complianceFeatures = [
  { icon: FileText, text: 'Lawful‑basis fields at list or contact level (e.g. legitimate interest, contract, consent, other).' },
  { icon: Calendar, text: 'Timestamps and notes for when and why a contact was added.' },
  { icon: Ban, text: 'Global suppression lists across campaigns and workspaces.' },
  { icon: History, text: 'Basic audit logs for critical actions such as imports, exports, campaign launches, and permission changes.' },
  { icon: Database, text: 'Data export and deletion actions surfaced in the UI for individual contacts (subject to your retention and backups).' },
]

const analyticsFeatures = [
  { icon: BarChart3, text: 'Campaign reports: opens, clicks (if you use tracking), replies, meetings, deals influenced.' },
  { icon: FolderKanban, text: 'Pipeline overview by workspace and across your whole business.' },
  { icon: Building, text: 'Client‑level dashboards so agencies can walk through performance in QBRs.' },
  { icon: Eye, text: 'Simple, actionable views — less time slicing data, more time making decisions.' },
]

const teamTypes = [
  {
    title: 'Agencies',
    icon: Building,
    description: 'Standardize how you run outbound for every client, from first list build to QBR. Replace scattered tools with one OS that can be cloned, adapted, and improved from client to client.',
  },
  {
    title: 'Consultancies & RevOps freelancers',
    icon: Briefcase,
    description: 'Turn "RevOps OS setup" into a productized service. Design, implement, and manage Ori‑OS workspaces for your clients, then use automations and playbooks to keep them running smoothly.',
  },
  {
    title: 'SaaS & tech SMEs',
    icon: Rocket,
    description: 'Keep your outbound and customer pipeline lean without jumping straight into a heavyweight CRM suite. Use Ori‑OS as the operating system for prospecting, sales, and early customer success.',
  },
]

export function FeaturesPage() {
  const { setMarketingPage, setCurrentView } = useAppStore()

  const handleStartTrial = () => {
    setCurrentView('dashboard')
    window.scrollTo(0, 0)
  }

  const handleBookDemo = () => {
    setMarketingPage('demo')
    window.scrollTo(0, 0)
  }

  const handleBookWalkthrough = () => {
    setMarketingPage('demo')
    window.scrollTo(0, 0)
  }

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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="heading-gradient">Run your entire revenue machine from one compliant</span>{' '}
                <span className="heading-highlight curved-underline">OS</span>
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8 font-normal">
                Ori‑OS replaces outbound tools, CRM add‑ons, Notion docs, and automation glue with a single, GDPR‑aware Revenue OS built for lean B2B agencies, consultancies, and tech teams.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={handleStartTrial}>
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleBookDemo}>
                  Book a demo
                </Button>
              </div>

              {/* Reassurance */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/60">
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-vivid-tangerine" /> EU‑hosted</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-vivid-tangerine" /> Deliverability‑safe</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-vivid-tangerine" /> Built for 3–50 person B2B teams</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Revenue OS in Five Pillars - Intro */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold mb-6">
                Revenue OS in <span className="heading-highlight curved-underline">five pillars</span>
              </h2>
              <p className="text-lg text-white/60 leading-relaxed font-normal">
                Most B2B teams grow into a Frankenstack: one tool for data, another for outbound, another for CRM, plus a wiki and an automation layer to glue it all together. Ori‑OS takes a different approach — one opinionated OS that covers the end‑to‑end revenue loop.
              </p>
            </motion.div>

            {/* Pillar Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={i === 4 ? 'md:col-span-2 lg:col-span-1' : ''}
                >
                  <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all h-full">
                    <CardContent className="p-6">
                      <div className="feature-icon-square bg-vivid-tangerine/10 border-vivid-tangerine/30 mb-4">
                        <pillar.icon className="h-6 w-6 text-vivid-tangerine" />
                      </div>
                      <h3 className="text-lg font-bold mb-1">{pillar.title}</h3>
                      <p className="text-sm text-vivid-tangerine mb-3">{pillar.subtitle}</p>
                      <p className="text-sm text-white/60 font-normal">{pillar.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" className="border-vivid-tangerine text-vivid-tangerine hover:bg-vivid-tangerine/10" onClick={handleBookWalkthrough}>
                See how these pillars replace your Frankenstack → Book a live walkthrough
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Intelligence Section */}
        <section id="lead-intelligence" className="py-20 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-vivid-tangerine/20 text-vivid-tangerine mb-4">Intelligence</Badge>
                <h2 className="text-3xl font-bold mb-4">
                  Lead Intelligence – enrich every contact with the context you need
                </h2>
                <p className="text-white/60 mb-6 leading-relaxed font-normal">
                  Ori‑OS pulls key business data into your lead database so your segments, messaging, and routing stay relevant without juggling extra tools.
                </p>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-vivid-tangerine mt-2 flex-shrink-0" />
                    <span className="text-white/70">Enrich contacts with 50+ data points automatically, where available (company size, industry, role, location, technographics, and more).</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-vivid-tangerine mt-2 flex-shrink-0" />
                    <span className="text-white/70">Keep enrichment close to where your team actually works — inside workspaces and pipelines, not in disconnected spreadsheets.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-vivid-tangerine mt-2 flex-shrink-0" />
                    <span className="text-white/70">Use enriched fields to build tighter ICP segments and drive smarter sequences and workflows.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-vivid-tangerine mt-2 flex-shrink-0" />
                    <span className="text-white/70">Avoid over‑collection by focusing on the fields that support your outreach and routing decisions.</span>
                  </div>
                </div>
                <Card className="bg-vivid-tangerine/10 border-vivid-tangerine/30 mb-6">
                  <CardContent className="p-4">
                    <p className="text-vivid-tangerine font-medium text-sm">
                      Spend less time hunting for context and more time running campaigns that speak to the right people with the right message.
                    </p>
                  </CardContent>
                </Card>
                <Button 
                  variant="outline" 
                  className="border-vivid-tangerine text-vivid-tangerine hover:bg-vivid-tangerine/10 gap-2"
                  onClick={() => {
                    setMarketingPage('home')
                    setTimeout(() => {
                      const workflowSection = document.querySelector('[data-workflow-section]')
                      if (workflowSection) {
                        workflowSection.scrollIntoView({ behavior: 'smooth' })
                      }
                    }, 100)
                  }}
                >
                  See full workflow
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gunmetal border border-white/10 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6 text-vivid-tangerine" />
                  <span className="font-semibold">Lead Database</span>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5">
                      <div className="w-10 h-10 bg-vivid-tangerine/20 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-white/20 w-32 mb-1" />
                        <div className="h-2 bg-white/10 w-24" />
                      </div>
                      <Badge variant="outline" className="text-xs border-vivid-tangerine/50 text-vivid-tangerine">
                        ICP Match
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-vivid-tangerine mt-4 font-medium">
                  You stay in control of your data. Ori‑OS helps you turn that data into targeted, trackable campaigns instead of dead spreadsheets.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Engagement Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1 bg-gunmetal border border-white/10 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-6 w-6 text-vivid-tangerine" />
                  <span className="font-semibold">Email Sequences</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border-l-2 border-vivid-tangerine">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Step 1: Initial Outreach</span>
                      <Badge className="bg-green-500/20 text-green-400">Sent</Badge>
                    </div>
                    <p className="text-xs text-white/60">Wait 2 days →</p>
                  </div>
                  <div className="p-4 bg-white/5 border-l-2 border-vivid-tangerine">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Step 2: Follow-up</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                    </div>
                    <p className="text-xs text-white/60">Wait 4 days →</p>
                  </div>
                  <div className="p-4 bg-white/5 border-l-2 border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Step 3: Break-up</span>
                      <Badge className="bg-white/10 text-white/40">Queued</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-vivid-tangerine mt-4 font-medium">
                  Swap "spray and pray" for predictable, controlled outbound that your team — and your domains — can live with.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <Badge className="bg-vivid-tangerine/20 text-vivid-tangerine mb-4">Engagement</Badge>
                <h2 className="text-3xl font-bold mb-4">
                  Outbound that respects inboxes and protects your domains
                </h2>
                <p className="text-white/60 mb-6 leading-relaxed font-normal">
                  Sending more emails is easy. Sending more of the right emails, at the right volume, without torching sender reputation is harder. Ori‑OS is built around deliverability‑safe outbound, so your campaigns can scale without surprises.
                </p>
                <div className="space-y-3">
                  {engagementFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <feature.icon className="h-5 w-5 text-vivid-tangerine flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/70">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CRM & Workspaces Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-vivid-tangerine/20 text-vivid-tangerine mb-4">CRM & Workspaces</Badge>
                <h2 className="text-3xl font-bold mb-4">
                  Client workspaces that unite deals, tasks, and docs
                </h2>
                <p className="text-white/60 mb-6 leading-relaxed font-normal">
                  Agencies, consultancies, and lean SaaS teams often run their business from email, a CRM, a project tool, and a wiki. Ori‑OS gives you one workspace per client or product line where everything lives together, so you can see the full picture at a glance.
                </p>
                <div className="space-y-3">
                  {crmFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <feature.icon className="h-5 w-5 text-vivid-tangerine flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/70">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gunmetal border border-white/10 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FolderKanban className="h-6 w-6 text-vivid-tangerine" />
                  <span className="font-semibold">Pipeline View</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['Lead', 'Qualified', 'Proposal', 'Won'].map((stage, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-xs font-medium text-center text-white/60">{stage}</div>
                      {[1, 2].slice(0, i === 3 ? 1 : i + 1).map((j) => (
                        <div key={j} className="p-2 bg-white/5 text-xs">
                          <div className="h-2 bg-white/30 w-full mb-1" />
                          <div className="h-1.5 bg-white/10 w-2/3" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-vivid-tangerine mt-4 font-medium">
                  Your clients don&apos;t care which tools you use. They care that you deliver outcomes on time — Ori‑OS keeps the work organized so you can focus on results.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Automations Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1 bg-gunmetal border border-white/10 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Workflow className="h-6 w-6 text-vivid-tangerine" />
                  <span className="font-semibold">Workflow Builder</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-vivid-tangerine/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-vivid-tangerine" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Trigger: New Lead Added</div>
                      <div className="text-xs text-white/60">When a contact is added to "Enterprise" list</div>
                    </div>
                  </div>
                  <div className="pl-6 border-l-2 border-vivid-tangerine/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-vivid-tangerine/10 flex items-center justify-center">
                        <Send className="h-4 w-4 text-vivid-tangerine" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Action: Add to Sequence</div>
                        <div className="text-xs text-white/60">"Enterprise Outreach" sequence</div>
                      </div>
                    </div>
                  </div>
                  <div className="pl-6 border-l-2 border-vivid-tangerine/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-vivid-tangerine/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-vivid-tangerine" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Action: Create Task</div>
                        <div className="text-xs text-white/60">"Research contact" assigned to owner</div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-vivid-tangerine mt-4 font-medium">
                  If a process happens more than twice a month and follows clear steps, it should be a workflow in Ori‑OS, not a one‑off fire drill.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <Badge className="bg-vivid-tangerine/20 text-vivid-tangerine mb-4">Automations</Badge>
                <h2 className="text-3xl font-bold mb-4">
                  Automate the boring, keep control of the important
                </h2>
                <p className="text-white/60 mb-6 leading-relaxed font-normal">
                  If your revenue workflows live in someone&apos;s head or a static checklist, they break under load. If they live in a generic automation tool glued to five other apps, they&apos;re fragile. Ori‑OS lets you automate the core loops that drive meetings and revenue right where the data already lives.
                </p>
                <div className="space-y-3">
                  {automationFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <feature.icon className="h-5 w-5 text-vivid-tangerine flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/70">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Compliance & Analytics Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="bg-vivid-tangerine/20 text-vivid-tangerine mb-4">Compliance & Analytics</Badge>
              <h2 className="text-3xl font-bold mb-4">
                Designed for <span className="heading-highlight curved-underline">GDPR‑aware</span> agencies and tech teams
              </h2>
              <p className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed font-normal">
                Compliance is often an afterthought tacked onto a stack that grew too fast. Ori‑OS bakes in patterns that make it easier to respect data subjects and document how you use their data, without turning every campaign into a legal project.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Compliance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gunmetal border-white/10 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-vivid-tangerine" />
                      <h3 className="text-xl font-semibold">Compliance Features</h3>
                    </div>
                    <div className="space-y-3">
                      {complianceFeatures.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <feature.icon className="h-5 w-5 text-vivid-tangerine flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/70">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Analytics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gunmetal border-white/10 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <BarChart3 className="h-6 w-6 text-vivid-tangerine" />
                      <h3 className="text-xl font-semibold">Analytics & Reporting</h3>
                    </div>
                    <div className="space-y-3">
                      {analyticsFeatures.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <feature.icon className="h-5 w-5 text-vivid-tangerine flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/70">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <p className="text-center text-vivid-tangerine mt-8 font-medium">
              You stay in charge of your legal strategy. Ori‑OS gives you the tools to implement it consistently inside your revenue engine.
            </p>
          </div>
        </section>

        {/* Built for Different Teams */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold mb-4">
                Built for agencies, consultancies, and tech <span className="heading-highlight curved-underline">SMEs</span>
              </h2>
              <p className="text-lg text-white/60 font-normal">
                One OS, three main ways to use it
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamTypes.map((type, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all h-full">
                    <CardContent className="p-8 text-center">
                      <div className="feature-icon-square bg-vivid-tangerine/10 border-vivid-tangerine/30 mx-auto mb-6" style={{ width: '64px', height: '64px' }}>
                        <type.icon className="h-8 w-8 text-vivid-tangerine" />
                      </div>
                      <h3 className="text-xl font-bold mb-4">{type.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed font-normal">{type.description}</p>
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
                See how Ori‑OS would replace your current stack
              </h2>
              <p className="text-lg text-white/60 mb-8">
                Bring your current tools and one real client example. In a single working session, we&apos;ll map how Ori‑OS can simplify your revenue engine.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={handleBookDemo}>
                  Book a demo
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
