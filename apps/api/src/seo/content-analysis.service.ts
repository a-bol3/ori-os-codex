import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ContentAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  async analyzeContent(
    projectId: string,
    organizationId: string,
    pageUrl: string,
    targetKeyword: string,
    includeCompetitors: boolean = true,
  ) {
    // Verify project exists and belongs to organization
    const project = await (this.prisma as any).sEOProject.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new NotFoundException('SEO project not found');
    }

    // Fetch and analyze target page
    const yourPageAnalysis = await this.analyzePage(pageUrl, targetKeyword);

    // Fetch competitor data (simplified - in production, use SERP API)
    let competitorAnalysis: any[] = [];
    if (includeCompetitors) {
      competitorAnalysis = await this.analyzeCompetitors(targetKeyword);
    }

    // Calculate SEO score
    const score = this.calculateSEOScore(yourPageAnalysis, competitorAnalysis);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      yourPageAnalysis,
      competitorAnalysis,
    );

    // Save analysis to database
    const analysis = await (this.prisma as any).sEOContentAnalysis.create({
      data: {
        projectId,
        url: pageUrl,
        score,
        wordCount: yourPageAnalysis.wordCount,
        h2Count: yourPageAnalysis.h2Count,
        imageCount: yourPageAnalysis.hasImages,
        recommendations: recommendations,
        keywordDensity: yourPageAnalysis.keywordDensity,
      },
    });

    return {
      ...analysis,
      yourPage: yourPageAnalysis,
      competitors: competitorAnalysis,
      recommendations,
    };
  }

  private async analyzePage(url: string, keyword: string) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const $ = cheerio.load(response.data);

      const title = $('title').text().trim();
      const metaDescription =
        $('meta[name="description"]').attr('content')?.trim() || '';
      const h1 = $('h1').first().text().trim() || '';

      // Extract meaningful text from body (avoid script/style)
      $('script, style, nav, footer, header').remove();
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
      const wordCount = bodyText.split(/\s+/).length;

      // Count keyword occurrences (case insensitive)
      const keywordRegex = new RegExp(
        `\\b${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`,
        'gi',
      );
      const keywordMatches = bodyText.match(keywordRegex) || [];

      const keywordInTitle = title
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const keywordInMeta = metaDescription
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const keywordInH1 = h1.toLowerCase().includes(keyword.toLowerCase());
      const keywordDensity = (keywordMatches.length / wordCount) * 100;

      // Check headings hierarchy
      const h2s = $('h2').length;
      const h3s = $('h3').length;

      return {
        url,
        title,
        metaDescription,
        h1,
        h2Count: h2s,
        h3Count: h3s,
        wordCount,
        keywordInTitle,
        keywordInMeta,
        keywordInH1,
        keywordDensity: Math.round(keywordDensity * 100) / 100, // percentage
        hasImages: $('img').length,
        imagesWithAlt: $('img[alt]').length,
        hasInternalLinks: $('a[href^="/"]').length,
        hasExternalLinks: $('a[href^="http"]').length,
      };
    } catch (error) {
      console.error(
        `[Content Analysis] Failed to analyze ${url}:`,
        error.message,
      );
      return {
        url,
        error: error.message,
        wordCount: 0,
        keywordInTitle: false,
        keywordInMeta: false,
        keywordInH1: false,
        keywordDensity: 0,
      };
    }
  }

  private async analyzeCompetitors(keyword: string) {
    // In production, use SERP API to get top 10 results
    // For now, return mock competitor data
    return [
      {
        url: 'https://competitor1.com/article',
        title: `Ultimate Guide to ${keyword}`,
        wordCount: 2500,
        keywordInTitle: true,
        keywordInMeta: true,
        keywordInH1: true,
        keywordDensity: 1.8,
        position: 1,
      },
      {
        url: 'https://competitor2.com/blog',
        title: `How to Master ${keyword}`,
        wordCount: 1800,
        keywordInTitle: true,
        keywordInMeta: true,
        keywordInH1: true,
        keywordDensity: 2.1,
        position: 2,
      },
      {
        url: 'https://competitor3.com/guide',
        title: `${keyword} - Complete Tutorial`,
        wordCount: 3200,
        keywordInTitle: true,
        keywordInMeta: true,
        keywordInH1: false,
        keywordDensity: 1.5,
        position: 3,
      },
    ];
  }

  private calculateSEOScore(yourPage: any, competitors: any[]) {
    let score = 0;

    // Basic SEO elements (40 points)
    if (yourPage.keywordInTitle) score += 10;
    if (yourPage.keywordInMeta) score += 10;
    if (yourPage.keywordInH1) score += 10;
    if (yourPage.wordCount > 500) score += 10;

    // Keyword density (10 points)
    if (yourPage.keywordDensity > 0.5 && yourPage.keywordDensity < 3) {
      score += 10;
    }

    // Content length vs competitors (20 points)
    if (competitors.length > 0) {
      const avgCompetitorWordCount =
        competitors.reduce((sum, c) => sum + c.wordCount, 0) /
        competitors.length;
      if (yourPage.wordCount >= avgCompetitorWordCount) {
        score += 20;
      } else if (yourPage.wordCount >= avgCompetitorWordCount * 0.8) {
        score += 10;
      }
    } else {
      score += 20; // Give benefit of doubt if no competitors
    }

    // Images and links (15 points)
    if (yourPage.hasImages > 0) score += 5;
    if (yourPage.hasInternalLinks > 0) score += 5;
    if (yourPage.hasExternalLinks > 0) score += 5;

    // Comprehensive content (15 points)
    if (yourPage.wordCount > 1500) score += 10;
    if (yourPage.wordCount > 2500) score += 5;

    return Math.min(score, 100);
  }

  private generateRecommendations(yourPage: any, competitors: any[]) {
    const recommendations: any[] = [];

    if (!yourPage.keywordInTitle) {
      recommendations.push({
        priority: 'high',
        category: 'On-Page SEO',
        issue: 'Keyword not in title tag',
        recommendation: `Add "${yourPage.targetKeyword || 'target keyword'}" to your title tag`,
      });
    }

    if (!yourPage.keywordInMeta) {
      recommendations.push({
        priority: 'high',
        category: 'On-Page SEO',
        issue: 'Keyword not in meta description',
        recommendation: 'Include target keyword in meta description',
      });
    }

    if (!yourPage.keywordInH1) {
      recommendations.push({
        priority: 'medium',
        category: 'Content',
        issue: 'Keyword not in H1',
        recommendation: 'Add target keyword to your main heading (H1)',
      });
    }

    if (yourPage.wordCount < 1000) {
      const avgCompetitorCount =
        competitors.length > 0
          ? competitors.reduce((sum, c) => sum + c.wordCount, 0) /
            competitors.length
          : 1500;
      recommendations.push({
        priority: 'high',
        category: 'Content',
        issue: 'Content too short',
        recommendation: `Expand content to at least ${Math.round(avgCompetitorCount)} words (avg competitor length)`,
      });
    }

    if (yourPage.keywordDensity < 0.5) {
      recommendations.push({
        priority: 'medium',
        category: 'Content',
        issue: 'Low keyword density',
        recommendation: 'Increase keyword usage naturally throughout content',
      });
    } else if (yourPage.keywordDensity > 3) {
      recommendations.push({
        priority: 'high',
        category: 'Content',
        issue: 'Keyword stuffing detected',
        recommendation:
          'Reduce keyword usage to avoid over-optimization penalty',
      });
    }

    if (!yourPage.hasImages || yourPage.hasImages === 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Media',
        issue: 'No images found',
        recommendation: 'Add relevant images with descriptive alt text',
      });
    }

    return recommendations;
  }

  async getAnalyses(projectId: string, organizationId: string, filters?: any) {
    const where: any = {
      projectId,
      project: {
        organizationId,
      },
    };

    const analyses = await (this.prisma as any).sEOContentAnalysis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 20,
      skip: filters?.offset || 0,
    });

    const total = await (this.prisma as any).sEOContentAnalysis.count({
      where,
    });

    return {
      data: analyses,
      total,
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    };
  }

  async getAnalysisById(analysisId: string, organizationId: string) {
    const analysis = await (this.prisma as any).sEOContentAnalysis.findFirst({
      where: {
        id: analysisId,
        project: {
          organizationId,
        },
      },
    });

    if (!analysis) {
      throw new NotFoundException('Content analysis not found');
    }

    return analysis;
  }
}
