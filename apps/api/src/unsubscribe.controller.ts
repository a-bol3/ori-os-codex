import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import {
  decodeUnsubscribeToken,
  UnsubscribeTokenPayload,
} from './common/unsubscribe-token';

type UnsubscribePreview = {
  id: string;
  organizationId: string;
  email: string;
  optOut: boolean;
};

@Controller('unsubscribe')
export class UnsubscribeController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get(':token')
  async unsubscribePage(@Param('token') token: string) {
    const payload = this.decodeToken(token);
    const contact = await this.getContactOrThrow(payload);

    return {
      message: 'Unsubscribe request is valid.',
      contact: this.maskEmail(contact.email),
      unsubscribed: contact.optOut,
      campaignId: payload.campaignId ?? null,
    };
  }

  @Post()
  async unsubscribe(@Body('token') token: string) {
    const payload = this.decodeToken(token);
    const contact = await this.getContactOrThrow(payload);

    await this.prisma.contact.update({
      where: { id: contact.id },
      data: {
        optOut: true,
        optOutTimestamp: new Date(),
      },
    });

    if (payload.campaignId) {
      await this.prisma.campaignRecipient.updateMany({
        where: {
          campaignId: payload.campaignId,
          contactId: contact.id,
        },
        data: {
          status: 'OPTED_OUT',
        },
      });
    }

    return {
      success: true,
      message: 'You have been successfully unsubscribed.',
    };
  }

  @Post('resubscribe')
  async resubscribe(@Body('token') token: string) {
    const payload = this.decodeToken(token);
    const contact = await this.getContactOrThrow(payload);

    await this.prisma.contact.update({
      where: { id: contact.id },
      data: {
        optOut: false,
      },
    });

    return {
      success: true,
      message: 'You have been successfully resubscribed.',
    };
  }

  private async getContactOrThrow(
    payload: UnsubscribeTokenPayload,
  ): Promise<UnsubscribePreview> {
    const contact = await this.prisma.contact.findFirst({
      where: {
        id: payload.contactId,
        organizationId: payload.organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        email: true,
        optOut: true,
      },
    });

    if (!contact) {
      throw new BadRequestException('Invalid unsubscribe token');
    }

    return contact;
  }

  private decodeToken(token: string): UnsubscribeTokenPayload {
    return decodeUnsubscribeToken(token, this.getTokenSecret());
  }

  private getTokenSecret(): string {
    const secret =
      process.env.UNSUBSCRIBE_TOKEN_SECRET ?? process.env.JWT_SECRET;

    if (!secret) {
      throw new BadRequestException(
        'Unsubscribe token secret is not configured',
      );
    }

    return secret;
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');

    if (!localPart || !domain) {
      return 'hidden';
    }

    if (localPart.length <= 2) {
      return `${localPart[0] ?? '*'}*@${domain}`;
    }

    return `${localPart.slice(0, 2)}***@${domain}`;
  }
}
