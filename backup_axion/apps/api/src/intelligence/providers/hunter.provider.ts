import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HunterProvider {
    private readonly logger = new Logger(HunterProvider.name);
    private readonly apiKey = process.env.HUNTER_API_KEY;

    async findEmail(domain: string, firstName: string, lastName: string) {
        if (!this.apiKey) {
            this.logger.warn('HUNTER_API_KEY not set, using mock');
            return { email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`, score: 85 };
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

            return {
                email: response.data.data.email,
                score: response.data.data.score,
                sources: response.data.data.sources,
            };
        } catch (error: any) {
            this.logger.error(`Hunter.io search failed: ${error.message}`);
            return null;
        }
    }
}
