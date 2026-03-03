'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Tag, Calendar, ArrowRight, Clock, ChevronLeft, Share2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const categories = [
  { name: 'RevOps & Strategy', count: 12 },
  { name: 'Outbound & Lead Gen', count: 18 },
  { name: 'Compliance & GDPR', count: 8 },
  { name: 'Product & Changelog', count: 6 },
]

const blogPosts = [
  {
    id: 'agency-replaced-5-tools',
    slug: 'agency-replaces-5-tools-with-revops-os',
    title: 'How One Agency Replaced 5 Tools with a Single RevOps OS',
    excerpt: 'An 8‑person B2B agency was juggling Apollo, an outbound tool, a CRM, Notion, and an automation platform. They replaced the whole stack with Ori‑OS, cut context‑switching, and shortened time‑to‑first‑meeting for new clients from weeks to days.',
    category: 'RevOps & Strategy',
    date: 'February 2026',
    readTime: '8 min',
    tags: ['case-study', 'agencies', 'revops', 'ori-os'],
    featured: true,
    content: `## The before state: a Frankenstack that "kind of worked"

If you've run an agency for more than a year, this stack will sound familiar:

- A data tool to build lists.
- An outbound tool to send sequences.
- A CRM to track deals.
- A wiki or docs tool for playbooks.
- An automation layer to glue it all together.

On paper, it's powerful. In reality:

- Lists were spread across CSVs, Apollo, and the CRM.
- Nobody trusted the pipeline because tasks and notes lived elsewhere.
- New client onboarding meant recreating the same workflows in five tools.
- Legal and compliance questions ("Where did we get this contact?" "Are they opted out?") were hard to answer.

The agency wasn't failing. But the system strained every time they added clients or staff.

## The impact on revenue and operations

The cracks showed up in three places:

1. **Time‑to‑first‑campaign**
   - New retainers took weeks before the first outbound campaign went live.
   - Everyone blamed a different tool.

2. **Deliverability and trust**
   - Nobody had a clean global view of who had opted out.
   - Some contacts got hit by multiple tools, risking sender reputation.

3. **Reporting and QBRs**
   - QBRs meant stitching together screenshots and spreadsheets.
   - It was hard to tell which campaigns actually drove pipeline.

The team wanted to grow, but each new client made the system more fragile.

## Why they looked for a Revenue OS

They didn't start by searching for "Revenue OS". They started by listing constraints:

- Keep outbound and client operations **lean and repeatable**.
- Avoid enterprise‑grade CRM complexity.
- Make it easier to answer basic compliance questions.
- Run multiple clients without building a mini‑stack per client.

They evaluated:

- Doubling down on their CRM.
- Adding even more specialized tools.
- Moving to a single system that could be their **RevOps OS**.

That's when Ori‑OS entered the conversation.

## How the migration to Ori‑OS worked

We agreed upfront: this wasn't a "flip the switch on Friday" project. The migration followed three steps:

### 1. Map their real workflows

We ignored tools and focused on flows:

- "New client signed" → "Discovery" → "First outbound campaign live."
- "Lead replied" → "Qualified" → "Hand‑off to client" → "Won or lost."
- "Quarterly review" → "Renewal or upsell."

We captured these as simple flow diagrams and then as Ori‑OS workflows.

### 2. Rebuild one client in Ori‑OS

We picked a single client with:

- A clear ICP.
- Active outbound campaigns.
- An engaged account manager.

Inside Ori‑OS we created:

- A client workspace with pipeline, tasks, and docs.
- Segmented lead lists with lawful‑basis notes where needed.
- Sequences that mirrored their best‑performing campaigns.
- Automations to trigger follow‑up tasks and stage changes.

We ran both stacks in parallel for a couple of weeks.

### 3. Roll out to additional clients

Once the first client workspace worked reliably, cloning became easy:

- Duplicate the workspace structure and pipelines.
- Adjust ICP filters and copy.
- Plug in client‑specific details.

The team went from "We're rebuilding from scratch" to "We're adapting a proven pattern."

## What changed: concrete outcomes

After three months, the agency saw:

- **Faster onboarding**
  - Time‑to‑first‑campaign for new clients dropped from "a few weeks" to "under 10 working days."
- **Less context‑switching**
  - Account managers lived inside Ori‑OS instead of bouncing across five tools.
- **Cleaner compliance posture**
  - Opt‑outs and lawful‑basis notes were centralized.
  - They could actually show how they handled data in QBRs with more demanding clients.
- **Simpler reporting**
  - For QBRs, they opened a client workspace dashboard instead of rebuilding reports from scratch.

None of this required a huge team or heavy custom development. It required committing to one OS and letting go of the idea that each client needs a bespoke stack.

## Lessons if you're considering the same move

1. **Map flows, not tools**
   Start from "how do we get from list to meeting to revenue?" then ask how Ori‑OS can express that.

2. **Pilot on one or two clients**
   Don't try to replatform everything at once. Get one client working, then scale the pattern.

3. **Use workspaces as your unit of design**
   Treat each client or product line as a workspace with a consistent structure. This is where Ori‑OS shines.

4. **Don't try to recreate every edge case**
   Use the migration as an excuse to kill workflows that don't pay off.

## Want to see how this would look for your agency?

If you're sitting on a similar Frankenstack and want to see one real client or campaign mapped into Ori‑OS, book a working session. We'll build together, not pitch in the abstract.`,
  },
  {
    id: 'deliverability-first-outbound',
    slug: 'deliverability-first-outbound-engine-2026',
    title: 'Designing a Deliverability‑First Outbound Engine in 2026',
    excerpt: 'Deliverability is no longer a "send more and pray" game. Domain reputation, sending patterns, relevance, and compliance all matter. This post breaks down how lean B2B teams can design a deliverability‑first outbound engine.',
    category: 'Outbound & Lead Gen',
    date: 'January 2026',
    readTime: '9 min',
    tags: ['outbound', 'deliverability', 'best-practices', 'email'],
    featured: true,
    content: `## Why deliverability is a system, not a setting

Most outbound problems are framed as copy issues:

- "Our subject lines are weak."
- "We need more personalization."

That matters, but the underlying system matters more:

- Domain and IP reputation.
- Volume and sending patterns.
- List quality and relevance.
- Opt‑outs and complaint rates.
- How you respond when things go wrong.

A good system makes good copy work better. A bad system makes even strong copy look like spam.

## Step 1 – Get your sending foundations right

Before the first sequence goes live, you need:

- Proper DNS setup (SPF, DKIM, DMARC) for your domains.
- Enough sending domains to spread risk across clients and campaigns.
- A plan for warm‑up, especially for new domains and mailboxes.

In Ori‑OS, we encourage:

- Connecting dedicated mailboxes per workspace or client.
- Keeping visibility over sending volumes per mailbox.
- Avoiding sudden spikes in sends when you add new campaigns.

Think of it as building lanes on a highway before releasing all the cars.

## Step 2 – Build better lists, not bigger ones

Deliverability dies fastest when:

- You blast large, unfiltered lists.
- You reuse old lists without checking engagement or relevance.
- You mix in low‑quality sources with no validation.

A deliverability‑first approach means:

- Tight targeting and segmentation by ICP.
- Reasonable batch sizes for initial campaigns.
- Ongoing hygiene: remove hard bounces, suppress repeated non‑opens if you track them, and keep track of opt‑outs.

Ori‑OS helps by:

- Giving you a central lead database across workspaces.
- Making it easy to segment and save targeted views.
- Keeping suppression lists global so contacts who opt out don't keep getting hit from other campaigns.

## Step 3 – Make each send defensible

Regulators and email providers both care about legitimacy and relevance. Each message should be:

- Clearly from a real person at a real company.
- About something that makes sense given the recipient's role.
- Easy to opt out of.

A defensible email usually includes:

- Who you are, what company you represent, and how to reach you.
- Why you're reaching out to this specific person or role.
- A simple way to say "no thanks" (reply or link).

Ori‑OS supports this by:

- Letting you store the lawful‑basis context and notes so you remember why a contact is in a list.
- Making it easy to add consistent footer content (opt‑out instructions, privacy link) to your templates.

## Step 4 – Respect replies and opt‑outs religiously

People are much more forgiving of cold outreach when:

- It's clearly B2B and relevant.
- You stop when they ask you to stop.

Deliverability‑first teams:

- Process opt‑outs quickly, ideally automatically.
- Treat "soft" opt‑out language ("not interested now") as future suppression or softer follow‑up.
- Share suppression lists across tools and teams.

With Ori‑OS, you can:

- Maintain global suppression lists across campaigns.
- Automatically detect common opt‑out phrases and flag contacts.
- Drive manual review for borderline replies, then enforce suppression.

The goal is not "never email again" — it's "never ignore a clear no."

## Step 5 – Watch signals and course‑correct

No matter how careful you are, things break:

- Open rates drop suddenly.
- Reply rates crash.
- More emails land in spam.

Deliverability‑first teams:

- Monitor key metrics per domain, mailbox, and campaign.
- Pause campaigns when they see negative trends.
- Use smaller test batches before scaling.

Ori‑OS gives you:

- Campaign‑level analytics (opens, replies, meetings, deals influenced).
- Volume overviews per mailbox and per workspace.
- A way to roll out changes centrally across campaigns and clients.

## Step 6 – Build a repeatable "health check" into your process

Treat deliverability like security: check it regularly, not just when something explodes.

Your recurring checklist might include:

- Review sending volumes vs. guidelines per mailbox.
- Audit new lists and sources for quality and lawful‑basis notes.
- Review opt‑out handling and logs.
- Pick one campaign per client to improve based on outcomes.

You can use Ori‑OS's tasks and workspaces to track these checks per client, and use dashboards in QBRs to show that you're not just "sending more" but sending smarter.

## Where Ori‑OS fits in a deliverability‑first strategy

Ori‑OS doesn't replace the need for good copy or thoughtful targeting. It gives you:

- A single place to enforce sending patterns, opt‑outs, and list hygiene.
- Visibility over campaigns and results per client.
- A way to align your team on how outbound should run.

If you're serious about making outbound a durable channel instead of a one‑off hack, build your deliverability system first — then let Ori‑OS help you run it.`,
  },
  {
    id: 'gdpr-aware-b2b-outbound',
    slug: 'gdpr-aware-b2b-outbound-for-agencies',
    title: 'GDPR‑Aware B2B Outbound: A Practical Guide for Agencies',
    excerpt: "GDPR didn't kill B2B outbound — but it did change how you should run it. This guide walks agencies and consultancies through the practical side of GDPR‑aware outbound and shows how Ori‑OS supports those workflows.",
    category: 'Compliance & GDPR',
    date: 'January 2026',
    readTime: '10 min',
    tags: ['gdpr', 'compliance', 'outbound', 'agencies'],
    featured: false,
    content: `## What GDPR actually means for B2B outbound

GDPR is about:

- Transparency.
- Lawful basis for processing.
- Respecting rights (access, deletion, objection).
- Security and minimization.

For B2B outbound, the question isn't "Is cold outreach banned?" It's:

- Do you have a lawful basis to contact this person?
- Are you honest about who you are and why you're reaching out?
- Can people easily opt out and have that respected?
- Can you show what you've done if asked?

Different EU countries interpret aspects slightly differently, and local e‑privacy rules also matter. This guide focuses on patterns that help you stay on the safer, more defensible side.

## Step 1 – Choose and document your lawful basis

Common lawful bases in B2B outbound:

- **Legitimate interest** – often used for relevant B2B outreach when you can show the interests of your business are balanced against the recipient's rights.
- **Contract** – when you're talking to existing customers or prospects who are in an active commercial conversation.
- **Consent** – usually more relevant for newsletters and ongoing marketing than for first‑touch outbound.

For each outreach program, ask:

- Who are we contacting (role, company size, sector)?
- Why is our offer relevant to their responsibilities?
- What evidence do we have that this outreach is reasonable?

Ori‑OS can't make that decision for you, but it can:

- Store lawful‑basis labels on lists and contacts.
- Keep notes on why you believe outreach is relevant.
- Export that metadata if you ever need to prove your thinking.

## Step 2 – Be transparent in your emails

Every outreach should make it easy to answer:

- Who are you?
- Why are you contacting me?
- Where did you get my details (broadly)?
- How can I opt out?

Practically, that means:

- Clear identification in signature and email content.
- A concise reason for the outreach linked to their role or company context.
- A line like "We connected on X" or "We source business contact details from [source types] and use them to reach out with relevant B2B offers" where appropriate.
- An easy opt‑out (reply or link) that you honor quickly.

Ori‑OS helps you standardize this by:

- Letting you build templates that include these elements by default.
- Making it easy to link to your Privacy Policy.

## Step 3 – Handle opt‑outs and objections properly

Regulators and recipients care a lot about what happens after "no."

Best practice:

- Every email includes a clear opt‑out mechanism.
- You treat explicit objections ("Stop emailing me", "Remove me") as absolute.
- You suppress opted‑out contacts across campaigns and lists, not just the one sequence.

Ori‑OS provides:

- Global suppression lists per workspace.
- Reply detection with basic opt‑out phrase handling.
- A way to manually review borderline replies and convert them into suppression entries.

If someone opts out, think "entire workspace," not "one list."

## Step 4 – Respect data subject rights

In B2B, you may still get:

- Access requests: "What data do you hold about me?"
- Deletion requests.
- Objections to processing.

You should be able to:

- Find their record quickly.
- Export relevant data in a readable format.
- Delete or anonymize data where appropriate.

In Ori‑OS, that means:

- Using search to locate contacts.
- Running exports that include contact details, campaign events, and lawful‑basis metadata.
- Using delete actions to remove contacts and associated events, within the constraints of your retention policies and backups.

You still need a documented internal process; Ori‑OS just makes the mechanics easier.

## Step 5 – Be thoughtful about data sources and scraping

Not all ways of obtaining B2B contacts are equal. Higher‑risk patterns include:

- Scraping from sites that explicitly forbid it in their terms.
- Collecting data from contexts where people wouldn't reasonably expect cold outreach.
- Buying lists with no transparency about how they were collected.

Safer patterns include:

- Networking events, inbound inquiries, and customer referrals.
- Publicly available, business‑relevant data (within platform rules).
- Data providers that document how they source and maintain their datasets.

Ori‑OS takes a **tool, not data broker** stance:

- You bring your own data and lists.
- We help you organize, segment, and act on them in a more compliant way.
- We do not encourage or automate high‑risk scraping flows.

## Step 6 – Build GDPR hygiene into your outbound process

Compliance isn't a one‑time project. It's a habit.

Repeatable habits might include:

- Reviewing one campaign per month for transparency and relevance.
- Auditing how your team uses lawful‑basis labels and notes.
- Spot‑checking opt‑out handling.
- Keeping your Privacy Policy and DPA up to date.

You can manage these as recurring tasks and workflows in Ori‑OS itself, and link your legal and operational teams around the same data.

## A practical way to start

If all of this feels abstract, pick one active outbound campaign and do a quick audit:

- Do we know our lawful basis for this list?
- Does the email clearly say who we are and why we're reaching out?
- Is there a simple opt‑out? Do we actually respect it across campaigns?
- Could we export and delete a contact's data if they asked?

If the answer is "not yet," Ori‑OS can help you move from "close enough" to "we have a story we're comfortable telling" — in front of clients, regulators, and your own conscience.`,
  },
  {
    id: 'stop-building-frankenstacks',
    slug: 'stop-building-frankenstacks',
    title: 'Stop Building Frankenstacks: A Practical Framework for Lean RevOps',
    excerpt: 'Many teams assume that "more tools = more capability." In reality, most mature stacks become coordination problems disguised as progress. This piece offers a practical framework for deciding when point tools are enough and when you need a Revenue OS.',
    category: 'RevOps & Strategy',
    date: 'December 2025',
    readTime: '7 min',
    tags: ['revops', 'tooling', 'strategy', 'stack-design'],
    featured: false,
    content: `## What a Frankenstack looks like in the wild

A Frankenstack isn't just "a few tools." It's a pattern:

- Data in one place.
- Outreach in another.
- CRM in a third.
- Docs in a fourth.
- Automations in a fifth.

Symptoms include:

- Nobody knows which tool is the source of truth.
- The same contact or company looks different in every system.
- Onboarding a new client or rep feels like a small change project.
- Your ops team spends more time plumbing than improving outcomes.

Sound familiar? You might already be there.

## When point tools are enough

Point tools are great when:

- You're early and validating whether a channel works at all.
- One team owns a narrow workflow end‑to‑end.
- Volume and complexity are still low enough that humans can patch gaps.

Examples:

- A two‑person team using a single outbound tool and a simple CRM.
- A solo consultant running sequences from a focused list.

In these stages, you don't need a full OS. You need clear experiments and fast learning.

## When you need an OS

You know it's time for a Revenue OS when:

1. **You manage multiple "clients" or segments with similar workflows**
   - Agencies with multiple retainers.
   - Consultancies running similar playbooks for different companies.
   - Product teams selling into distinct verticals.

2. **Workflows span tools and teams**
   - Outbound triggers tasks, which trigger deals, which trigger onboarding, all across silos.

3. **You're getting compliance or deliverability questions you can't easily answer**
   - "Where did this list come from?"
   - "Did we already contact these people?"
   - "Can we show what we did if someone asks?"

At that point, the primary problem is no longer "we don't have enough tools." It's "we don't have one place to run the system."

## A simple decision framework

Ask yourself:

1. **Is our biggest bottleneck capability or coordination?**
   - If capability: a new tool might help.
   - If coordination: centralizing workflows is more important.

2. **Does each new client or playbook require building a new mini‑stack?**
   - If yes, you're probably over‑customizing and under‑standardizing.

3. **Could we explain our revenue system on one whiteboard?**
   - If the answer is "not really," you likely need to consolidate.

If coordination and repeatability are your bottlenecks, a RevOps OS is usually the better investment than yet another point solution.

## How Ori‑OS supports lean RevOps

Ori‑OS is opinionated about:

- Using workspaces as the unit of design (per client or product line).
- Keeping lead data, outbound, CRM, tasks, docs, and automations under one roof.
- Baking in enough compliance structure to keep you honest.

Practically, that means:

- You design a set of workflows once, then adapt them across workspaces.
- You rely on one system to answer "What's going on with this account?"
- You reduce the cognitive load of managing multiple tools and logins.

## A practical next step

If you suspect you have a Frankenstack:

- Sketch your current system on paper.
- Circle the flows that cross two or more tools.
- Pick one client or segment and ask, "What would it look like to run this end‑to‑end in one OS?"

If that picture looks cleaner than what you have now, Ori‑OS is worth testing — not as another tool, but as the place your tools feed into.`,
  },
  {
    id: 'how-we-ship-ori-os',
    slug: 'how-we-ship-ori-os',
    title: 'How We Ship Ori‑OS Without Drowning in Feature Requests',
    excerpt: "It's tempting for early‑stage SaaS to say yes to every feature request, especially from big‑logo prospects. Ori‑OS takes a different path: fewer, deeper features aligned to specific revenue workflows.",
    category: 'Product & Changelog',
    date: 'December 2025',
    readTime: '7 min',
    tags: ['product', 'roadmap', 'saas', 'founder-notes'],
    featured: false,
    content: `## Our north star: improve the revenue system, not just the interface

Ori‑OS isn't a generic CRM or a blank wiki. It's a Revenue OS for lean B2B teams. That means:

- We care most about time‑to‑first‑meeting, retention, and sustainable outbound.
- We care next about compliance and clarity.
- We care about nice‑to‑haves only when they move those needles.

Every feature request gets filtered through one question:

> "Does this clearly help agencies, consultancies, or tech SMEs run revenue more effectively and safely?"

If the answer is "maybe," it goes to the backlog. If the answer is "no but it would be cool," it doesn't ship.

## How we collect and interpret requests

We collect input from:

- Customer interviews.
- Support conversations.
- Feature request boards.
- Our own usage and experiments.

But we don't treat all input equally. Instead, we:

- Look for patterns across multiple accounts, not one loud voice.
- Trace each request back to the underlying job (e.g. "We need better reporting for QBRs," not just "We want chart type X.").
- Ask "What would happen if we didn't build this?" If the answer is "not much," we keep it parked.

## Our three buckets: Now, Next, Later

We sort work into:

- **Now** – Changes that clearly improve activation, retention, compliance, or reliability in the near term.
- **Next** – Strategic bets that support our core segments once the basics are strong.
- **Later** – Interesting ideas that fit our vision but require more proof.

The public versions of these buckets live on our Roadmap and Changelog pages. Customers can see:

- What shipped recently.
- What's currently in progress.
- What we're exploring.

## Saying "no" (or "not yet") without burning bridges

We say "no" or "not yet" fairly often. When we do, we try to:

- Explain which bucket the request falls into and why.
- Offer a workaround when possible.
- Invite customers into structured feedback loops (design partner calls, betas) when a feature is closer to "Next."

This isn't about being stubborn. It's about:

- Protecting the OS from turning into a kitchen sink.
- Avoiding features that can't be priced or maintained.
- Keeping the product understandable for new teams.

## The kinds of features we love to build

We're biased toward:

- **Workflow‑level improvements** that reduce handoffs and manual steps.
- **Compliance and deliverability capabilities** that make teams more defensible.
- **Workspace features** that help agencies replicate a winning pattern across clients.
- **Reporting that supports real conversations** (like QBRs), not just dashboards for dashboards' sake.

When a request hits those notes and shows up from multiple customers, it climbs the list quickly.

## How you can influence the roadmap

If you're using Ori‑OS and have strong opinions:

- Share real workflows and pain points, not just UI ideas.
- Bring examples from multiple clients or use cases.
- Tell us what you'd trade: "We'd rather have X than Y."

We'll keep doing the hard job of saying no often enough to keep Ori‑OS sharp — so that the features we do ship make a real difference in how you run revenue.`,
  },
]

