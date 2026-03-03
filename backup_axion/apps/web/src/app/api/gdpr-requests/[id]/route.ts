import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await withDb(async (db) => {
      return db.gDPRRequest.findUnique({
        where: { id },
      })
    })

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Request not found or database unavailable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching GDPR request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch request' },
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
      if (body.status) updateData.status = body.status
      if (body.completedAt) updateData.completedAt = new Date(body.completedAt)
      if (body.downloadUrl) updateData.downloadUrl = body.downloadUrl
      if (body.errorMessage !== undefined) updateData.errorMessage = body.errorMessage

      return db.gDPRRequest.update({
        where: { id },
        data: updateData,
      })
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error updating GDPR request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update request' },
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
      return db.gDPRRequest.delete({ where: { id } })
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting GDPR request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete request' },
      { status: 500 }
    )
  }
}
