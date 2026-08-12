import {  Injectable, NotFoundException, Inject } from '@nestjs/common';
import { promises as dns } from 'node:dns';
import { PrismaService } from '@ori-os/db/nestjs';
import { CreateDomainDto } from './dto/domain.dto';
import { CreateMailboxDto, UpdateMailboxDto } from './dto/mailbox.dto';

@Injectable()
export class DeliverabilityService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async createDomain(orgId: string, dto: CreateDomainDto) {
    return this.prisma.domain.create({
      data: {
        ...dto,
        organizationId: orgId,
      },
    });
  }

  async getDomains(orgId: string) {
    return this.prisma.domain.findMany({
      where: { organizationId: orgId },
      include: { mailboxes: true },
    });
  }

  async verifyDns(orgId: string, domainId: string) {
    const domain = await this.prisma.domain.findFirst({
      where: { id: domainId, organizationId: orgId },
    });
    if (!domain) throw new NotFoundException('Domain not found');

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
      } catch {
        // _dmarc record might not exist
      }
    } catch {
      // Domain might not exist or have TXT records
    }

    return this.prisma.domain.update({
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
    return this.prisma.mailbox.create({
      data: {
        ...dto,
        organizationId: orgId,
      },
    });
  }

  async getMailboxes(orgId: string) {
    return this.prisma.mailbox.findMany({
      where: { organizationId: orgId },
      include: { domain: true },
    });
  }

  async updateMailbox(orgId: string, id: string, dto: UpdateMailboxDto) {
    const mailbox = await this.prisma.mailbox.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!mailbox) {
      throw new NotFoundException('Mailbox not found');
    }

    return this.prisma.mailbox.update({
      where: { id },
      data: dto,
    });
  }
}
