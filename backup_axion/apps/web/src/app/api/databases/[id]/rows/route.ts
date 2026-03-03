import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: databaseId } = await params
    const result = await withDb(async (db) => {
      const rows = await db.knowledgeRow.findMany({
        where: { databaseId },
        include: {
          comments: true,
        },
        orderBy: { order: 'asc' },
      })

      return rows.map(row => ({
        ...row,
        values: JSON.parse(row.values),
      }))
    })

    return NextResponse.json({ success: true, data: result ?? [] })
  } catch (error) {
    console.error('Error fetching rows:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rows' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: databaseId } = await params
    const body = await request.json()

    const result = await withDb(async (db) => {
      // Get max order
      const existingRows = await db.knowledgeRow.findMany({
        where: { databaseId },
      })
      const maxOrder = existingRows.length > 0
        ? Math.max(...existingRows.map(r => r.order))
        : -1

      return db.knowledgeRow.create({
        data: {
          databaseId,
          values: JSON.stringify(body.values || {}),
          order: maxOrder + 1,
          linkedContactId: body.linkedContactId,
          linkedCompanyId: body.linkedCompanyId,
          linkedDealId: body.linkedDealId,
        },
      })
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })

    return NextResponse.json({
      success: true,
      data: { ...result, values: JSON.parse(result.values) },
    })
  } catch (error) {
    console.error('Error creating row:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create row' },
      { status: 500 }
    )
  }
}
