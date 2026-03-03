export const dynamic = 'force-dynamic'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const EMPTY_RESULTS = { contacts: [], companies: [], deals: [], campaigns: [], workflows: [], pages: [] }

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  if (!query || query.length < 2) {
    return NextResponse.json({ success: true, data: EMPTY_RESULTS })
  }

  try {
    const organizationId = 'demo-org-001'

    const result = await withDb(async (db) => {
      const [contacts, companies, deals, campaigns, workflows] = await Promise.all([
        db.contact.findMany({
          where: { organizationId, OR: [{ firstName: { contains: query } }, { lastName: { contains: query } }, { email: { contains: query } }] },
          take: 5, include: { company: { select: { name: true } } },
        }),
        db.company.findMany({ where: { organizationId, OR: [{ name: { contains: query } }, { domain: { contains: query } }] }, take: 5 }),
        db.deal.findMany({ where: { organizationId, name: { contains: query } }, take: 5 }),
        db.campaign.findMany({ where: { organizationId, name: { contains: query } }, take: 5 }),
        db.workflow.findMany({ where: { organizationId, OR: [{ name: { contains: query } }, { description: { contains: query } }] }, take: 5 }),
      ])

      return {
        contacts: contacts.map(c => ({ id: c.id, type: 'contact', title: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email, subtitle: c.company?.name || c.email || '', icon: '👤' })),
        companies: companies.map(c => ({ id: c.id, type: 'company', title: c.name, subtitle: c.domain || c.industry || '', icon: '🏢' })),
        deals: deals.map(d => ({ id: d.id, type: 'deal', title: d.name, subtitle: `$${d.value?.toLocaleString() || 0} - ${d.stage}`, icon: '💰' })),
        campaigns: campaigns.map(c => ({ id: c.id, type: 'campaign', title: c.name, subtitle: `${c.status} - ${c.sentCount} sent`, icon: '📧' })),
        workflows: workflows.map(w => ({ id: w.id, type: 'workflow', title: w.name, subtitle: `${w.status} - ${w.category || 'Automation'}`, icon: '⚡' })),
        pages: [],
      }
    })

    return NextResponse.json({ success: true, data: result ?? EMPTY_RESULTS })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ success: true, data: EMPTY_RESULTS })
  }
}

