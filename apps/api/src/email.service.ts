import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resendApiKey = process.env.RESEND_API_KEY;
  private readonly fromEmail = process.env.FROM_EMAIL || 'outreach@ori-os.com';

  async sendEmail(to: string, subject: string, content: string) {
    if (!this.resendApiKey || this.resendApiKey.includes('dummy')) {
      this.logger.warn('Resend Simulation Mode (Dummy Key)');
      this.logger.debug(
        `[Simulated Email Outbound] To: ${to}\nSubject: ${subject}\nContent: ${content.substring(0, 50)}...`,
      );
      return { success: true, simulated: true };
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Resend API error');
      }

      this.logger.log(`Email sent successfully to ${to}`);
      return { success: true, id: data.id };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendSequenceEmail(to: string, templateName: string, content: string) {
    return this.sendEmail(to, `Follow-up: ${templateName}`, content);
  }
}
