export const dynamic = 'force-dynamic'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const result = await withDb(async (db) => {
      return db.domain.findMany({
        where: { organizationId: 'demo-org-001' },
        include: { mailboxes: true, warmupPlans: { where: { status: 'active' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
      })
    })
    return NextResponse.json({ success: true, data: result ?? [] })
  } catch (error) {
    return NextResponse.json({ success: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await withDb(async (db) => {
      return db.domain.create({
        data: {
          organizationId: 'demo-org-001', domain: body.domain, status: 'pending',
          spfStatus: 'pending', dkimStatus: 'pending', dmarcStatus: 'pending',
          dailyLimit: body.dailyLimit || 100, monthlyLimit: body.monthlyLimit || 3000, warmupEnabled: false,
        },
      })
    })
    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create domain' }, { status: 500 })
  }
}

