import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ApolloProvider {
    private readonly logger = new Logger(ApolloProvider.name);
    private readonly apiKey = process.env.APOLLO_API_KEY;

    async enrichContact(email: string) {
        if (!this.apiKey) {
            this.logger.warn('APOLLO_API_KEY not set, using mock');
            return { title: 'Engineer', linkedin: 'linkedin.com/in/demo' };
        }

        try {
            const response = await axios.post('https://api.apollo.io/v1/people/match', {
                api_key: this.apiKey,
                email,
            });

            const person = response.data.person;
            return {
                name: person?.name,
                title: person?.title,
                company: person?.organization?.name,
                linkedin: person?.linkedin_url,
                phone: person?.phone_number,
            };
        } catch (error: any) {
            this.logger.error(`Apollo.io enrichment failed: ${error.message}`);
            return null;
        }
    }
}
