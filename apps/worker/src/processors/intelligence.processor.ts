import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { HunterProvider } from '../providers/hunter.provider';
import { ApolloProvider } from '../providers/apollo.provider';
import { WebsiteScraperProvider } from '../providers/website-scraper.provider';

@Processor('intelligence-job')
export class IntelligenceProcessor extends WorkerHost {
    constructor(
        private prisma: PrismaService,
        private hunter: HunterProvider,
        private apollo: ApolloProvider,
        private scraper: WebsiteScraperProvider,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { contactId, companyId, domain, type, jobId } = job.data;
        console.log(`[Intelligence] Processing ${type} for job ${job.id}`);

        // Update job status if jobId provided
        if (jobId) {
            await (this.prisma as any).enrichmentJob.update({
                where: { id: jobId },
                data: { status: 'running', startedAt: new Date() },
            });
        }

        try {
            switch (type) {
                case 'enrich-contact':
                    await this.handleEnrichContact(contactId);
                    break;
                case 'enrich-company':
                    await this.handleEnrichCompany(companyId, domain);
                    break;
                case 'find-email':
                    await this.handleFindEmail(contactId, domain);
                    break;
                default:
                    throw new Error(`Unknown job type: ${type}`);
            }

            if (jobId) {
                await (this.prisma as any).enrichmentJob.update({
                    where: { id: jobId },
                    data: { status: 'completed', completedAt: new Date() },
                });
            }
            return { success: true };
        } catch (error) {
            console.error(`[Intelligence] Job failed: ${error.message}`);
            if (jobId) {
                await (this.prisma as any).enrichmentJob.update({
                    where: { id: jobId },
                    data: { status: 'failed', errorMessage: error.message },
                });
            }
            throw error;
        }
    }

    private async handleEnrichContact(contactId: string) {
        const contact = await (this.prisma as any).contact.findUnique({
            where: { id: contactId },
        });
        if (!contact?.email) throw new Error('Contact email missing');

        const enrichment = await this.apollo.enrichContact(contact.email);
        if (enrichment) {
            await (this.prisma as any).contact.update({
                where: { id: contactId },
                data: {
                    title: enrichment.title || contact.title,
                    linkedin: enrichment.linkedin || contact.linkedin,
                    phone: enrichment.phone || contact.phone,
                    // If company is provided and not already linked
                    ...(enrichment.company && !contact.companyId ? {
                        notes: (contact.notes || '') + `\n[Apollo] Suggested Company: ${enrichment.company}`
                    } : {})
                },
            });
        }
    }

    private async handleEnrichCompany(companyId: string, domain: string) {
        const company = await (this.prisma as any).company.findUnique({
            where: { id: companyId },
        });
        if (!company && !domain) throw new Error('Company ID or domain missing');

        const targetDomain = domain || company?.domain;
        const scraperResult = await this.scraper.scrapeCompany(targetDomain);

        if (scraperResult) {
            await (this.prisma as any).company.update({
                where: { id: companyId },
                data: {
                    name: company?.name || scraperResult.name,
                    description: scraperResult.description,
                    website: scraperResult.url,
                    industry: company?.industry || 'Technology', // Fallback or logic
                },
            });
        }
    }

    private async handleFindEmail(contactId: string, domain: string) {
        const contact = await (this.prisma as any).contact.findUnique({
            where: { id: contactId },
        });
        if (!contact) throw new Error('Contact not found');

        const firstName = contact.firstName || 'Unknown';
        const lastName = contact.lastName || 'User';

        const hunterResult = await this.hunter.findEmail(domain, firstName, lastName);
        if (hunterResult?.email) {
            await (this.prisma as any).contact.update({
                where: { id: contactId },
                data: {
                    email: hunterResult.email,
                    notes: (contact.notes || '') + `\n[Hunter] Found email with confidence ${hunterResult.score}%`,
                },
            });
        }
    }
}