type BlogPost = typeof blogPosts[0]

function BlogCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <Card 
      className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge className="bg-vivid-tangerine/20 text-vivid-tangerine border-vivid-tangerine/30">
                {post.category}
              </Badge>
              {post.featured && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Featured
                </Badge>
              )}
              <div className="flex items-center gap-4 text-sm text-white/40">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-vivid-tangerine transition-colors">{post.title}</h3>
            <p className="text-white/60 mb-3">{post.excerpt}</p>
            {post.tags && (
              <div className="flex items-center gap-2 flex-wrap">
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-white/40 bg-white/5 px-2 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <ArrowRight className="h-5 w-5 text-white/40 flex-shrink-0 group-hover:text-vivid-tangerine transition-colors" />
        </div>
      </CardContent>
    </Card>
  )
}

function BlogPostView({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  const { setCurrentView } = useAppStore()
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }
  
  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Article Header */}
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
                Back to Blog
              </button>

              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-vivid-tangerine/20 text-vivid-tangerine border-vivid-tangerine/30">
                  {post.category}
                </Badge>
                {post.featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>
              
              <div className="flex items-center gap-6 text-white/60 mb-8">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Ori-OS Team
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>

              {post.tags && (
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="text-sm text-vivid-tangerine bg-vivid-tangerine/10 px-3 py-1">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xl text-white/70 leading-relaxed mb-8">
                {post.excerpt}
              </p>

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

        {/* Article Content */}
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
              <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />').replace(/## /g, '<h2>').replace(/\n## /g, '</p><h2>').replace(/### /g, '<h3>').replace(/\n### /g, '</p><h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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
              <h2 className="text-2xl font-bold mb-4">Ready to streamline your RevOps?</h2>
              <p className="text-white/60 mb-8">
                See how Ori-OS can replace your Frankenstack with one unified Revenue OS.
              </p>
              <Button 
                size="lg" 
                className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2"
                onClick={() => setCurrentView('dashboard')}
              >
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

export function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredPosts = activeCategory 
    ? blogPosts.filter(post => post.category === activeCategory)
    : blogPosts

  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = filteredPosts.filter(post => !post.featured)

  if (selectedPost) {
    return <BlogPostView post={selectedPost} onBack={() => setSelectedPost(null)} />
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
                <BookOpen className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                RevOps insights for lean B2B teams
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Deep dives on outbound, RevOps, compliance, and stack design — from the team building Ori-OS.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setActiveCategory(null)}
                className={`flex items-center gap-2 px-4 py-2 transition ${
                  activeCategory === null 
                    ? 'bg-vivid-tangerine text-white' 
                    : 'bg-gunmetal border border-white/10 text-white/70 hover:text-white hover:border-vivid-tangerine/50'
                }`}
              >
                <Tag className="h-4 w-4" />
                All Posts
                <span className="text-xs opacity-60">({blogPosts.length})</span>
              </motion.button>
              {categories.map((category, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2 transition ${
                    activeCategory === category.name 
                      ? 'bg-vivid-tangerine text-white' 
                      : 'bg-gunmetal border border-white/10 text-white/70 hover:text-white hover:border-vivid-tangerine/50'
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  {category.name}
                  <span className="text-xs opacity-60">({category.count})</span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {!activeCategory && featuredPosts.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-semibold text-white/80 mb-6">Featured Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <BlogCard post={post} onClick={() => setSelectedPost(post)} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Posts */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-white/80 mb-6">
              {activeCategory ? `${activeCategory} Articles` : 'All Articles'}
            </h2>
            <div className="space-y-4">
              {(activeCategory ? filteredPosts : regularPosts).map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <BlogCard post={post} onClick={() => setSelectedPost(post)} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Get RevOps insights in your inbox</h2>
              <p className="text-white/60 mb-8">
                Weekly tips on outbound, compliance, and running lean RevOps.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gunmetal border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-vivid-tangerine/50"
                />
                <Button className="w-full sm:w-auto bg-vivid-tangerine hover:bg-tangerine-dark text-white" onClick={() => alert('Newsletter subscription feature coming soon!')}>
                  Subscribe
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
