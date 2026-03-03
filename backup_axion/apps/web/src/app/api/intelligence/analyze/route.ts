export const dynamic = 'force-dynamic'
import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_OVERVIEW = {
  overview: { totalContacts: 1247, totalCompanies: 89, hotLeads: 45, avgScore: 67 },
  insights: [
    { type: 'trend', title: 'Increased Email Engagement', description: 'Email open rates have increased by 15% over the past week.' },
    { type: 'opportunity', title: 'TechCorp Showing Strong Interest', description: 'Multiple stakeholders from TechCorp have engaged with your content.' },
    { type: 'alert', title: 'Stale Leads Detected', description: "23 leads haven't been contacted in 14+ days." },
  ],
  recommendations: [
    { priority: 'high', action: 'Follow up with Sarah Johnson', target: 'TechCorp Inc.', reason: 'Opened your email 3 times in the last 24 hours' },
    { priority: 'medium', action: 'Send technical whitepaper', target: 'Michael Chen (CTO)', reason: 'CTO role indicates interest in technical details' },
    { priority: 'low', action: 'Schedule demo call', target: 'GrowthCo', reason: 'Company announced product launch - good timing' },
  ],
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'overview'
  const id = searchParams.get('id')

  try {
    if (type === 'overview') {
      const result = await withDb(async (db) => {
        const [totalContacts, totalCompanies, hotLeads, avgScore] = await Promise.all([
          db.contact.count({ where: { organizationId: 'demo-org-001' } }),
          db.company.count({ where: { organizationId: 'demo-org-001' } }),
          db.contact.count({ where: { organizationId: 'demo-org-001', score: { gte: 85 } } }),
          db.contact.aggregate({ where: { organizationId: 'demo-org-001', score: { not: null } }, _avg: { score: true } }),
        ])

        return {
          overview: { totalContacts, totalCompanies, hotLeads, avgScore: Math.round(avgScore._avg.score || 0) },
          insights: DEMO_OVERVIEW.insights,
          recommendations: DEMO_OVERVIEW.recommendations,
        }
      })

      return NextResponse.json({ success: true, data: result ?? DEMO_OVERVIEW })
    }

    return NextResponse.json({ success: false, error: 'Invalid analysis type' }, { status: 400 })
  } catch (error) {
    console.error('Error analyzing:', error)
    return NextResponse.json({ success: true, data: DEMO_OVERVIEW })
  }
}

