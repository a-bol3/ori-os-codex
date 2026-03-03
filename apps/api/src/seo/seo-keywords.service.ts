import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { GoogleAutocompleteProvider } from './providers/google-autocomplete.provider';
import { AiService } from '../ai.service';

@Injectable()
export class SeoKeywordsService {
  private readonly logger = new Logger(SeoKeywordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly autocomplete: GoogleAutocompleteProvider,
    private readonly ai: AiService,
  ) {}

  async findAll(projectId: string, organizationId: string) {
    return this.prisma.sEOKeyword.findMany({
      where: { projectId, organizationId },
      include: {
        rankings: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    projectId: string;
    organizationId: string;
    keyword: string;
    targetUrl?: string;
    searchVolume?: number;
    difficulty?: number;
    source?: string;
    intent?: string;
  }) {
    return this.prisma.sEOKeyword.create({
      data,
    });
  }

  async bulkCreate(
    projectId: string,
    organizationId: string,
    keywords: Array<{
      keyword: string;
      targetUrl?: string;
      searchVolume?: number;
      difficulty?: number;
      source?: string;
      intent?: string;
    }>,
  ) {
    return this.prisma.sEOKeyword.createMany({
      data: keywords.map((kw) => ({
        projectId,
        organizationId,
        ...kw,
      })),
      skipDuplicates: true,
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      targetUrl?: string;
      tracked?: boolean;
      intent?: string;
    },
  ) {
    return this.prisma.sEOKeyword.updateMany({
      where: { id, organizationId },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.sEOKeyword.deleteMany({
      where: { id, organizationId },
    });
  }

  async getRankingHistory(
    keywordId: string,
    organizationId: string,
    limit = 30,
  ) {
    const keyword = await this.prisma.sEOKeyword.findFirst({
      where: { id: keywordId, organizationId },
    });

    if (!keyword) {
      return null;
    }

    const rankings = await this.prisma.sEORanking.findMany({
      where: { keywordId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      keyword,
      rankings,
    };
  }

  async discoverKeywords(query: string, lang = 'en', country = 'us') {
    this.logger.log(`🔍 Discovering keywords for: ${query}`);
    return this.autocomplete.deepDiscover(query, lang, country);
  }

  async clusterKeywords(
    projectId: string,
    organizationId: string,
    keywords: string[],
  ) {
    this.logger.log(
      `🤖 Clustering ${keywords.length} keywords for project: ${projectId}`,
    );

    const prompt = `
            Act as an SEO expert. Group the following keywords into semantic clusters.
            For each cluster, provide a descriptive name, a primary intent (Informational, Navigational, Transactional, Commercial), and the list of keywords.
            Keywords: ${keywords.join(', ')}
            
            Return a JSON array of clusters:
            [
              {
                "name": "Cluster Name",
                "intent": "Informational",
                "keywords": ["kw1", "kw2"]
              }
            ]
        `;

    const clusters = await this.ai.callOpenAI(
      prompt,
      'You are an SEO intent analysis expert.',
      true,
    );

    if (Array.isArray(clusters)) {
      return clusters;
    }

    // Return as a single "Uncategorized" cluster if AI fails
    return [
      {
        name: 'Uncategorized',
        intent: 'Unknown',
        keywords: keywords,
      },
    ];
  }
}
