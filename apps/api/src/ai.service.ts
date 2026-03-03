import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openAiKey = process.env.OPENAI_API_KEY;

  async callOpenAI(prompt: string, systemPrompt?: string, jsonMode = true) {
    if (!this.openAiKey || this.openAiKey.includes('dummy')) {
      this.logger.warn(
        'Using High-Fidelity AI Simulation (Dummy Key or No Key)',
      );

      // Simulate realistic delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (jsonMode) {
        if (prompt.includes('Enrich')) {
          return {
            name: 'Experiment Corp',
            industry: 'Software & AI',
            size: '201-500',
            location: 'San Francisco, CA',
            techStack: ['Next.js', 'NestJS', 'PostgreSQL', 'OpenAI'],
            funding: '$150M Series C',
            description:
              'A cutting-edge tech company focused on building the next generation of business operating systems.',
          };
        }
        return {
          name: 'AI Generated Template',
          content:
            'Subject: Elevating your workflow with ORI-OS \n\nHello, \n\nI noticed your interest in scaling your production environment. [Simulated AI Response]',
        };
      }
      return 'This is a high-fidelity simulated response from ORI-OS AI Lab.';
    }

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: systemPrompt || 'You are a helpful AI assistant.',
              },
              { role: 'user', content: prompt },
            ],
            response_format: jsonMode ? { type: 'json_object' } : undefined,
          }),
        },
      );

      const data = await response.json();
      const content = data.choices[0].message.content;
      return jsonMode ? JSON.parse(content) : content;
    } catch (error) {
      this.logger.error(`OpenAI Error: ${error.message}`);
      return null;
    }
  }

  async generateContent(prompt: string, type: 'Email' | 'Social' = 'Email') {
    const systemPrompt = `You are a professional marketing copywriter. Generate a high-converting ${type}. Return a JSON object with "name" and "content" fields.`;
    return this.callOpenAI(prompt, systemPrompt);
  }
}
