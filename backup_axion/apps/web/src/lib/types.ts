// ============================================
// Core Entity Types
// ============================================

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  website?: string
  industry?: string
  size?: string
  plan: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  emailVerified?: Date
  twoFactorEnabled: boolean
  timezone: string
  locale: string
  theme: string
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'manager' | 'operator' | 'viewer'
  joinedAt: Date
}

// ============================================
// CRM Types
// ============================================

export interface Company {
  id: string
  organizationId: string
  externalId?: string
  name: string
  domain?: string
  website?: string
  logo?: string
  description?: string
  industry?: string
  size?: string
  revenue?: string
  type?: string
  status: 'prospect' | 'qualified' | 'customer' | 'churned'
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  score?: number
  enrichmentStatus?: string
  customFields?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Contact {
  id: string
  organizationId: string
  companyId?: string
  externalId?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  image?: string
  title?: string
  department?: string
  seniority?: string
  linkedin?: string
  twitter?: string
  status: 'lead' | 'prospect' | 'qualified' | 'customer' | 'churned'
  source?: string
  lastContactedAt?: Date
  responseCount: number
  openCount: number
  clickCount: number
  emailOptOut: boolean
  emailBounced: boolean
  phoneOptOut: boolean
  score?: number
  emailValid?: 'valid' | 'invalid' | 'risky' | 'unknown'
  gdprConsent: boolean
  customFields?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Deal {
  id: string
  organizationId: string
  companyId?: string
  primaryContactId?: string
  name: string
  value?: number
  currency: string
  probability?: number
  stage: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  status: 'open' | 'won' | 'lost'
  expectedCloseDate?: Date
  actualCloseDate?: Date
  lostReason?: string
  customFields?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  id: string
  organizationId: string
  companyId?: string
  contactId?: string
  dealId?: string
  createdById?: string
  type: 'email_sent' | 'email_opened' | 'email_clicked' | 'email_bounced' | 'call' | 'meeting' | 'note' | 'task_completed' | 'deal_stage_changed'
  title?: string
  description?: string
  metadata?: Record<string, unknown>
  occurredAt: Date
  createdAt: Date
}

export interface Task {
  id: string
  organizationId: string
  assigneeId?: string
  createdById?: string
  contactId?: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: Date
  completedAt?: Date
  recurring: boolean
  recurrenceRule?: string
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string
  organizationId: string
  companyId?: string
  contactId?: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Segment {
  id: string
  organizationId: string
  name: string
  description?: string
  filters: Record<string, unknown>
  isDynamic: boolean
  contactCount: number
  lastCalculatedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Campaign Types
// ============================================

export interface Campaign {
  id: string
  organizationId: string
  segmentId?: string
  name: string
  description?: string
  type: 'email' | 'linkedin' | 'multi_channel'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  scheduledAt?: Date
  startedAt?: Date
  completedAt?: Date
  totalRecipients: number
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  repliedCount: number
  bouncedCount: number
  unsubscribedCount: number
  trackingEnabled: boolean
  unsubscribeLink: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SequenceStep {
  id: string
  campaignId: string
  order: number
  type: 'email' | 'linkedin_connect' | 'linkedin_message' | 'task' | 'delay'
  delayDays: number
  delayHours: number
  subject?: string
  previewText?: string
  bodyHtml?: string
  bodyText?: string
  templateId?: string
  linkedinMessageType?: string
  linkedinMessage?: string
  taskTitle?: string
  taskDescription?: string
  sentCount: number
  openedCount: number
  clickedCount: number
  repliedCount: number
  createdAt: Date
  updatedAt: Date
}

export interface EmailTemplate {
  id: string
  organizationId: string
  name: string
  description?: string
  category?: string
  subject: string
  previewText?: string
  bodyHtml: string
  bodyText?: string
  variables?: string[]
  useCount: number
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Workflow Types
// ============================================

export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface Workflow {
  id: string
  organizationId: string
  name: string
  description?: string
  category?: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  triggerType: 'manual' | 'webhook' | 'schedule' | 'event'
  triggerConfig?: Record<string, unknown>
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  errorHandling: 'stop' | 'continue' | 'retry'
  maxRetries: number
  runCount: number
  successCount: number
  errorCount: number
  lastRunAt?: Date
  isTemplate: boolean
  templateCategory?: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowRun {
  id: string
  organizationId: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  triggerType: string
  triggerData?: Record<string, unknown>
  startedAt?: Date
  completedAt?: Date
  duration?: number
  output?: Record<string, unknown>
  error?: string
  createdAt: Date
}

// ============================================
// Domain & Deliverability Types
// ============================================

export interface Domain {
  id: string
  organizationId: string
  domain: string
  status: 'pending' | 'verifying' | 'verified' | 'failed'
  spfRecord?: string
  spfStatus: 'pending' | 'verified' | 'failed'
  dkimRecord?: string
  dkimStatus: 'pending' | 'verified' | 'failed'
  dmarcRecord?: string
  dmarcStatus: 'pending' | 'verified' | 'failed'
  mxRecords?: string[]
  reputationScore?: number
  bounceRate?: number
  spamRate?: number
  warmupEnabled: boolean
  warmupStatus?: 'pending' | 'in_progress' | 'completed'
  dailyLimit: number
  monthlyLimit: number
  verifiedAt?: Date
  lastAuditAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Mailbox {
  id: string
  organizationId: string
  domainId: string
  email: string
  displayName?: string
  provider: 'gmail' | 'outlook' | 'smtp' | 'imap'
  status: 'pending' | 'connected' | 'error'
  dailySent: number
  dailyLimit: number
  warmupEnabled: boolean
  warmupProgress: number
  lastSyncAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Knowledge Types
// ============================================

export interface WorkspacePage {
  id: string
  organizationId: string
  parentId?: string
  title: string
  icon?: string
  coverImage?: string
  content?: unknown
  type: 'page' | 'database' | 'task' | 'project'
  fullWidth: boolean
  isPublic: boolean
  order: number
  isArchived: boolean
  archivedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Block {
  id: string
  pageId: string
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'bulleted_list' | 'numbered_list' | 'todo' | 'toggle' | 'callout' | 'quote' | 'divider' | 'code' | 'image' | 'file' | 'bookmark' | 'embed' | 'database'
  content?: unknown
  properties?: Record<string, unknown>
  parentId?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeDatabase {
  id: string
  organizationId: string
  pageId: string
  name: string
  description?: string
  icon?: string
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeProperty {
  id: string
  databaseId: string
  name: string
  type: 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'person' | 'status' | 'relation' | 'rollup' | 'formula' | 'files' | 'url' | 'email' | 'phone' | 'checkbox'
  config?: Record<string, unknown>
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeView {
  id: string
  databaseId: string
  name: string
  type: 'table' | 'board' | 'calendar' | 'timeline' | 'gallery' | 'list'
  filters?: Record<string, unknown>
  sorts?: Record<string, unknown>
  groupBy?: string
  visibleProperties?: string[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeRow {
  id: string
  databaseId: string
  values: Record<string, unknown>
  order: number
  linkedContactId?: string
  linkedCompanyId?: string
  linkedDealId?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Analytics Types
// ============================================

export interface DashboardStats {
  totalContacts: number
  totalCompanies: number
  activeDeals: number
  pipelineValue: number
  emailsSent: number
  openRate: number
  replyRate: number
  bounceRate: number
  activeCampaigns: number
  activeWorkflows: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface FunnelStep {
  name: string
  value: number
  percentage: number
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ValidationError {
  field: string
  message: string
}
