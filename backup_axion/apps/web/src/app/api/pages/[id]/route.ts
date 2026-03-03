import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await withDb(async (db) => {
      const page = await db.workspacePage.findUnique({
        where: { id },
        include: {
          children: {
            where: { isArchived: false },
            orderBy: { order: 'asc' },
          },
          blocks: {
            orderBy: { order: 'asc' },
          },
          database: {
            include: {
              properties: {
                orderBy: { order: 'asc' },
              },
              views: true,
              rows: {
                include: {
                  comments: true,
                },
                orderBy: { order: 'asc' },
              },
            },
          },
          parent: true,
        },
      })
      if (!page) return null

      // Parse content JSON
      return {
        ...page,
        content: page.content ? JSON.parse(page.content) : null,
        blocks: page.blocks.map(block => ({
          ...block,
          content: block.content ? JSON.parse(block.content) : null,
          properties: block.properties ? JSON.parse(block.properties) : null,
        })),
        database: page.database ? {
          ...page.database,
          rows: page.database.rows.map(row => ({
            ...row,
            values: JSON.parse(row.values),
          })),
        } : null,
      }
    })

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Page not found or database unavailable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await withDb(async (db) => {
      const updateData: Record<string, unknown> = {}

      if (body.title !== undefined) updateData.title = body.title
      if (body.icon !== undefined) updateData.icon = body.icon
      if (body.content !== undefined) updateData.content = JSON.stringify(body.content)
      if (body.isArchived !== undefined) {
        updateData.isArchived = body.isArchived
        if (body.isArchived) updateData.archivedAt = new Date()
      }
      if (body.order !== undefined) updateData.order = body.order

      return db.workspacePage.update({
        where: { id },
        data: updateData,
        include: {
          children: true,
        },
      })
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update page' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await withDb(async (db) => {
      // Archive instead of delete
      return db.workspacePage.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date(),
        },
      })
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete page' },
      { status: 500 }
    )
  }
}
