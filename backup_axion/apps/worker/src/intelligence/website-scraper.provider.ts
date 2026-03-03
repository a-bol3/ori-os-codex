import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class WebsiteScraperProvider {
    private readonly logger = new Logger(WebsiteScraperProvider.name);

    async scrapeCompany(url: string) {
        try {
            const targetUrl = url.startsWith('http') ? url : `https://${url}`;
            const response = await axios.get(targetUrl, { timeout: 10000 });
            const $ = cheerio.load(response.data);

            return {
                description: $('meta[name="description"]').attr('content') || $('p').first().text(),
                title: $('title').text(),
                logo: $('link[rel="icon"]').attr('href') || '/placeholder-logo.png',
            };
        } catch (error: any) {
            this.logger.error(`Website scraping failed for ${url}: ${error.message}`);
            return null;
        }
    }
}
