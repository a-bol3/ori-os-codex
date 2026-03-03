import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class WebsiteScraperProvider {
    private readonly logger = new Logger(WebsiteScraperProvider.name);

    async scrapeCompany(url: string) {
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        this.logger.log(`Scraping company website: ${targetUrl}`);

        try {
            const response = await axios.get(targetUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'ORI-OS-INTELLIGENCE/1.0',
                },
            });

            const html = response.data;
            const $ = cheerio.load(html);

            // Extract Company Name
            const name =
                $('meta[property="og:site_name"]').attr('content') ||
                $('title').text().split('|')[0].trim();

            // Extract Description
            const description =
                $('meta[name="description"]').attr('content') ||
                $('meta[property="og:description"]').attr('content') ||
                $('p').first().text().trim();

            // Tech Stack Hints
            const techStack: string[] = [];
            const scripts = $('script').map((i, el) => $(el).attr('src')).get();
            if (scripts.some(s => s?.includes('wp-content'))) techStack.push('WordPress');
            if (scripts.some(s => s?.includes('next/static'))) techStack.push('Next.js');
            if (scripts.some(s => s?.includes('assets/hubspot'))) techStack.push('HubSpot');
            if (scripts.some(s => s?.includes('shopify'))) techStack.push('Shopify');
            if (html.includes('intercomSettings')) techStack.push('Intercom');

            // Social Links
            const socialLinks: Record<string, string> = {};
            $('a[href]').each((i, el) => {
                const href = $(el).attr('href');
                if (href?.includes('linkedin.com/company/')) socialLinks.linkedin = href;
                if (href?.includes('twitter.com/')) socialLinks.twitter = href;
                if (href?.includes('facebook.com/')) socialLinks.facebook = href;
            });

            return {
                name,
                description: description.substring(0, 500),
                techStack,
                socialLinks,
                url: targetUrl,
            };
        } catch (error) {
            this.logger.error(`Scraping failed for ${targetUrl}: ${error.message}`);
            return null;
        }
    }
}
