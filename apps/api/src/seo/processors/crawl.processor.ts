import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { AlertsService } from '../alerts.service';

@Processor('seo-crawl')
@Injectable()
export class SEOCrawlProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertsService: AlertsService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { projectId, crawlId } = job.data;

    console.log(
      `[SEO Crawl] Starting crawl for project ${projectId}, crawl ${crawlId}`,
    );

    try {
      // Update crawl status to running
      await (this.prisma as any).sEOCrawl.update({
        where: { id: crawlId },
        data: {
          status: 'running',
          startedAt: new Date(),
        },
      });

      // Get project details
      const project = await (this.prisma as any).sEOProject.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Simulate crawling (in production, you'd use a real crawler like Puppeteer or Playwright)
      const mockPages = await this.crawlSite(
        project.domain,
        project.maxPagesToCrawl,
      );

      // Save crawled pages
      for (const page of mockPages) {
        await (this.prisma as any).sEOPage.create({
          data: {
            crawlId,
            ...page,
          },
        });
      }

      // Detect issues
      const issues = this.detectIssues(mockPages);

      // Save issues
      for (const issue of issues) {
        await (this.prisma as any).sEOIssue.create({
          data: {
            crawlId,
            ...issue,
          },
        });
      }

      const criticalIssuesCount = issues.filter(
        (i) => i.severity === 'critical',
      ).length;
      const warningsCount = issues.filter(
        (i) => i.severity === 'warning',
      ).length;

      // Trigger Alerts if critical issues found
      if (criticalIssuesCount > 0) {
        await this.alertsService.createAlert(
          projectId,
          project.organizationId,
          {
            type: 'new_issue',
            severity: 'critical',
            title: 'Critical Issues Found',
            message: `⚠️ SEO Crawl found ${criticalIssuesCount} critical issues on ${project.domain}`,
            metadata: {
              crawlId,
              issuesCount: issues.length,
              criticalIssues: criticalIssuesCount,
            },
          },
        );
      } else if (warningsCount > 5) {
        // Alert if significant number of warnings
        await this.alertsService.createAlert(
          projectId,
          project.organizationId,
          {
            type: 'new_issue',
            severity: 'warning',
            title: 'SEO Warnings',
            message: `SEO Crawl found ${warningsCount} warnings on ${project.domain}`,
            metadata: {
              crawlId,
              issuesCount: issues.length,
              warnings: warningsCount,
            },
          },
        );
      }

      // Update crawl status to completed
      await (this.prisma as any).sEOCrawl.update({
        where: { id: crawlId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          pagesFound: mockPages.length,
          pagesCrawled: mockPages.length,
          issuesFound: issues.length,
          criticalIssues: criticalIssuesCount,
          warnings: warningsCount,
        },
      });

      console.log(`[SEO Crawl] Completed crawl for project ${projectId}`);

      return {
        pagesFound: mockPages.length,
        issuesFound: issues.length,
      };
    } catch (error) {
      console.error(`[SEO Crawl] Error crawling project ${projectId}:`, error);

      // Update crawl status to failed
      await (this.prisma as any).sEOCrawl.update({
        where: { id: crawlId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  private async crawlSite(domain: string, maxPages: number): Promise<any[]> {
    const startUrl = domain.startsWith('http') ? domain : `https://${domain}`;
    const baseUrl = new URL(startUrl).origin;
    const visited = new Set<string>();
    const queue: string[] = [startUrl];
    const results: any[] = [];

    const axios = require('axios');
    const cheerio = require('cheerio');

    while (queue.length > 0 && results.length < maxPages) {
      const url = queue.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);

      console.log(`[SEO Crawl] Fetching ${url}...`);
      try {
        const response = await axios.get(url, {
          timeout: 5000,
          headers: { 'User-Agent': 'ORI-OS-SEO-Bot/1.0' },
          validateStatus: () => true, // Catch 404s etc.
        });

        const $ = cheerio.load(response.data);
        const pageData = {
          url,
          statusCode: response.status,
          loadTime: response.headers['request-duration'] || 0, // Simplified
          pageSize: response.data.length || 0,
          title: $('title').text().trim(),
          metaDescription:
            $('meta[name="description"]').attr('content') || null,
          h1: $('h1').first().text().trim() || null,
          wordCount: $('body').text().split(/\s+/).length,
          internalLinks: 0,
          externalLinks: 0,
          brokenLinks: 0,
          imageCount: $('img').length,
          imagesWithoutAlt: $('img:not([alt])').length,
        };

        // Extract links
        const links: string[] = [];
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (!href) return;

          try {
            const absoluteUrl = new URL(href, url).href;
            const parsedUrl = new URL(absoluteUrl);

            if (parsedUrl.origin === baseUrl) {
              pageData.internalLinks++;
              if (!visited.has(absoluteUrl) && !queue.includes(absoluteUrl)) {
                links.push(absoluteUrl);
              }
            } else {
              pageData.externalLinks++;
            }
          } catch (e) {
            // Invalid URL
          }
        });

        results.push(pageData);
        queue.push(...links);

        // Polite delay
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`[SEO Crawl] Failed to fetch ${url}: ${error.message}`);
        results.push({
          url,
          statusCode: 500,
          error: error.message,
          title: '',
          wordCount: 0,
        });
      }
    }

    return results;
  }

  private detectIssues(pages: any[]): any[] {
    const issues = [] as any[];

    for (const page of pages) {
      // Missing title
      if (!page.title || page.title.length === 0) {
        issues.push({
          severity: 'critical',
          category: 'meta',
          type: 'missing_title',
          pageUrl: page.url,
          description: 'Page is missing a title tag',
          recommendation: 'Add a descriptive title tag to improve SEO',
        });
      }

      // Missing meta description
      if (!page.metaDescription) {
        issues.push({
          severity: 'warning',
          category: 'meta',
          type: 'missing_meta_description',
          pageUrl: page.url,
          description: 'Page is missing a meta description',
          recommendation:
            'Add a compelling meta description to improve click-through rates',
        });
      }

      // Missing H1
      if (!page.h1) {
        issues.push({
          severity: 'critical',
          category: 'meta',
          type: 'missing_h1',
          pageUrl: page.url,
          description: 'Page is missing an H1 heading',
          recommendation: 'Add an H1 heading that describes the page content',
        });
      }

      // Broken links
      if (page.brokenLinks > 0) {
        issues.push({
          severity: 'warning',
          category: 'links',
          type: 'broken_links',
          pageUrl: page.url,
          description: `${page.brokenLinks} broken links found on this page`,
          recommendation:
            'Fix or remove broken links to improve user experience',
        });
      }

      // Images without alt text
      if (page.imagesWithoutAlt > 0) {
        issues.push({
          severity: 'warning',
          category: 'images',
          type: 'images_without_alt',
          pageUrl: page.url,
          description: `${page.imagesWithoutAlt} images without alt text`,
          recommendation:
            'Add descriptive alt text to all images for accessibility and SEO',
        });
      }

      // Slow page load
      if (page.loadTime > 3000) {
        issues.push({
          severity: 'warning',
          category: 'performance',
          type: 'slow_page_load',
          pageUrl: page.url,
          description: `Page load time is ${page.loadTime}ms`,
          recommendation:
            'Optimize page performance to improve user experience and SEO',
        });
      }
    }

    return issues;
  }
}
