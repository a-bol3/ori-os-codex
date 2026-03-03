import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await withDb(async (db) => {
      const database = await db.knowledgeDatabase.findUnique({
        where: { id },
        include: {
          page: true,
          properties: {
            orderBy: { order: 'asc' },
          },
          views: true,
          rows: {
            orderBy: { order: 'asc' },
            include: {
              comments: true,
            },
          },
        },
      })

      if (!database) return null

      // Parse row values
      return {
        ...database,
        rows: database.rows.map(row => ({
          ...row,
          values: JSON.parse(row.values),
        })),
      }
    })

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Database not found or unavailable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch database' },
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
      if (body.name) updateData.name = body.name
      if (body.description !== undefined) updateData.description = body.description
      if (body.icon) updateData.icon = body.icon

      const database = await db.knowledgeDatabase.update({
        where: { id },
        data: updateData,
      })

      // Update page title if name changed
      if (body.name) {
        await db.workspacePage.update({
          where: { id: database.pageId },
          data: { title: body.name, icon: body.icon },
        })
      }

      return database
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error updating database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update database' },
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
      const database = await db.knowledgeDatabase.findUnique({
        where: { id },
        select: { pageId: true },
      })

      if (database) {
        // Archive the page instead of deleting
        return db.workspacePage.update({
          where: { id: database.pageId },
          data: { isArchived: true, archivedAt: new Date() },
        })
      }
      return null
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable or not found' }, { status: 503 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete database' },
      { status: 500 }
    )
  }
}
