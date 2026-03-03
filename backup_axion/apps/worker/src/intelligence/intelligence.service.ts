import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HunterProvider } from './hunter.provider';
import { ApolloProvider } from './apollo.provider';
import { WebsiteScraperProvider } from './website-scraper.provider';

@Injectable()
export class IntelligenceService {
    private readonly logger = new Logger(IntelligenceService.name);

    constructor(
        private prisma: PrismaService,
        private hunter: HunterProvider,
        private apollo: ApolloProvider,
        private scraper: WebsiteScraperProvider,
    ) { }

    async enrichLead(contactId: string) {
        const contact = await this.prisma.contact.findUnique({
            where: { id: contactId },
            include: { company: true },
        });

        if (!contact) throw new Error('Contact not found');

        this.logger.log(`Enriching lead: ${contact.email}`);

        // Enrich from Apollo if email exists
        if (contact.email) {
            const enrichment = await this.apollo.enrichContact(contact.email);
            if (enrichment) {
                await this.prisma.contact.update({
                    where: { id: contactId },
                    data: {
                        title: enrichment.title,
                        linkedin: enrichment.linkedin,
                    },
                });
            }
        }

        // Enrich company if domain exists
        if (contact.company?.domain) {
            const companyInfo = await this.scraper.scrapeCompany(contact.company.domain);
            if (companyInfo) {
                await this.prisma.company.update({
                    where: { id: contact.companyId as string },
                    data: {
                        description: companyInfo.description,
                    },
                });
            }
        }

        return { success: true };
    }
}
