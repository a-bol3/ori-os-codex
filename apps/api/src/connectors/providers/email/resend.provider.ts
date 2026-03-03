import { Resend } from 'resend';
import {
  EmailProvider,
  EmailMessage,
  EmailResult,
} from '../../interfaces/provider.interface';

export class ResendProvider implements EmailProvider {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  getType(): string {
    return 'RESEND';
  }

  async verify(): Promise<boolean> {
    try {
      // Resend doesn't have a direct ping, but we can list API keys to verify
      await this.client.apiKeys.list();
      return true;
    } catch (error) {
      console.error('[ResendProvider] Verification failed:', error.message);
      return false;
    }
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const { data, error } = await this.client.emails.send({
        from: `${message.from.name} <${message.from.email}>`,
        to: message.to.map((t) => t.email),
        subject: message.subject,
        html: message.html,
        text: message.text || '',
        replyTo: message.replyTo,
      });

      if (error) {
        return { messageId: null, status: 'failed', error: error.message };
      }

      return { messageId: data?.id || null, status: 'sent' };
    } catch (error) {
      return { messageId: null, status: 'failed', error: error.message };
    }
  }
}
