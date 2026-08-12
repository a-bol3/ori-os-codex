import { Injectable, Logger } from '@nestjs/common';
import { fixtureMode, ProviderConfigurationError } from '@ori-os/core';

type ResendResponse = {
  id?: string;
  message?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resendApiKey = process.env.RESEND_API_KEY;
  private readonly fromEmail = process.env.FROM_EMAIL;

  async sendEmail(to: string, subject: string, content: string) {
    if (!this.resendApiKey) {
      if (!fixtureMode('ENABLE_EMAIL_FIXTURES')) {
        throw new ProviderConfigurationError(
          'Resend',
          'RESEND_API_KEY is not configured; configure a real email provider before sending.',
        );
      }

      this.logger.warn('Resend fixture mode enabled (development/test only)');
      this.logger.debug(
        `[Simulated Email Outbound] To: ${to}\nSubject: ${subject}\nContent: ${content.substring(0, 50)}...`,
      );
      return { success: true, simulated: true };
    }

    if (!this.fromEmail) {
      throw new Error('FROM_EMAIL is required to send email');
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.resendApiKey}`,
        },
        body: JSON.stringify({
          from: `ORI-OS <${this.fromEmail}>`,
          to: [to],
          subject,
          html: content,
        }),
      });

      const data = (await response.json()) as ResendResponse;
      if (!response.ok) {
        throw new Error(data.message || 'Resend API error');
      }

      this.logger.log(`Email sent successfully to ${to}`);
      return { success: true, id: data.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email: ${message}`);
      return { success: false, error: message };
    }
  }

  async sendSequenceEmail(to: string, templateName: string, content: string) {
    return this.sendEmail(to, `Follow-up: ${templateName}`, content);
  }
}
