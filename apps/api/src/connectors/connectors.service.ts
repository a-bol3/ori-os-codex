import {  Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { IntegrationHealth } from '@ori-os/core';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class ConnectorsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EncryptionService) private readonly encryptionService: EncryptionService,
  ) {}

  async create(
    organizationId: string,
    data: { type: string; label: string; config: any },
  ) {
    const encryptedData = this.encryptionService.encrypt(
      JSON.stringify(data.config),
    );

    return (this.prisma as any).connector.create({
      data: {
        organizationId,
        type: data.type,
        label: data.label,
        encryptedData,
      },
    });
  }

  async findAll(organizationId: string) {
    return (this.prisma as any).connector.findMany({
      where: { organizationId },
      select: {
        id: true,
        organizationId: true,
        type: true,
        label: true,
        status: true,
        lastVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const connector = await this.findRaw(id, organizationId);

    return {
      id: connector.id,
      organizationId: connector.organizationId,
      type: connector.type,
      label: connector.label,
      status: connector.status,
      lastVerifiedAt: connector.lastVerifiedAt,
      createdAt: connector.createdAt,
      updatedAt: connector.updatedAt,
      hasConfig: Boolean(connector.encryptedData),
    };
  }

  /** Internal-only accessor. Never return this object directly from a controller. */
  async getForProvider(id: string, organizationId: string) {
    const connector = await this.findRaw(id, organizationId);

    return {
      ...connector,
      config: JSON.parse(
        this.encryptionService.decrypt(connector.encryptedData),
      ),
    };
  }

  private async findRaw(id: string, organizationId: string) {
    const connector = await (this.prisma as any).connector.findFirst({
      where: { id, organizationId },
    });

    if (!connector) {
      throw new NotFoundException('Connector not found');
    }

    return connector;
  }

  async update(
    id: string,
    organizationId: string,
    data: { label?: string; config?: any; status?: string },
  ) {
    const updateData: any = {};

    if (data.label) updateData.label = data.label;
    if (data.status) updateData.status = data.status;
    if (data.config) {
      updateData.encryptedData = this.encryptionService.encrypt(
        JSON.stringify(data.config),
      );
    }

    const connector = await (this.prisma as any).connector.findFirst({
      where: { id, organizationId },
    });

    if (!connector) {
      throw new NotFoundException('Connector not found');
    }

    return (this.prisma as any).connector.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, organizationId: string) {
    const connector = await (this.prisma as any).connector.findFirst({
      where: { id, organizationId },
    });

    if (!connector) {
      throw new NotFoundException('Connector not found');
    }

    return (this.prisma as any).connector.delete({
      where: { id },
    });
  }

  async testConnection(id: string, organizationId: string): Promise<IntegrationHealth> {
    const checkedAt = new Date().toISOString();

    try {
      const connector = await this.getForProvider(id, organizationId);
      const config = connector.config as Record<string, unknown>;
      const configured = Object.values(config).some(
        (value) => typeof value === 'string' && value.trim().length > 0,
      );

      return {
        provider: connector.type,
        kind: connector.type.toLowerCase().includes('email') ||
          ['RESEND', 'SENDGRID', 'SES', 'MAILGUN'].includes(connector.type.toUpperCase())
          ? 'email'
          : connector.type.toLowerCase().includes('storage') || ['S3', 'LOCAL'].includes(connector.type.toUpperCase())
            ? 'storage'
            : connector.type.toLowerCase().includes('ai') || ['OPENAI', 'ANTHROPIC'].includes(connector.type.toUpperCase())
              ? 'ai'
              : 'other',
        status: configured ? 'healthy' : 'not_configured',
        checkedAt,
        message: configured
          ? 'Connector configuration is present. Provider connectivity is verified at send time.'
          : 'Connector exists but has no usable configuration.',
      };
    } catch (error) {
      return {
        provider: 'unknown',
        kind: 'other',
        status: 'unhealthy',
        checkedAt,
        message: error instanceof Error ? error.message : 'Connector health check failed',
      };
    }
  }
}
