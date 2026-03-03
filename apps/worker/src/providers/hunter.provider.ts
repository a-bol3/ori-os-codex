import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HunterProvider {
    private readonly logger = new Logger(HunterProvider.name);
    private readonly apiKey = process.env.HUNTER_API_KEY;

    async findEmail(domain: string, firstName: string, lastName: string) {
        if (!this.apiKey || this.apiKey === 'your_hunter_key') {
            this.logger.warn('Hunter.io API key not set, returning mock data');
            return {
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
                score: 85,
                sources: ['Simulation'],
            };
        }

        try {
            const response = await axios.get('https://api.hunter.io/v2/email-finder', {
                params: {
                    domain,
                    first_name: firstName,
                    last_name: lastName,
                    api_key: this.apiKey,
                },
            });

            const { data } = response.data;
            if (data && data.email) {
                return {
                    email: data.email,
                    score: data.score,
                    sources: data.sources?.map((s: any) => s.uri) || [],
                };
            }
            return null;
        } catch (error) {
            this.logger.error(`Hunter.io search failed: ${error.message}`);
            return null;
        }
    }

    async verifyEmail(email: string) {
        if (!this.apiKey || this.apiKey === 'your_hunter_key') {
            return { status: 'valid', score: 100 };
        }

        try {
            const response = await axios.get('https://api.hunter.io/v2/email-verifier', {
                params: {
                    email,
                    api_key: this.apiKey,
                },
            });
            return response.data.data;
        } catch (error) {
            this.logger.error(`Hunter.io verification failed: ${error.message}`);
            return null;
        }
    }
}
