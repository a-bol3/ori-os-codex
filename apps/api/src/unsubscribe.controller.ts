import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';

@Controller('unsubscribe')
export class UnsubscribeController {
  constructor(private prisma: PrismaService) {}

  @Get(':token')
  async unsubscribePage(@Param('token') token: string) {
    // In a real implementation, decode the token to get contact info
    return {
      message: 'Unsubscribe page',
      token,
    };
  }

  @Post()
  async unsubscribe(
    @Body('email') email: string,
    @Body('campaignId') campaignId?: string,
  ) {
    if (!email) {
      throw new Error('Email is required');
    }

    // Mark contact as unsubscribed globally or for specific campaign
    const contact = await (this.prisma as any).contact.findFirst({
      where: { email },
    });

    if (contact) {
      await (this.prisma as any).contact.update({
        where: { id: contact.id },
        data: {
          // Add unsubscribed field to schema if needed
          // For now, we'll use a custom field or metadata
          metadata: {
            ...(contact.metadata || {}),
            unsubscribed: true,
            unsubscribedAt: new Date().toISOString(),
            unsubscribedCampaign: campaignId,
          },
        },
      });
    }

    return {
      success: true,
      message: 'You have been successfully unsubscribed.',
    };
  }

  @Post('resubscribe')
  async resubscribe(@Body('email') email: string) {
    if (!email) {
      throw new Error('Email is required');
    }

    const contact = await (this.prisma as any).contact.findFirst({
      where: { email },
    });

    if (contact) {
      await (this.prisma as any).contact.update({
        where: { id: contact.id },
        data: {
          metadata: {
            ...(contact.metadata || {}),
            unsubscribed: false,
            resubscribedAt: new Date().toISOString(),
          },
        },
      });
    }

    return {
      success: true,
      message: 'You have been successfully resubscribed.',
    };
  }
}
