import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { CreateDomainDto, UpdateDomainDto } from './dto/domain.dto';
import { CreateMailboxDto, UpdateMailboxDto } from './dto/mailbox.dto';

@Injectable()
export class DeliverabilityService {
  constructor(private prisma: PrismaService) {}

  async createDomain(orgId: string, dto: CreateDomainDto) {
    return (this.prisma as any).domain.create({
      data: {
        ...dto,
        organizationId: orgId,
      },
    });
  }

  async getDomains(orgId: string) {
    return (this.prisma as any).domain.findMany({
      where: { organizationId: orgId },
      include: { mailboxes: true },
    });
  }

  async verifyDns(domainId: string) {
    const domain = await (this.prisma as any).domain.findUnique({
      where: { id: domainId },
    });
    if (!domain) throw new NotFoundException('Domain not found');

    // Real DNS checks using node:dns
    const dns = require('dns').promises;
    let spfStatus = false;
    let dmarcStatus = false;

    try {
      const txtRecords = await dns.resolveTxt(domain.domain);
      const flattened = txtRecords.flat();
      spfStatus = flattened.some((r: string) => r.includes('v=spf1'));

      try {
        const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain.domain}`);
        dmarcStatus = dmarcRecords
          .flat()
          .some((r: string) => r.includes('v=DMARC1'));
      } catch (e) {
        // _dmarc record might not exist
      }
    } catch (e) {
      // Domain might not exist or have TXT records
    }

    return (this.prisma as any).domain.update({
      where: { id: domainId },
      data: {
        spfStatus,
        dkimStatus: false, // DKIM check usually needs more complex logic (selector matching)
        dmarcStatus,
        reputationStatus: spfStatus && dmarcStatus ? 'GOOD' : 'WARNING',
      },
    });
  }

  async createMailbox(orgId: string, dto: CreateMailboxDto) {
    return (this.prisma as any).mailbox.create({
      data: {
        ...dto,
        organizationId: orgId,
      },
    });
  }

  async getMailboxes(orgId: string) {
    return (this.prisma as any).mailbox.findMany({
      where: { organizationId: orgId },
      include: { domain: true },
    });
  }

  async updateMailbox(id: string, dto: UpdateMailboxDto) {
    return (this.prisma as any).mailbox.update({
      where: { id },
      data: dto,
    });
  }
}
