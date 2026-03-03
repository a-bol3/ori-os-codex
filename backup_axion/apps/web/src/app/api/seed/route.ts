export const dynamic = 'force-dynamic'
import { db, withDb } from '@/lib/db'
import { NextResponse } from 'next/server'

// Demo organization ID for seeded data
const DEMO_ORG_ID = 'demo-org-001'
const DEMO_USER_ID = 'demo-user-001'

async function seedDatabase() {
  // Create organization
  await db.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: {},
    create: {
      id: DEMO_ORG_ID,
      name: 'Demo Company',
      slug: 'demo-company',
      plan: 'professional',
      industry: 'Technology',
      size: '51-200',
      website: 'https://demo-company.com',
    },
  })

  // Create user
  await db.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: 'demo@ori-os.com',
      name: 'John Doe',
    },
  })

  // Create organization member
  await db.organizationMember.upsert({
    where: { id: 'member-001' },
    update: {},
    create: {
      id: 'member-001',
      organizationId: DEMO_ORG_ID,
      userId: DEMO_USER_ID,
      role: 'owner',
    },
  })

  // Create companies
  const companies = await Promise.all([
    db.company.upsert({
      where: { id: 'company-001' },
      update: {},
      create: {
        id: 'company-001',
        organizationId: DEMO_ORG_ID,
        name: 'TechCorp Inc.',
        domain: 'techcorp.com',
        website: 'https://techcorp.com',
        industry: 'Technology',
        size: '201-500',
        status: 'customer',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        linkedin: 'linkedin.com/company/techcorp',
        score: 92,
      },
    }),
    db.company.upsert({
      where: { id: 'company-002' },
      update: {},
      create: {
        id: 'company-002',
        organizationId: DEMO_ORG_ID,
        name: 'StartupXYZ',
        domain: 'startupxyz.io',
        website: 'https://startupxyz.io',
        industry: 'SaaS',
        size: '11-50',
        status: 'prospect',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        linkedin: 'linkedin.com/company/startupxyz',
        score: 87,
      },
    }),
    db.company.upsert({
      where: { id: 'company-003' },
      update: {},
      create: {
        id: 'company-003',
        organizationId: DEMO_ORG_ID,
        name: 'GrowthCo',
        domain: 'growthco.com',
        website: 'https://growthco.com',
        industry: 'Consulting',
        size: '51-200',
        status: 'qualified',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        linkedin: 'linkedin.com/company/growthco',
        score: 78,
      },
    }),
    db.company.upsert({
      where: { id: 'company-004' },
      update: {},
      create: {
        id: 'company-004',
        organizationId: DEMO_ORG_ID,
        name: 'InnovateLabs',
        domain: 'innovatelabs.ai',
        website: 'https://innovatelabs.ai',
        industry: 'AI/ML',
        size: '11-50',
        status: 'prospect',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        linkedin: 'linkedin.com/company/innovatelabs',
        score: 95,
      },
    }),
  ])

  // Create contacts
  const contacts = await Promise.all([
    db.contact.upsert({
      where: { id: 'contact-001' },
      update: {},
      create: {
        id: 'contact-001',
        organizationId: DEMO_ORG_ID,
        companyId: 'company-001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@techcorp.com',
        phone: '+1 (555) 123-4567',
        title: 'VP of Marketing',
        department: 'Marketing',
        seniority: 'executive',
        status: 'customer',
        source: 'linkedin',
        linkedin: 'linkedin.com/in/sarahjohnson',
        score: 92,
        emailValid: 'valid',
        gdprConsent: true,
      },
    }),
    db.contact.upsert({
      where: { id: 'contact-002' },
      update: {},
      create: {
        id: 'contact-002',
        organizationId: DEMO_ORG_ID,
        companyId: 'company-002',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael@startupxyz.io',
        phone: '+1 (555) 234-5678',
        title: 'CTO',
        department: 'Engineering',
        seniority: 'c-level',
        status: 'prospect',
        source: 'website',
        linkedin: 'linkedin.com/in/michaelchen',
        score: 87,
        emailValid: 'valid',
        gdprConsent: true,
      },
    }),
    db.contact.upsert({
      where: { id: 'contact-003' },
      update: {},
      create: {
        id: 'contact-003',
        organizationId: DEMO_ORG_ID,
        companyId: 'company-003',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily@growthco.com',
        phone: '+1 (555) 345-6789',
        title: 'Director of Operations',
        department: 'Operations',
        seniority: 'director',
        status: 'qualified',
        source: 'referral',
        linkedin: 'linkedin.com/in/emilydavis',
        score: 78,
        emailValid: 'valid',
        gdprConsent: true,
      },
    }),
    db.contact.upsert({
      where: { id: 'contact-004' },
      update: {},
      create: {
        id: 'contact-004',
        organizationId: DEMO_ORG_ID,
        companyId: 'company-004',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james@innovatelabs.ai',
        phone: '+1 (555) 456-7890',
        title: 'CEO',
        department: 'Executive',
        seniority: 'c-level',
        status: 'prospect',
        source: 'linkedin',
        linkedin: 'linkedin.com/in/jameswilson',
        score: 95,
        emailValid: 'valid',
        gdprConsent: true,
      },
    }),
  ])

  // Create deals
  await Promise.all([
    db.deal.upsert({
      where: { id: 'deal-001' },
      update: {},
      create: {
        id: 'deal-001',
        organizationId: DEMO_ORG_ID,
        companyId: 'company-001',
        primaryContactId: 'contact-001',
        name: 'Enterprise Plan - TechCorp',
        value: 75000,
        currency: 'USD',
        probability: 80,
        stage: 'negotiation',
        status: 'open',
        expectedCloseDate: new Date('2024-12-15'),
      },
    }),
    db.deal.upsert({
      where: { id: 'deal-002' },
      update: {},
      create: {
        id: 'deal-002',
        organizationId: DEMO_ORG_ID,
        companyId: 'company-002',
        primaryContactId: 'contact-002',
        name: 'Pro Plan - StartupXYZ',
        value: 25000,
        currency: 'USD',
        probability: 60,
        stage: 'proposal',
        status: 'open',
        expectedCloseDate: new Date('2025-01-05'),
      },
    }),
    db.deal.upsert({
      where: { id: 'deal-003' },
      update: {},
      create: {
        id: 'deal-003',
        organizationId: DEMO_ORG_ID,
        companyId: 'company-003',
        primaryContactId: 'contact-003',
        name: 'Custom Solution - GrowthCo',
        value: 120000,
        currency: 'USD',
        probability: 40,
        stage: 'qualification',
        status: 'open',
        expectedCloseDate: new Date('2025-02-01'),
      },
    }),
  ])

  // Create domains
  await Promise.all([
    db.domain.upsert({
      where: { id: 'domain-001' },
      update: {},
      create: {
        id: 'domain-001',
        organizationId: DEMO_ORG_ID,
        domain: 'techcorp.com',
        status: 'verified',
        spfStatus: 'verified',
        dkimStatus: 'verified',
        dmarcStatus: 'verified',
        reputationScore: 95,
        bounceRate: 1.2,
        spamRate: 0.1,
        warmupEnabled: true,
        warmupStatus: 'completed',
        dailyLimit: 500,
        monthlyLimit: 15000,
        verifiedAt: new Date('2024-01-01'),
      },
    }),
    db.domain.upsert({
      where: { id: 'domain-002' },
      update: {},
      create: {
        id: 'domain-002',
        organizationId: DEMO_ORG_ID,
        domain: 'company.io',
        status: 'verifying',
        spfStatus: 'verified',
        dkimStatus: 'pending',
        dmarcStatus: 'pending',
        warmupEnabled: false,
        dailyLimit: 100,
        monthlyLimit: 3000,
      },
    }),
  ])

  // Create campaigns
  await Promise.all([
    db.campaign.upsert({
      where: { id: 'campaign-001' },
      update: {},
      create: {
        id: 'campaign-001',
        organizationId: DEMO_ORG_ID,
        name: 'Q4 Product Launch',
        description: 'Announcing our new product features to existing customers',
        type: 'email',
        status: 'active',
        totalRecipients: 2450,
        sentCount: 2450,
        deliveredCount: 2380,
        openedCount: 1245,
        clickedCount: 389,
        repliedCount: 87,
        bouncedCount: 70,
        unsubscribedCount: 12,
        trackingEnabled: true,
        unsubscribeLink: true,
        startedAt: new Date('2024-10-01'),
      },
    }),
    db.campaign.upsert({
      where: { id: 'campaign-002' },
      update: {},
      create: {
        id: 'campaign-002',
        organizationId: DEMO_ORG_ID,
        name: 'Enterprise Outreach',
        description: 'Targeting enterprise accounts for Q4',
        type: 'email',
        status: 'paused',
        totalRecipients: 1200,
        sentCount: 1200,
        deliveredCount: 1150,
        openedCount: 542,
        clickedCount: 156,
        repliedCount: 34,
        bouncedCount: 50,
        trackingEnabled: true,
        unsubscribeLink: true,
        startedAt: new Date('2024-09-15'),
      },
    }),
  ])

  // Create workflows
  await Promise.all([
    db.workflow.upsert({
      where: { id: 'workflow-001' },
      update: {},
      create: {
        id: 'workflow-001',
        organizationId: DEMO_ORG_ID,
        name: 'Lead Enrichment Pipeline',
        description: 'Automatically enrich new leads with company and contact data',
        category: 'Lead Research',
        status: 'active',
        triggerType: 'event',
        triggerConfig: JSON.stringify({ event: 'contact.created' }),
        nodes: JSON.stringify([
          { id: 'n1', type: 'trigger', position: { x: 0, y: 0 }, data: {} },
          { id: 'n2', type: 'enrich', position: { x: 200, y: 0 }, data: { sources: ['linkedin', 'clearbit'] } },
          { id: 'n3', type: 'score', position: { x: 400, y: 0 }, data: {} },
        ]),
        edges: JSON.stringify([
          { id: 'e1', source: 'n1', target: 'n2' },
          { id: 'e2', source: 'n2', target: 'n3' },
        ]),
        errorHandling: 'continue',
        maxRetries: 3,
        runCount: 1247,
        successCount: 1225,
        errorCount: 22,
        lastRunAt: new Date(),
        isTemplate: false,
      },
    }),
    db.workflow.upsert({
      where: { id: 'workflow-002' },
      update: {},
      create: {
        id: 'workflow-002',
        organizationId: DEMO_ORG_ID,
        name: 'Welcome Email Sequence',
        description: 'Send personalized welcome emails to new signups',
        category: 'Outreach & Nurture',
        status: 'active',
        triggerType: 'webhook',
        triggerConfig: JSON.stringify({ endpoint: '/webhook/form-submission' }),
        nodes: JSON.stringify([
          { id: 'n1', type: 'trigger', position: { x: 0, y: 0 }, data: {} },
          { id: 'n2', type: 'delay', position: { x: 200, y: 0 }, data: { minutes: 5 } },
          { id: 'n3', type: 'sendEmail', position: { x: 400, y: 0 }, data: { templateId: 'welcome' } },
        ]),
        edges: JSON.stringify([
          { id: 'e1', source: 'n1', target: 'n2' },
          { id: 'e2', source: 'n2', target: 'n3' },
        ]),
        errorHandling: 'retry',
        maxRetries: 3,
        runCount: 892,
        successCount: 885,
        errorCount: 7,
        lastRunAt: new Date(Date.now() - 3600000),
        isTemplate: false,
      },
    }),
  ])

  // Create workspace pages for Knowledge Hub (parent pages first)
  await Promise.all([
    db.workspacePage.upsert({
      where: { id: 'page-001' },
      update: {},
      create: {
        id: 'page-001',
        organizationId: DEMO_ORG_ID,
        title: 'Getting Started',
        icon: '🚀',
        type: 'page',
        order: 0,
      },
    }),
    db.workspacePage.upsert({
      where: { id: 'page-002' },
      update: {},
      create: {
        id: 'page-002',
        organizationId: DEMO_ORG_ID,
        title: 'Projects',
        icon: '📁',
        type: 'page',
        order: 1,
      },
    }),
    db.workspacePage.upsert({
      where: { id: 'page-007' },
      update: {},
      create: {
        id: 'page-007',
        organizationId: DEMO_ORG_ID,
        title: 'Meeting Notes',
        icon: '📝',
        type: 'page',
        order: 2,
      },
    }),
    db.workspacePage.upsert({
      where: { id: 'page-008' },
      update: {},
      create: {
        id: 'page-008',
        organizationId: DEMO_ORG_ID,
        title: 'CRM Playbook',
        icon: '📖',
        type: 'page',
        order: 3,
      },
    }),
    db.workspacePage.upsert({
      where: { id: 'page-011' },
      update: {},
      create: {
        id: 'page-011',
        organizationId: DEMO_ORG_ID,
        title: 'Team Wiki',
        icon: '📚',
        type: 'page',
        order: 4,
      },
    }),
  ])

  // Create child pages (after parents exist)
  await Promise.all([
    db.workspacePage.upsert({
      where: { id: 'page-003' },
      update: {},
      create: {
        id: 'page-003',
        organizationId: DEMO_ORG_ID,
        parentId: 'page-001',
        title: 'Quick Start Guide',
        icon: '📄',
        type: 'page',
        order: 0,
      },
    }),
    db.workspacePage.upsert({
      where: { id: 'page-004' },
      update: {},
      create: {
        id: 'page-004',
        organizationId: DEMO_ORG_ID,
        parentId: 'page-001',
        title: 'Best Practices',
        icon: '💡',
        type: 'page',
        order: 1,
      },
    }),
    db.workspacePage.upsert({
      where: { id: 'page-005' },
      update: {},
      create: {
        id: 'page-005',
        organizationId: DEMO_ORG_ID,
        parentId: 'page-002',
        title: 'Q4 Launch',
        icon: '🚀',
        type: 'page',
        order: 0,
      },
    }),
    db.workspacePage.upsert({
      where: { id: 'page-006' },
      update: {},
      create: {
        id: 'page-006',
        organizationId: DEMO_ORG_ID,
        parentId: 'page-002',
        title: 'Product Roadmap',
        icon: '🗺️',
        type: 'page',
        order: 1,
      },
    }),
    db.workspacePage.upsert({
      where: { id: 'page-009' },
      update: {},
      create: {
        id: 'page-009',
        organizationId: DEMO_ORG_ID,
        parentId: 'page-008',
        title: 'Sales Scripts',
        icon: '🎭',
        type: 'page',
        order: 0,
      },
    }),
    db.workspacePage.upsert({
      where: { id: 'page-010' },
      update: {},
      create: {
        id: 'page-010',
        organizationId: DEMO_ORG_ID,
        parentId: 'page-008',
        title: 'Email Templates',
        icon: '📧',
        type: 'page',
        order: 1,
      },
    }),
  ])

  // Create blocks for Getting Started page
  await Promise.all([
    db.block.upsert({
      where: { id: 'block-001' },
      update: {},
      create: {
        id: 'block-001',
        pageId: 'page-001',
        type: 'heading1',
        content: JSON.stringify('Welcome to Ori-OS'),
        order: 0,
      },
    }),
    db.block.upsert({
      where: { id: 'block-002' },
      update: {},
      create: {
        id: 'block-002',
        pageId: 'page-001',
        type: 'text',
        content: JSON.stringify('This is your central workspace for notes, projects, and documentation. Create pages, databases, and collaborate with your team.'),
        order: 1,
      },
    }),
    db.block.upsert({
      where: { id: 'block-003' },
      update: {},
      create: {
        id: 'block-003',
        pageId: 'page-001',
        type: 'heading2',
        content: JSON.stringify('Quick Actions'),
        order: 2,
      },
    }),
    db.block.upsert({
      where: { id: 'block-004' },
      update: {},
      create: {
        id: 'block-004',
        pageId: 'page-001',
        type: 'todo',
        content: JSON.stringify('Set up your workspace'),
        properties: JSON.stringify({ checked: true }),
        order: 3,
      },
    }),
    db.block.upsert({
      where: { id: 'block-005' },
      update: {},
      create: {
        id: 'block-005',
        pageId: 'page-001',
        type: 'todo',
        content: JSON.stringify('Create your first project'),
        properties: JSON.stringify({ checked: false }),
        order: 4,
      },
    }),
    db.block.upsert({
      where: { id: 'block-006' },
      update: {},
      create: {
        id: 'block-006',
        pageId: 'page-001',
        type: 'todo',
        content: JSON.stringify('Invite team members'),
        properties: JSON.stringify({ checked: false }),
        order: 5,
      },
    }),
    db.block.upsert({
      where: { id: 'block-007' },
      update: {},
      create: {
        id: 'block-007',
        pageId: 'page-001',
        type: 'callout',
        content: JSON.stringify('Tip: Use / commands to quickly insert blocks and content'),
        properties: JSON.stringify({ icon: '💡' }),
        order: 6,
      },
    }),
  ])

  // Create a database for Project Tasks
  await db.knowledgeDatabase.upsert({
    where: { id: 'db-001' },
    update: {},
    create: {
      id: 'db-001',
      organizationId: DEMO_ORG_ID,
      pageId: 'page-005',
      name: 'Project Tasks',
      description: 'Track tasks for Q4 Launch',
      icon: '✅',
    },
  })

  // Create database properties
  await Promise.all([
    db.knowledgeProperty.upsert({
      where: { id: 'prop-001' },
      update: {},
      create: {
        id: 'prop-001',
        databaseId: 'db-001',
        name: 'Task',
        type: 'text',
        order: 0,
      },
    }),
    db.knowledgeProperty.upsert({
      where: { id: 'prop-002' },
      update: {},
      create: {
        id: 'prop-002',
        databaseId: 'db-001',
        name: 'Status',
        type: 'status',
        config: JSON.stringify({ options: ['To Do', 'In Progress', 'Done'] }),
        order: 1,
      },
    }),
    db.knowledgeProperty.upsert({
      where: { id: 'prop-003' },
      update: {},
      create: {
        id: 'prop-003',
        databaseId: 'db-001',
        name: 'Priority',
        type: 'select',
        config: JSON.stringify({ options: ['High', 'Medium', 'Low'] }),
        order: 2,
      },
    }),
    db.knowledgeProperty.upsert({
      where: { id: 'prop-004' },
      update: {},
      create: {
        id: 'prop-004',
        databaseId: 'db-001',
        name: 'Due Date',
        type: 'date',
        order: 3,
      },
    }),
  ])

  // Create database view
  await db.knowledgeView.upsert({
    where: { id: 'view-001' },
    update: {},
    create: {
      id: 'view-001',
      databaseId: 'db-001',
      name: 'All Tasks',
      type: 'table',
      isDefault: true,
    },
  })

  // Create database rows
  await Promise.all([
    db.knowledgeRow.upsert({
      where: { id: 'row-001' },
      update: {},
      create: {
        id: 'row-001',
        databaseId: 'db-001',
        values: JSON.stringify({ Task: 'Design landing page', Status: 'Done', Priority: 'High', 'Due Date': '2024-10-15' }),
        order: 0,
      },
    }),
    db.knowledgeRow.upsert({
      where: { id: 'row-002' },
      update: {},
      create: {
        id: 'row-002',
        databaseId: 'db-001',
        values: JSON.stringify({ Task: 'Write documentation', Status: 'In Progress', Priority: 'Medium', 'Due Date': '2024-10-20' }),
        order: 1,
      },
    }),
    db.knowledgeRow.upsert({
      where: { id: 'row-003' },
      update: {},
      create: {
        id: 'row-003',
        databaseId: 'db-001',
        values: JSON.stringify({ Task: 'Set up analytics', Status: 'To Do', Priority: 'Low', 'Due Date': '2024-10-25' }),
        order: 2,
      },
    }),
    db.knowledgeRow.upsert({
      where: { id: 'row-004' },
      update: {},
      create: {
        id: 'row-004',
        databaseId: 'db-001',
        values: JSON.stringify({ Task: 'Launch beta', Status: 'To Do', Priority: 'High', 'Due Date': '2024-11-01' }),
        order: 3,
      },
    }),
  ])

  // Create tasks
  await Promise.all([
    db.task.upsert({
      where: { id: 'task-001' },
      update: {},
      create: {
        id: 'task-001',
        organizationId: DEMO_ORG_ID,
        title: 'Follow up with TechStart Inc.',
        description: 'Send proposal and schedule demo call',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        contactId: 'contact-001',
      },
    }),
    db.task.upsert({
      where: { id: 'task-002' },
      update: {},
      create: {
        id: 'task-002',
        organizationId: DEMO_ORG_ID,
        title: 'Review campaign performance',
        description: 'Analyze Q4 campaign metrics and prepare report',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      },
    }),
    db.task.upsert({
      where: { id: 'task-003' },
      update: {},
      create: {
        id: 'task-003',
        organizationId: DEMO_ORG_ID,
        title: 'Prepare Q4 forecast report',
        description: 'Compile sales pipeline and revenue projections',
        status: 'pending',
        priority: 'low',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      },
    }),
    db.task.upsert({
      where: { id: 'task-004' },
      update: {},
      create: {
        id: 'task-004',
        organizationId: DEMO_ORG_ID,
        title: 'Team sync meeting',
        description: 'Weekly team sync to discuss pipeline and blockers',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 26 * 60 * 60 * 1000), // Tomorrow + 2 hours
      },
    }),
  ])

  // Create activities
  await Promise.all([
    db.activity.upsert({
      where: { id: 'activity-001' },
      update: {},
      create: {
        id: 'activity-001',
        organizationId: DEMO_ORG_ID,
        contactId: 'contact-001',
        companyId: 'company-001',
        dealId: 'deal-001',
        type: 'email_opened',
        title: 'Sarah Johnson opened your email',
        description: 'Subject: Partnership Opportunity',
        occurredAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
    }),
    db.activity.upsert({
      where: { id: 'activity-002' },
      update: {},
      create: {
        id: 'activity-002',
        organizationId: DEMO_ORG_ID,
        companyId: 'company-001',
        dealId: 'deal-001',
        type: 'deal_stage_changed',
        title: 'Deal moved to Negotiation',
        description: 'Enterprise Plan - TechCorp',
        occurredAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
    }),
    db.activity.upsert({
      where: { id: 'activity-003' },
      update: {},
      create: {
        id: 'activity-003',
        organizationId: DEMO_ORG_ID,
        contactId: 'contact-002',
        companyId: 'company-002',
        type: 'email_replied',
        title: 'New reply from Michael Chen',
        description: 'Re: Demo Request',
        occurredAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
    }),
    db.activity.upsert({
      where: { id: 'activity-004' },
      update: {},
      create: {
        id: 'activity-004',
        organizationId: DEMO_ORG_ID,
        type: 'workflow_completed',
        title: 'Workflow completed successfully',
        description: 'Lead Enrichment Pipeline',
        occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
  ])

  // Create email templates
  await Promise.all([
    db.emailTemplate.upsert({
      where: { id: 'template-001' },
      update: {},
      create: {
        id: 'template-001',
        organizationId: DEMO_ORG_ID,
        name: 'Introduction',
        description: 'First outreach email to new prospects',
        category: 'outreach',
        subject: 'Hi {{first_name}}, quick question about {{company_name}}',
        previewText: 'I came across your company and wanted to reach out...',
        bodyHtml: '<p>Hi {{first_name}},</p><p>I came across {{company_name}} and was impressed by your work in the industry.</p><p>I\'d love to learn more about your current challenges and see if there might be a fit.</p><p>Would you be open to a quick chat this week?</p><p>Best,<br>{{sender_name}}</p>',
        bodyText: 'Hi {{first_name}},\n\nI came across {{company_name}} and was impressed by your work in the industry.\n\nI\'d love to learn more about your current challenges and see if there might be a fit.\n\nWould you be open to a quick chat this week?\n\nBest,\n{{sender_name}}',
        useCount: 156,
      },
    }),
    db.emailTemplate.upsert({
      where: { id: 'template-002' },
      update: {},
      create: {
        id: 'template-002',
        organizationId: DEMO_ORG_ID,
        name: 'Follow-up',
        description: 'Follow up after no response',
        category: 'follow_up',
        subject: 'Re: Quick question about {{company_name}}',
        previewText: 'Just wanted to bump this to the top of your inbox...',
        bodyHtml: '<p>Hi {{first_name}},</p><p>Just wanted to bump this to the top of your inbox in case it got buried.</p><p>I\'d still love to connect and learn more about what you\'re working on at {{company_name}}.</p><p>Do you have 15 minutes this week for a quick chat?</p><p>Best,<br>{{sender_name}}</p>',
        bodyText: 'Hi {{first_name}},\n\nJust wanted to bump this to the top of your inbox in case it got buried.\n\nI\'d still love to connect and learn more about what you\'re working on at {{company_name}}.\n\nDo you have 15 minutes this week for a quick chat?\n\nBest,\n{{sender_name}}',
        useCount: 89,
      },
    }),
    db.emailTemplate.upsert({
      where: { id: 'template-003' },
      update: {},
      create: {
        id: 'template-003',
        organizationId: DEMO_ORG_ID,
        name: 'Demo Request',
        description: 'Request a product demo',
        category: 'demo',
        subject: 'Request for a demo of {{product_name}}',
        previewText: 'I\'d like to schedule a demo to see your product in action...',
        bodyHtml: '<p>Hi {{first_name}},</p><p>I\'d like to schedule a demo to see your product in action.</p><p>Our team is currently evaluating solutions in this space, and {{product_name}} looks like it could be a great fit for our needs.</p><p>Could we schedule a 30-minute call sometime next week?</p><p>Best regards,<br>{{sender_name}}</p>',
        bodyText: 'Hi {{first_name}},\n\nI\'d like to schedule a demo to see your product in action.\n\nOur team is currently evaluating solutions in this space, and {{product_name}} looks like it could be a great fit for our needs.\n\nCould we schedule a 30-minute call sometime next week?\n\nBest regards,\n{{sender_name}}',
        useCount: 45,
      },
    }),
    db.emailTemplate.upsert({
      where: { id: 'template-004' },
      update: {},
      create: {
        id: 'template-004',
        organizationId: DEMO_ORG_ID,
        name: 'Case Study',
        description: 'Share a relevant case study',
        category: 'follow_up',
        subject: 'How {{company_name}} achieved {{result}}',
        previewText: 'I thought you might be interested in this case study...',
        bodyHtml: '<p>Hi {{first_name}},</p><p>I thought you might be interested in how a similar company in your industry achieved significant results.</p><p>{{case_study_summary}}</p><p>Would you like me to share more details about how we might be able to help {{company_name}} achieve similar outcomes?</p><p>Best,<br>{{sender_name}}</p>',
        bodyText: 'Hi {{first_name}},\n\nI thought you might be interested in how a similar company in your industry achieved significant results.\n\n{{case_study_summary}}\n\nWould you like me to share more details about how we might be able to help {{company_name}} achieve similar outcomes?\n\nBest,\n{{sender_name}}',
        useCount: 32,
      },
    }),
  ])

  // Create compliance profiles
  await Promise.all([
    db.complianceProfile.upsert({
      where: { id: 'profile-001' },
      update: {},
      create: {
        id: 'profile-001',
        organizationId: DEMO_ORG_ID,
        name: 'EU-Strict',
        description: 'GDPR compliant with strict consent requirements',
        gdprEnabled: true,
        ccpaEnabled: false,
        contactRetentionDays: 30,
        activityRetentionDays: 90,
        requireConsent: true,
        isDefault: true,
      },
    }),
    db.complianceProfile.upsert({
      where: { id: 'profile-002' },
      update: {},
      create: {
        id: 'profile-002',
        organizationId: DEMO_ORG_ID,
        name: 'US-Standard',
        description: 'Standard US compliance with CCPA support',
        gdprEnabled: false,
        ccpaEnabled: true,
        contactRetentionDays: 90,
        activityRetentionDays: 365,
        requireConsent: false,
        isDefault: false,
      },
    }),
  ])

  // Create GDPR requests
  await Promise.all([
    db.gDPRRequest.upsert({
      where: { id: 'gdpr-001' },
      update: {},
      create: {
        id: 'gdpr-001',
        organizationId: DEMO_ORG_ID,
        type: 'export',
        contactEmail: 'john.doe@example.com',
        status: 'completed',
        requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    }),
    db.gDPRRequest.upsert({
      where: { id: 'gdpr-002' },
      update: {},
      create: {
        id: 'gdpr-002',
        organizationId: DEMO_ORG_ID,
        type: 'delete',
        contactEmail: 'jane.smith@example.com',
        status: 'processing',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    db.gDPRRequest.upsert({
      where: { id: 'gdpr-003' },
      update: {},
      create: {
        id: 'gdpr-003',
        organizationId: DEMO_ORG_ID,
        type: 'export',
        contactEmail: 'mike.wilson@example.com',
        status: 'pending',
        requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  // Create audit logs
  await Promise.all([
    db.auditLog.upsert({
      where: { id: 'audit-001' },
      update: {},
      create: {
        id: 'audit-001',
        organizationId: DEMO_ORG_ID,
        userId: DEMO_USER_ID,
        action: 'contact_exported',
        resource: 'Contact',
        resourceId: 'contact-001',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    db.auditLog.upsert({
      where: { id: 'audit-002' },
      update: {},
      create: {
        id: 'audit-002',
        organizationId: DEMO_ORG_ID,
        userId: DEMO_USER_ID,
        action: 'campaign_sent',
        resource: 'Campaign',
        resourceId: 'campaign-001',
        ipAddress: '192.168.1.2',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    }),
    db.auditLog.upsert({
      where: { id: 'audit-003' },
      update: {},
      create: {
        id: 'audit-003',
        organizationId: DEMO_ORG_ID,
        action: 'gdpr_delete_processed',
        resource: 'GDPRRequest',
        resourceId: 'gdpr-001',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    db.auditLog.upsert({
      where: { id: 'audit-004' },
      update: {},
      create: {
        id: 'audit-004',
        organizationId: DEMO_ORG_ID,
        userId: DEMO_USER_ID,
        action: 'domain_settings_updated',
        resource: 'Domain',
        resourceId: 'domain-001',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    }),
    db.auditLog.upsert({
      where: { id: 'audit-005' },
      update: {},
      create: {
        id: 'audit-005',
        organizationId: DEMO_ORG_ID,
        userId: DEMO_USER_ID,
        action: 'workflow_created',
        resource: 'Workflow',
        resourceId: 'workflow-001',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      },
    }),
  ])

  return { success: true, message: 'Database seeded successfully' }
}

export async function GET() {
  try {
    const result = await seedDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const result = await withDb(async () => {
      return await seedDatabase()
    })

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}

