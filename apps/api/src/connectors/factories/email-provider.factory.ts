import { EmailProvider } from '../interfaces/provider.interface';
import { ResendProvider } from '../providers/email/resend.provider';
import { SendGridProvider } from '../providers/email/sendgrid.provider';

export class EmailProviderFactory {
  static create(type: string, config: any): EmailProvider {
    switch (type.toUpperCase()) {
      case 'RESEND':
        return new ResendProvider(config.apiKey);
      case 'SENDGRID':
        return new SendGridProvider(config.apiKey);
      default:
        throw new Error(`Unsupported email provider type: ${type}`);
    }
  }
}
