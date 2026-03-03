export const dynamic = 'force-dynamic'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_SETTINGS = {
  organization: {
    id: 'demo-org-001', name: 'Ori-OS Demo', slug: 'ori-os-demo',
    logo: null, website: 'https://ori-os.example.com', industry: 'Technology',
    size: '11-50', plan: 'pro', timezone: 'Europe/Warsaw', locale: 'en',
    currency: 'USD', gdprEnabled: true, gdprDefaultRetention: 365,
    gdprContactEmail: 'privacy@ori-os.example.com',
  },
  user: {
    id: 'demo-user-001', email: 'john@example.com', name: 'John Doe',
    image: null, timezone: 'Europe/Warsaw', locale: 'en', theme: 'dark',
  },
}

export async function GET() {
  try {
    const result = await withDb(async (db) => {
      const org = await db.organization.findUnique({
        where: { id: 'demo-org-001' },
        select: {
          id: true, name: true, slug: true, logo: true, website: true,
          industry: true, size: true, plan: true, timezone: true, locale: true,
          currency: true, gdprEnabled: true, gdprDefaultRetention: true, gdprContactEmail: true,
        },
      })
      const user = await db.user.findUnique({
        where: { id: 'demo-user-001' },
        select: { id: true, email: true, name: true, image: true, timezone: true, locale: true, theme: true },
      })
      return { organization: org, user }
    })

    return NextResponse.json({ success: true, data: result ?? DEMO_SETTINGS })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ success: true, data: DEMO_SETTINGS })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await withDb(async (db) => {
      if (body.organization) {
        const orgData: Record<string, unknown> = {}
        for (const key of ['name', 'website', 'industry', 'size', 'timezone', 'locale', 'currency', 'gdprContactEmail']) {
          if (body.organization[key]) orgData[key] = body.organization[key]
        }
        if (body.organization.gdprEnabled !== undefined) orgData.gdprEnabled = body.organization.gdprEnabled
        if (body.organization.gdprDefaultRetention !== undefined) orgData.gdprDefaultRetention = body.organization.gdprDefaultRetention
        await db.organization.update({ where: { id: 'demo-org-001' }, data: orgData })
      }
      if (body.user) {
        const userData: Record<string, unknown> = {}
        for (const key of ['name', 'timezone', 'locale', 'theme']) {
          if (body.user[key]) userData[key] = body.user[key]
        }
        await db.user.update({ where: { id: 'demo-user-001' }, data: userData })
      }
      return true
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 })
  }
}

