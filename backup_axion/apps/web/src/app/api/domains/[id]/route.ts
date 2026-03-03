import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await withDb(async (db) => {
      return db.domain.findUnique({ where: { id }, include: { mailboxes: true } })
    })
    if (!result) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch domain' }, { status: 500 })
  }
}
