export interface Provider {
  getType(): string;
  verify(): Promise<boolean>;
}

// === Email Provider ===

export interface EmailMessage {
  from: { name: string; email: string };
  to: { name?: string; email: string }[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: any[];
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

// === Storage Provider ===

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

// === AI Provider ===

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

// === Notification Provider ===

export interface NotificationProvider extends Provider {
  sendNotification(target: string, message: any): Promise<void>;
}
