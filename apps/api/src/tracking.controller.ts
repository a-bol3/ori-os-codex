import { BadRequestException, Controller, Get, Inject, Param, Res } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { Response } from 'express';
import {
  decodeOpenTrackingToken,
  OpenTrackingTokenPayload,
} from '@ori-os/core';

const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
  'base64',
);

@Controller('tracking')
export class TrackingController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get('open/:token.gif')
  async openPixel(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    let payload: OpenTrackingTokenPayload | null = null;

    try {
      payload = this.decodeToken(token);
      await this.recordOpen(payload);
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        // Keep the pixel resilient: never let tracking break the mail client.
        // Invalid tokens simply return the image without mutating state.
      }
    }

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', TRANSPARENT_GIF.length);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.status(200).end(TRANSPARENT_GIF);
  }

  private async recordOpen(payload: OpenTrackingTokenPayload) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        id: payload.contactId,
        organizationId: payload.organizationId,
      },
      select: { id: true },
    });

    if (!contact) {
      throw new BadRequestException('Invalid open tracking token');
    }

    const existingOpen = await this.prisma.emailEvent.findFirst({
      where: {
        campaignId: payload.campaignId,
        contactId: payload.contactId,
        eventType: 'OPENED',
      },
      select: { id: true },
    });

    if (!existingOpen) {
      await this.prisma.emailEvent.create({
        data: {
          campaignId: payload.campaignId ?? null,
          contactId: payload.contactId,
          eventType: 'OPENED',
          rawPayloadJson: {
            source: 'tracking-pixel',
          },
        },
      });
    }

    if (payload.campaignId) {
      await this.prisma.campaignRecipient.updateMany({
        where: {
          campaignId: payload.campaignId,
          contactId: payload.contactId,
        },
        data: {
          lastEventAt: new Date(),
        },
      });
    }
  }

  private decodeToken(token: string): OpenTrackingTokenPayload {
    const secret =
      process.env.OPEN_TRACKING_TOKEN_SECRET ??
      process.env.UNSUBSCRIBE_TOKEN_SECRET ??
      process.env.JWT_SECRET;

    if (!secret) {
      throw new BadRequestException('Open tracking token secret is not configured');
    }

    return decodeOpenTrackingToken(token, secret);
  }
}
