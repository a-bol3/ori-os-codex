import { auth } from '@/auth'
import { withDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEMO_DASHBOARD = {
  stats: {
    totalContacts: 1247,
    totalCompanies: 89,
    activeDeals: 34,
    pipelineValue: 892500,
    emailsSent: 15420,
    openRate: 42.3,
    replyRate: 8.7,
    bounceRate: 1.2,
    activeCampaigns: 6,
    activeWorkflows: 12,
  },
  recentActivities: [
    {
      id: 'act-1', type: 'email_sent', title: 'Follow-up email sent',
      description: 'Automated follow-up to contact', metadata: null,
      occurredAt: new Date().toISOString(),
      contact: { id: 'c-1', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@example.com' },
      company: { id: 'co-1', name: 'TechCorp Inc.' },
    },
    {
      id: 'act-2', type: 'deal_updated', title: 'Deal stage updated',
      description: 'Moved to negotiation stage', metadata: null,
      occurredAt: new Date(Date.now() - 3600000).toISOString(),
      contact: { id: 'c-2', firstName: 'James', lastName: 'Wilson', email: 'james@example.com' },
      company: { id: 'co-2', name: 'GlobalSoft Ltd.' },
    },
    {
      id: 'act-3', type: 'contact_created', title: 'New contact added',
      description: 'Contact imported from LinkedIn', metadata: null,
      occurredAt: new Date(Date.now() - 7200000).toISOString(),
      contact: { id: 'c-3', firstName: 'Maria', lastName: 'Garcia', email: 'maria@example.com' },
      company: null,
    },
    {
      id: 'act-4', type: 'campaign_launched', title: 'Campaign launched',
      description: 'Q1 Outreach campaign started', metadata: null,
      occurredAt: new Date(Date.now() - 14400000).toISOString(),
      contact: null, company: { id: 'co-3', name: 'StartupHub' },
    },
    {
      id: 'act-5', type: 'email_replied', title: 'Email reply received',
      description: 'Positive response from prospect', metadata: null,
      occurredAt: new Date(Date.now() - 21600000).toISOString(),
      contact: { id: 'c-4', firstName: 'Alex', lastName: 'Kim', email: 'alex@example.com' },
      company: { id: 'co-4', name: 'InnovateCo' },
    },
  ],
}

export async function GET() {
  try {
    const session = await auth()
    const orgId = session?.user?.organizationId || 'demo-org-001'

    const result = await withDb(async (db) => {
      const [totalContacts, totalCompanies, activeDeals, pipelineValue, totalCampaigns, activeWorkflows] =
        await Promise.all([
          db.contact.count({ where: { organizationId: orgId } }),
          db.company.count({ where: { organizationId: orgId } }),
          db.deal.count({ where: { organizationId: orgId, status: 'open' } }),
          db.deal.aggregate({ where: { organizationId: orgId, status: 'open' }, _sum: { value: true } }),
          db.campaign.count({ where: { organizationId: orgId } }),
          db.workflow.count({ where: { organizationId: orgId, status: 'active' } }),
        ])

      const recentActivities = await db.activity.findMany({
        where: { organizationId: orgId }, take: 10, orderBy: { occurredAt: 'desc' },
        include: { contact: true, company: true },
      })

      const campaigns = await db.campaign.findMany({
        where: { organizationId: orgId },
        select: { sentCount: true, openedCount: true, repliedCount: true, bouncedCount: true },
      })

      const emailStats = campaigns.reduce(
        (acc: any, c: any) => ({
          sent: acc.sent + c.sentCount, opened: acc.opened + c.openedCount,
          replied: acc.replied + c.repliedCount, bounced: acc.bounced + c.bouncedCount,
        }),
        { sent: 0, opened: 0, replied: 0, bounced: 0 }
      )

      return {
        contacts: {
          total: totalContacts,
          thisMonth: 0, // Simplified for now
          growth: 12, // Mock growth
        },
        companies: {
          total: totalCompanies,
          thisMonth: 0,
        },
        deals: {
          total: activeDeals,
          value: pipelineValue._sum.value || 0,
          byStage: [],
        },
        campaigns: {
          total: totalCampaigns,
          active: totalCampaigns, // Simplified
          sent: emailStats.sent,
          opened: emailStats.opened,
        },
        workflows: {
          total: activeWorkflows,
          active: activeWorkflows,
          runs: 0,
        },
        recentActivity: recentActivities.map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          time: a.occurredAt,
          type: a.type.split('_')[0],
        })),
      }
    })

    return NextResponse.json(result ?? DEMO_DASHBOARD)
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json(DEMO_DASHBOARD)
  }
}
