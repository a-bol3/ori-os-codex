import { Injectable, Logger } from '@nestjs/common';
import { ConnectorsService } from '../connectors.service';
import {
  EmailProvider,
  EmailMessage,
  EmailResult,
} from '../interfaces/provider.interface';
import { EmailProviderFactory } from '../factories/email-provider.factory';

@Injectable()
export class EmailFallbackStrategy {
  private readonly logger = new Logger(EmailFallbackStrategy.name);

  constructor(private readonly connectorsService: ConnectorsService) {}

  async sendWithFallback(
    organizationId: string,
    message: EmailMessage,
  ): Promise<EmailResult> {
    // 1. Get all email connectors for this organization
    const connectors = await this.connectorsService.findAll(organizationId);

    // Filter for email types (this could be improved by adding a category to the Connector model)
    const emailConnectors = connectors.filter((c) =>
      ['RESEND', 'SENDGRID', 'SES', 'MAILGUN'].includes(c.type.toUpperCase()),
    );

    if (emailConnectors.length === 0) {
      this.logger.error(
        `No email providers configured for organization: ${organizationId}`,
      );
      return {
        messageId: null,
        status: 'failed',
        error: 'No email providers configured',
      };
    }

    // 2. Try each provider until one succeeds
    for (const connector of emailConnectors) {
      try {
        this.logger.log(
          `Attempting to send email via ${connector.type} (Connector: ${connector.id})`,
        );

        // Get decrypted config
        const fullConnector = await this.connectorsService.findOne(
          connector.id,
          organizationId,
        );
        const provider = EmailProviderFactory.create(
          fullConnector.type,
          fullConnector.config,
        );

        const result = await provider.send(message);

        if (result.status === 'sent') {
          this.logger.log(`Email sent successfully via ${connector.type}`);
          return result;
        }

        this.logger.warn(`Provider ${connector.type} failed: ${result.error}`);
      } catch (error) {
        this.logger.error(
          `Error using provider ${connector.type}: ${error.message}`,
        );
      }
    }

    return {
      messageId: null,
      status: 'failed',
      error: 'All email providers failed',
    };
  }
}
