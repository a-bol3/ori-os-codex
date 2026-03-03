export const dynamic = 'force-dynamic'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const result = await withDb(async (db) => {
      return db.page.findMany({
        where: { organizationId: 'demo-org-001' },
        orderBy: { updatedAt: 'desc' },
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
      return db.page.create({
        data: {
          organizationId: 'demo-org-001',
          title: body.title || 'Untitled',
          icon: body.icon,
          parentId: body.parentId,
          isDatabase: body.isDatabase ?? false,
        },
      })
    })
    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create page' }, { status: 500 })
  }
}

