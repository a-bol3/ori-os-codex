export const dynamic = 'force-dynamic'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const result = await withDb(async (db) => {
      const contactWhere: Record<string, unknown> = { organizationId: 'demo-org-001' }
      if (query) {
        contactWhere.OR = [
          { firstName: { contains: query } }, { lastName: { contains: query } },
          { email: { contains: query } }, { title: { contains: query } },
        ]
      }

      const contacts = await db.contact.findMany({
        where: contactWhere, include: { company: true },
        skip: (page - 1) * limit, take: limit, orderBy: { score: 'desc' },
      })

      const total = await db.contact.count({ where: contactWhere })

      return {
        data: contacts.map(c => ({
          id: c.id, firstName: c.firstName, lastName: c.lastName,
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
          email: c.email, phone: c.phone, title: c.title, seniority: c.seniority,
          company: c.company ? { id: c.company.id, name: c.company.name, industry: c.company.industry } : null,
          score: Math.min(100, (c.score || 50)), status: (c.score || 50) >= 85 ? 'hot' : (c.score || 50) >= 65 ? 'warm' : 'cold',
          enrichmentStatus: c.enrichmentStatus, createdAt: c.createdAt,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      }
    })

    if (result) return NextResponse.json({ success: true, ...result })
    return NextResponse.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } })
  } catch (error) {
    return NextResponse.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } })
  }
}

