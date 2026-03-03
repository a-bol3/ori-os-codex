export const dynamic = 'force-dynamic'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    const result = await withDb(async (db) => {
      return db.auditLog.findMany({
        where: { organizationId: 'demo-org-001' },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    })

    return NextResponse.json({ success: true, data: result ?? [] })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ success: true, data: [] })
  }
}

