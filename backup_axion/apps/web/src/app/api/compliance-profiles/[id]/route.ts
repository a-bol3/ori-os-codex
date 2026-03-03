import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await withDb(async (db) => {
      return db.complianceProfile.findUnique({ where: { id } })
    })

    if (!result) {
      return NextResponse.json({ success: false, error: 'Profile not found or database unavailable' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching compliance profile:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 })
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
      if (body.gdprEnabled !== undefined) updateData.gdprEnabled = body.gdprEnabled
      if (body.ccpaEnabled !== undefined) updateData.ccpaEnabled = body.ccpaEnabled
      if (body.contactRetentionDays !== undefined) updateData.contactRetentionDays = body.contactRetentionDays
      if (body.activityRetentionDays !== undefined) updateData.activityRetentionDays = body.activityRetentionDays
      if (body.requireConsent !== undefined) updateData.requireConsent = body.requireConsent
      if (body.isDefault !== undefined) updateData.isDefault = body.isDefault

      return db.complianceProfile.update({ where: { id }, data: updateData })
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error updating compliance profile:', error)
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await withDb(async (db) => {
      return db.complianceProfile.delete({ where: { id } })
    })

    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting compliance profile:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete profile' }, { status: 500 })
  }
}
