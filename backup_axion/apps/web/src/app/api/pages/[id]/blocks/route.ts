import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params
    const result = await withDb(async (db) => {
      const blocks = await db.block.findMany({
        where: { pageId },
        orderBy: { order: 'asc' },
      })

      return blocks.map(block => ({
        ...block,
        content: block.content ? JSON.parse(block.content) : null,
        properties: block.properties ? JSON.parse(block.properties) : null,
      }))
    })

    return NextResponse.json({ success: true, data: result ?? [] })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blocks' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params
    const body = await request.json()

    const result = await withDb(async (db) => {
      // Get max order
      const existingBlocks = await db.block.findMany({
        where: { pageId },
      })
      const maxOrder = existingBlocks.length > 0
        ? Math.max(...existingBlocks.map(b => b.order))
        : -1

      return db.block.create({
        data: {
          pageId,
          type: body.type || 'text',
          content: body.content ? JSON.stringify(body.content) : null,
          properties: body.properties ? JSON.stringify(body.properties) : null,
          order: body.order ?? maxOrder + 1,
          parentId: body.parentId || null,
        },
      })
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create block' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params
    const body = await request.json()

    const result = await withDb(async (db) => {
      if (Array.isArray(body.blocks)) {
        // Batch update (for reordering)
        const updates = body.blocks.map((block: { id: string; order: number }) =>
          db.block.update({
            where: { id: block.id },
            data: { order: block.order },
          })
        )
        await Promise.all(updates)
        return true
      }
      return null
    })

    if (!result) return NextResponse.json({ success: false, error: 'Invalid request or database unavailable' }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating blocks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update blocks' },
      { status: 500 }
    )
  }
}
