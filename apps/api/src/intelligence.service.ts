import {  Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { AiService } from './ai.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as cheerio from 'cheerio';
import {
  CreateIcpProfileDto,
  UpdateIcpProfileDto,
} from './dto/icp-profile.dto';

type LeadSearchResult = {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  location: string;
  description: string;
};

type IntelligencePrismaModels = {
  icpProfile: {
    create: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown[]>;
    findFirst: (args: unknown) => Promise<{ id: string } | null>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
  };
  enrichmentJob: {
    create: (args: unknown) => Promise<{ id: string }>;
    findMany: (args: unknown) => Promise<unknown[]>;
  };
};

@Injectable()
export class IntelligenceService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AiService) private readonly ai: AiService,
    @InjectQueue('intelligence-job') private enrichmentQueue: Queue,
  ) { }

  private get intelligenceModels(): IntelligencePrismaModels {
    return this.prisma as unknown as IntelligencePrismaModels;
  }

  // --- ICP Profiles ---

  async createIcpProfile(orgId: string, dto: CreateIcpProfileDto) {
    return this.intelligenceModels.icpProfile.create({
      data: {
        ...dto,
        organizationId: orgId,
      },
    });
  }

  async getIcpProfiles(orgId: string) {
    return this.intelligenceModels.icpProfile.findMany({
      where: { organizationId: orgId },
    });
  }

  async updateIcpProfile(orgId: string, id: string, dto: UpdateIcpProfileDto) {
    const profile = await this.intelligenceModels.icpProfile.findFirst({
      where: { id, organizationId: orgId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('ICP profile not found');
    }

    return this.intelligenceModels.icpProfile.update({
      where: { id: profile.id },
      data: dto,
    });
  }

  async deleteIcpProfile(orgId: string, id: string) {
    const profile = await this.intelligenceModels.icpProfile.findFirst({
      where: { id, organizationId: orgId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('ICP profile not found');
    }

    return this.intelligenceModels.icpProfile.delete({
      where: { id: profile.id },
    });
  }

  // --- Lead Discovery ---

  async searchLeads(query: string): Promise<LeadSearchResult[]> {
    if (!query) return [];
    const prompt = `
      Act as a business intelligence tool. The user is searching for companies matching: "${query}".
      Return a JSON array of 3 realistic, existing companies that match this query.
      Each object must have exactly these keys:
      - id (a generated unique string)
      - name (Company name)
      - domain (Company website domain)
      - industry (Primary industry)
      - size (E.g. "11-50", "201-500", "1000+")
      - location (City, Country)
      - description (A realistic 1-2 sentence description)
    `;

    try {
      const resultStr = await this.ai.callOpenAI(prompt, 'You are a lead generation search engine.', true);
      const data = typeof resultStr === 'string' ? JSON.parse(resultStr) : resultStr;

      // Handle the case where the AI returns { "companies": [...] } instead of directly [...]
      if (data && Array.isArray(data)) return data as LeadSearchResult[];
      if (data && data.companies && Array.isArray(data.companies)) {
        return data.companies as LeadSearchResult[];
      }

      const nestedArray = Object.values(data as Record<string, unknown>).find(Array.isArray);
      return (nestedArray as LeadSearchResult[] | undefined) || [];
    } catch (error) {
      console.error('Lead search AI failed:', error);
      return [];
    }
  }

  // --- Enrichment ---

  async enrichCompany(domain: string) {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    let crawledText = '';

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract metadata and key content
        const title = $('title').text();
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        const h1s = $('h1')
          .map((i, el) => $(el).text())
          .get()
          .join('; ');

        // Get some body text (first 2000 chars)
        const bodyText = $('body')
          .text()
          .replace(/\s+/g, ' ')
          .substring(0, 2000);

        crawledText = `Title: ${title}\nDescription: ${metaDesc}\nHeaders: ${h1s}\nContent: ${bodyText}`;
        console.log(
          `[CRAWLER] Successfully crawled ${url}. Text length: ${crawledText.length}`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown crawl failure';
      console.error(`Failed to crawl ${url}:`, message);
      // Fallback: we still proceed with AI enrichment but with just the domain name
      crawledText = `No content fetched. Domain: ${domain}`;
    }

    const prompt = `
            Analyze the following text from the website of "${domain}" and extract company details.
            Return a JSON object with:
            - name (Company name)
            - industry (Primary industry)
            - size (Estimated employee count range: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+)
            - location (Headquarters location)
            - techStack (String array of technologies used, if identifiable)
            - funding (Last funding round or estimate, if identifiable, else "Unknown")
            - founded (Year founded, if identifiable, else "Unknown")
            - description (A 2-sentence professional summary of what they do)

            Text from website:
            ${crawledText}
        `;

    try {
      const result = await this.ai.callOpenAI(
        prompt,
        'You are a specialized business intelligence researcher.',
      );
      return {
        ...result,
        domain,
        lastUpdated: new Date(),
      };
    } catch {
      return {
        name: domain.split('.')[0].toUpperCase(),
        domain,
        industry: 'Unknown',
        size: 'Unknown',
        location: 'Unknown',
        techStack: [],
        funding: 'Unknown',
        founded: 'Unknown',
        description: `Failed to enrich. Technical details for ${domain} not found.`,
      };
    }
  }

  async createEnrichmentJob(
    orgId: string,
    targetType: 'COMPANY' | 'CONTACT',
    targetId: string,
  ) {
    return this.intelligenceModels.enrichmentJob.create({
      data: {
        organizationId: orgId,
        targetType,
        targetId,
        provider: 'internal-ai',
        status: 'pending',
      },
    });
  }

  async enqueueEnrichment(data: {
    orgId: string;
    contactId?: string;
    companyId?: string;
    domain?: string;
    type: 'enrich-contact' | 'enrich-company' | 'find-email';
  }) {
    // Create database entry for tracking
    const targetType = data.type === 'enrich-company' ? 'COMPANY' : 'CONTACT';
    const targetId = data.contactId || data.companyId || 'unknown';

    const jobRecord = await this.intelligenceModels.enrichmentJob.create({
      data: {
        organizationId: data.orgId,
        targetType,
        targetId,
        provider: 'multi-provider',
        status: 'pending',
      },
    });

    // Enqueue job to worker
    await this.enrichmentQueue.add(data.type, {
      ...data,
      jobId: jobRecord.id,
    });

    return jobRecord;
  }

  async getEnrichmentJobs(orgId: string) {
    return this.intelligenceModels.enrichmentJob.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
