export const dynamic = 'force-dynamic'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const result = await withDb(async (db) => {
      return db.gDPRRequest.findMany({
        where: { organizationId: 'demo-org-001' },
        orderBy: { createdAt: 'desc' },
      })
    })

    return NextResponse.json({ success: true, data: result ?? [] })
  } catch (error) {
    console.error('Error fetching GDPR requests:', error)
    return NextResponse.json({ success: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await withDb(async (db) => {
      return db.gDPRRequest.create({
        data: {
          organizationId: 'demo-org-001',
          type: body.type,
          contactEmail: body.contactEmail,
          contactId: body.contactId,
          status: 'pending',
        },
      })
    })
    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error creating GDPR request:', error)
    return NextResponse.json({ success: false, error: 'Failed to create GDPR request' }, { status: 500 })
  }
}

