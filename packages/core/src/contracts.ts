/** Shared contracts used by ORI products and integration adapters. */

export type ProviderKind = 'email' | 'ai' | 'storage' | 'payments' | 'enrichment' | 'other';

export interface Provider {
  getType(): string;
  verify(): Promise<boolean>;
}

export interface EmailMessage {
  from: { name: string; email: string };
  to: { name?: string; email: string }[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: unknown[];
}

export interface EmailResult {
  messageId: string | null;
  status: 'sent' | 'failed' | 'queued';
  error?: string;
}

export interface EmailProvider extends Provider {
  send(message: EmailMessage): Promise<EmailResult>;
  sendBulk?(messages: EmailMessage[]): Promise<EmailResult[]>;
}

export interface StorageProvider extends Provider {
  putObject(
    bucket: string,
    key: string,
    data: Buffer,
    contentType?: string,
  ): Promise<void>;
  getObject(bucket: string, key: string): Promise<Buffer>;
  getSignedUrl(bucket: string, key: string, expiresIn: number): Promise<string>;
  deleteObject(bucket: string, key: string): Promise<void>;
}

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
}

export interface AIProvider extends Provider {
  generateText(prompt: string, options?: GenerateOptions): Promise<string>;
  analyzeSentiment?(text: string): Promise<'positive' | 'neutral' | 'negative'>;
}

export interface NotificationProvider extends Provider {
  sendNotification(target: string, message: unknown): Promise<void>;
}

export type IntegrationStatus =
  | 'healthy'
  | 'unhealthy'
  | 'not_configured'
  | 'unsupported'
  | 'disabled';

export interface IntegrationHealth {
  provider: string;
  kind: ProviderKind;
  status: IntegrationStatus;
  checkedAt: string;
  message?: string;
  lastVerifiedAt?: string;
}

export interface AuditEvent {
  organizationId: string;
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
}

export type DataSubjectRequestType = 'export' | 'delete' | 'anonymize';
export type DataSubjectRequestStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DataSubjectRequest {
  id: string;
  organizationId: string;
  subjectType: 'contact' | 'user';
  subjectId: string;
  type: DataSubjectRequestType;
  status: DataSubjectRequestStatus;
  requestedBy?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface MetricDefinition {
  key: string;
  label: string;
  source: string;
  window: string;
  timezone: string;
  numerator?: string;
  denominator?: string;
}

export interface WorkspaceFeatureFlags {
  aiEnabled: boolean;
  emailEnabled: boolean;
  testBenchEnabled: boolean;
  externalPiiProcessingEnabled: boolean;
}
