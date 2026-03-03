import { auth } from '@/auth'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    const orgId = session?.user?.organizationId || 'demo-org-001'

    const result = await withDb(async (db) => {
      return db.complianceProfile.findMany({
        where: { organizationId: orgId },
        orderBy: { isDefault: 'desc' },
      })
    })

    return NextResponse.json({ success: true, data: result ?? [] })
  } catch (error) {
    console.error('Error fetching compliance profiles:', error)
    return NextResponse.json({ success: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const orgId = session?.user?.organizationId || 'demo-org-001'
    const body = await request.json()
    const result = await withDb(async (db) => {
      return db.complianceProfile.create({
        data: {
          organizationId: orgId,
          name: body.name,
          description: body.description,
          gdprEnabled: body.gdprEnabled ?? true,
          ccpaEnabled: body.ccpaEnabled ?? false,
          contactRetentionDays: body.contactRetentionDays,
          activityRetentionDays: body.activityRetentionDays,
          requireConsent: body.requireConsent ?? true,
          isDefault: false,
        },
      })
    })
    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error creating compliance profile:', error)
    return NextResponse.json({ success: false, error: 'Failed to create profile' }, { status: 500 })
  }
}

