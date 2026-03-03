import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class ConnectorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const connector = await (this.prisma as any).connector.findFirst({
      where: { id, organizationId },
    });

    if (!connector) {
      throw new NotFoundException('Connector not found');
    }

    return {
      ...connector,
      config: JSON.parse(
        this.encryptionService.decrypt(connector.encryptedData),
      ),
    };
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

  async testConnection(id: string, organizationId: string): Promise<boolean> {
    // This will be implemented per provider in future phases
    // For now, it just returns true if connector exists
    const connector = await this.findOne(id, organizationId);
    return !!connector;
  }
}
