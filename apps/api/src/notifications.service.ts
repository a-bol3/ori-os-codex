import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  async sendSlackNotification(message: string, channel?: string) {
    if (!this.slackWebhookUrl || this.slackWebhookUrl.includes('DUMMY')) {
      this.logger.warn('Slack Simulation Mode (Dummy Webhook)');
      this.logger.debug(
        `[Simulated Slack Notification] Channel: ${channel || '#general'}\nMessage: ${message}`,
      );
      return;
    }

    try {
      const response = await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          channel: channel || '#general',
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }

      this.logger.log('Slack notification sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send Slack notification: ${error.message}`);
    }
  }

  async notifyNewDeal(dealName: string, value: number, company: string) {
    const message = `🚀 *New Deal Opportunity!* \n*Deal:* ${dealName}\n*Value:* $${value.toLocaleString()}\n*Company:* ${company}`;
    await this.sendSlackNotification(message);
  }

  async notifyLeadEnriched(companyName: string, domain: string) {
    const message = `✨ *Lead Enriched:* ${companyName} (${domain})`;
    await this.sendSlackNotification(message);
  }
}
