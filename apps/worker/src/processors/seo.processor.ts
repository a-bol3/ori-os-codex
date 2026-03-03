import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service'; // Use local prisma service
import axios from 'axios';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';

@Processor('seo-crawl')
export class SeoProcessor extends WorkerHost {
    constructor(private prisma: PrismaService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { projectId, crawlId } = job.data;

        console.log(`[SEO] Starting crawl ${crawlId} for project ${projectId}`);

        // Update crawl status
        await (this.prisma as any).sEOCrawl.update({
            where: { id: crawlId },
            data: { status: 'running', startedAt: new Date() },
        });

        try {
            const project = await (this.prisma as any).sEOProject.findUnique({
                where: { id: projectId },
            });

            if (!project) throw new Error('Project not found');

            const domain = project.domain.startsWith('http') ? project.domain : `https://${project.domain}`;
            const robotsUrl = `${new URL(domain).origin}/robots.txt`;

            // Check robots.txt
            let isAllowed = true;
            try {
                const robotsResponse = await axios.get(robotsUrl, {
                    timeout: 5000,
                    headers: { 'User-Agent': 'ORI-OS-CRAWLER/1.0' }
                });
                const robots = robotsParser(robotsUrl, robotsResponse.data);
                isAllowed = robots.isAllowed(domain, 'ORI-OS-CRAWLER');
            } catch (e) {
                console.log(`[SEO] Robots.txt fetch failed or not found for ${domain}, assuming allowed.`);
            }

            if (!isAllowed) {
                await (this.prisma as any).sEOCrawl.update({
                    where: { id: crawlId },
                    data: { status: 'failed', errorMessage: 'Crawling disallowed by robots.txt' },
                });
                return { success: false, reason: 'robots.txt' };
            }

            // Site Crawler MVP: Homepage Analysis
            console.log(`[SEO] Crawling homepage: ${domain}`);
            const startTime = Date.now();
            const response = await axios.get(domain, {
                timeout: 10000,
                headers: { 'User-Agent': 'ORI-OS-CRAWLER/1.0' },
                validateStatus: null // Capture all status codes
            });
            const loadTime = Date.now() - startTime;
            const html = response.data || '';
            const $ = cheerio.load(html);

            const title = $('title').text().trim() || null;
            const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
            const h1Tags = $('h1');
            const h1 = h1Tags.first().text().trim() || null;
            const wordCount = $('body').text().split(/\s+/).filter(w => w.length > 0).length;
            const links = $('a');

            const internalLinks = links.filter((i, el) => {
                const href = $(el).attr('href');
                return href?.startsWith('/') || href?.includes(project.domain);
            }).length;
            const externalLinks = links.length - internalLinks;

            const images = $('img');
            const imagesWithoutAlt = images.filter((i, el) => !$(el).attr('alt')).length;

            // Create SEOPage
            const page = await (this.prisma as any).sEOPage.create({
                data: {
                    crawlId,
                    url: domain,
                    statusCode: response.status,
                    loadTime,
                    pageSize: Buffer.byteLength(html),
                    title,
                    metaDescription,
                    h1,
                    wordCount,
                    internalLinks,
                    externalLinks,
                    imageCount: images.length,
                    imagesWithoutAlt,
                },
            });

            // Detect Issues
            const issues: any[] = [];
            if (!title) {
                issues.push({
                    crawlId,
                    pageId: page.id,
                    severity: 'critical',
                    category: 'meta',
                    type: 'missing_title',
                    pageUrl: domain,
                    description: 'Page title is missing.',
                    recommendation: 'Add a descriptive title tag (50-60 chars) to the head of the document.',
                });
            } else if (title.length < 10) {
                issues.push({
                    crawlId,
                    pageId: page.id,
                    severity: 'warning',
                    category: 'meta',
                    type: 'short_title',
                    pageUrl: domain,
                    description: 'Page title is too short.',
                    recommendation: 'Expand the title tag to include relevant keywords.',
                });
            }

            if (!metaDescription) {
                issues.push({
                    crawlId,
                    pageId: page.id,
                    severity: 'warning',
                    category: 'meta',
                    type: 'missing_meta_description',
                    pageUrl: domain,
                    description: 'Meta description is missing.',
                    recommendation: 'Add a meta description (150-160 chars) to entice search users.',
                });
            }

            if (!h1) {
                issues.push({
                    crawlId,
                    pageId: page.id,
                    severity: 'warning',
                    category: 'content',
                    type: 'missing_h1',
                    pageUrl: domain,
                    description: 'H1 tag is missing.',
                    recommendation: 'Add exactly one H1 tag containing your primary keyword.',
                });
            } else if (h1Tags.length > 1) {
                issues.push({
                    crawlId,
                    pageId: page.id,
                    severity: 'warning',
                    category: 'content',
                    type: 'multiple_h1',
                    pageUrl: domain,
                    description: `Multiple H1 tags (${h1Tags.length}) detected.`,
                    recommendation: 'Use only one H1 tag per page for hierarchy clarity.',
                });
            }

            if (imagesWithoutAlt > 0) {
                issues.push({
                    crawlId,
                    pageId: page.id,
                    severity: 'warning',
                    category: 'images',
                    type: 'missing_alt_tags',
                    pageUrl: domain,
                    description: `${imagesWithoutAlt} images are missing alt text.`,
                    recommendation: 'Add descriptive alt text to all images for accessibility.',
                });
            }

            if (issues.length > 0) {
                await (this.prisma as any).sEOIssue.createMany({
                    data: issues,
                });

                // Create Alerts for critical issues
                for (const issue of issues.filter(i => i.severity === 'critical')) {
                    await (this.prisma as any).sEOAlert.create({
                        data: {
                            organizationId: project.organizationId,
                            projectId: project.id,
                            type: 'new_issue',
                            severity: 'critical',
                            message: `Critical SEO issue found on ${domain}: ${issue.description}`,
                        },
                    });
                }
            }

            // Update crawl summary
            await (this.prisma as any).sEOCrawl.update({
                where: { id: crawlId },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    pagesFound: 1,
                    pagesCrawled: 1,
                    issuesFound: issues.length,
                    criticalIssues: issues.filter(i => i.severity === 'critical').length,
                    warnings: issues.filter(i => i.severity === 'warning').length,
                },
            });

            console.log(`[SEO] Crawl ${crawlId} completed successfully.`);
            return { success: true, processedPages: 1, issueCount: issues.length };
        } catch (error) {
            console.error('[SEO] Crawl Failed:', error);
            await (this.prisma as any).sEOCrawl.update({
                where: { id: crawlId },
                data: { status: 'failed', errorMessage: error.message },
            });
            throw error;
        }
    }
}
