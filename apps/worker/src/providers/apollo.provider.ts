import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ApolloProvider {
    private readonly logger = new Logger(ApolloProvider.name);
    private readonly apiKey = process.env.APOLLO_API_KEY;

    async enrichContact(email: string) {
        if (!this.apiKey || this.apiKey === 'your_apollo_key') {
            this.logger.warn('Apollo.io API key not set, returning mock data');
            return {
                name: email.split('@')[0].replace('.', ' '),
                title: 'Decision Maker',
                company: email.split('@')[1].split('.')[0].toUpperCase(),
                linkedin: `https://www.linkedin.com/in/${email.split('@')[0]}`,
                phone: '+1 555-0199',
            };
        }

        try {
            const response = await axios.post(
                'https://api.apollo.io/v1/people/match',
                { email },
                {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json',
                        'Api-Key': this.apiKey,
                    },
                },
            );

            const { person } = response.data;
            if (person) {
                return {
                    name: person.name,
                    title: person.title,
                    company: person.organization?.name,
                    linkedin: person.linkedin_url,
                    phone: person.phone_number,
                };
            }
            return null;
        } catch (error) {
            this.logger.error(`Apollo.io enrichment failed: ${error.message}`);
            return null;
        }
    }
}
