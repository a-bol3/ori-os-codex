import * as sgMail from '@sendgrid/mail';
import {
  EmailProvider,
  EmailMessage,
  EmailResult,
} from '../../interfaces/provider.interface';

export class SendGridProvider implements EmailProvider {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  getType(): string {
    return 'SENDGRID';
  }

  async verify(): Promise<boolean> {
    try {
      // SendGrid doesn't have a simple connection test, but we can verify by retrieving account data
      // For now, we'll assume the API key is valid if set correctly
      // In a real scenario, we might call a lightweight GET endpoint
      return true;
    } catch (error) {
      console.error('[SendGridProvider] Verification failed:', error.message);
      return false;
    }
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const [response] = await sgMail.send({
        to: message.to.map((t) =>
          t.name ? { name: t.name, email: t.email } : t.email,
        ),
        from: { name: message.from.name, email: message.from.email },
        subject: message.subject,
        html: message.html,
        text: message.text || '',
        replyTo: message.replyTo,
      });

      return {
        messageId: response.headers['x-message-id'] || null,
        status:
          response.statusCode >= 200 && response.statusCode < 300
            ? 'sent'
            : 'failed',
      };
    } catch (error) {
      return {
        messageId: null,
        status: 'failed',
        error: error.response?.body?.errors?.[0]?.message || error.message,
      };
    }
  }
}
