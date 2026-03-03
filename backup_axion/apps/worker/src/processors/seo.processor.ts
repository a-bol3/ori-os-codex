import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';

@Processor('seo-crawl')
export class SeoProcessor extends WorkerHost {
    private readonly logger = new Logger(SeoProcessor.name);

    constructor(private prisma: PrismaService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { projectId, domain } = job.data;
        this.logger.log(`Starting SEO crawl for project ${projectId} (${domain})`);

        const crawl = await this.prisma.sEOCrawl.create({
            data: {
                projectId,
                status: 'crawling',
                startedAt: new Date(),
            },
        });

        try {
            const url = domain.startsWith('http') ? domain : `https://${domain}`;

            // 1. Check robots.txt
            const robotsUrl = `${new URL(url).origin}/robots.txt`;
            let canCrawl = true;
            try {
                const robotsResponse = await axios.get(robotsUrl);
                const robots = robotsParser(robotsUrl, robotsResponse.data);
                canCrawl = robots.isAllowed(url, 'OriBot');
            } catch (e) {
                this.logger.warn(`Could not fetch robots.txt for ${domain}, proceeding cautiously`);
            }

            if (!canCrawl) {
                throw new Error('Crawling disallowed by robots.txt');
            }

            // 2. Fetch and parse homepage
            const response = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(response.data);

            const issues = [];

            // Basic issue detection logic
            const title = $('title').text();
            if (!title) {
                issues.push({
                    type: 'missing_title',
                    severity: 'critical',
                    message: 'Page is missing a title tag',
                    url,
                });
            } else if (title.length > 70) {
                issues.push({
                    type: 'long_title',
                    severity: 'warning',
                    message: 'Title tag is too long (over 70 characters)',
                    url,
                });
            }

            const metaDesc = $('meta[name="description"]').attr('content');
            if (!metaDesc) {
                issues.push({
                    type: 'missing_description',
                    severity: 'warning',
                    message: 'Missing meta description',
                    url,
                });
            }

            // 3. Store results
            for (const issue of issues) {
                await this.prisma.sEOIssue.create({
                    data: {
                        crawlId: crawl.id,
                        ...issue,
                    },
                });
            }

            await this.prisma.sEOCrawl.update({
                where: { id: crawl.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    pagesCrawled: 1,
                    totalIssues: issues.length,
                },
            });

            return { issues: issues.length };
        } catch (error: any) {
            this.logger.error(`Crawl failed for ${domain}: ${error.message}`);
            await this.prisma.sEOCrawl.update({
                where: { id: crawl.id },
                data: { status: 'failed', completedAt: new Date() },
            });
            throw error;
        }
    }
}
