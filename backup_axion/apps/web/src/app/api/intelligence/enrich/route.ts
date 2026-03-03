export const dynamic = 'force-dynamic'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_ENRICH = {
  stats: { totalEnriched: 847, pendingEnrichment: 23, dataPoints: 128, lastUpdated: '2 hours ago' },
  queue: [],
}

export async function GET() {
  try {
    const result = await withDb(async (db) => {
      const [totalEnriched, pendingEnrichment] = await Promise.all([
        db.contact.count({ where: { organizationId: 'demo-org-001', enrichmentStatus: 'complete' } }),
        db.contact.count({ where: { organizationId: 'demo-org-001', enrichmentStatus: 'pending' } }),
      ])
      const recentJobs = await db.activity.findMany({
        where: { organizationId: 'demo-org-001', type: 'enrichment' }, take: 5, orderBy: { occurredAt: 'desc' },
      })
      return {
        stats: { totalEnriched, pendingEnrichment, dataPoints: 128, lastUpdated: '2 hours ago' },
        queue: recentJobs.map(job => ({
          id: job.id, name: job.title || 'Enrichment Job', description: job.description,
          progress: Math.floor(Math.random() * 100), status: 'processing', startedAt: job.occurredAt,
        })),
      }
    })
    return NextResponse.json({ success: true, data: result ?? DEMO_ENRICH })
  } catch (error) {
    return NextResponse.json({ success: true, data: DEMO_ENRICH })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactIds, type = 'contact' } = body
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No contacts specified' }, { status: 400 })
    }
    const result = await withDb(async (db) => {
      await db.contact.updateMany({ where: { id: { in: contactIds }, organizationId: 'demo-org-001' }, data: { enrichmentStatus: 'pending' } })
      await db.activity.create({
        data: { organizationId: 'demo-org-001', type: 'enrichment', title: 'Enrichment Job Started', description: `Enriching ${contactIds.length} ${type}${contactIds.length > 1 ? 's' : ''}`, metadata: JSON.stringify({ contactIds, type }) },
      })
      return true
    })
    return NextResponse.json({ success: true, data: { jobId: `enrich-${Date.now()}`, contactCount: contactIds.length, status: 'started' } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to start enrichment' }, { status: 500 })
  }
}

