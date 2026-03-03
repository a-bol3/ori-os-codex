import OpenAI from 'openai';
import {
  AIProvider,
  GenerateOptions,
} from '../../interfaces/provider.interface';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  getType(): string {
    return 'OPENAI';
  }

  async verify(): Promise<boolean> {
    try {
      // Simple verification by listing models
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('[OpenAIProvider] Verification failed:', error.message);
      return false;
    }
  }

  async generateText(
    prompt: string,
    options?: GenerateOptions,
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stop: options?.stop,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error(`OpenAI generation failed: ${error.message}`);
    }
  }

  async analyzeSentiment(
    text: string,
  ): Promise<'positive' | 'neutral' | 'negative'> {
    const prompt = `Analyze the sentiment of the following text and respond with only one word: "positive", "neutral", or "negative".\n\nText: ${text}`;
    const result = await this.generateText(prompt, {
      temperature: 0,
      maxTokens: 10,
    });
    const sentiment = result.toLowerCase().trim();

    if (sentiment.includes('positive')) return 'positive';
    if (sentiment.includes('negative')) return 'negative';
    return 'neutral';
  }
}
