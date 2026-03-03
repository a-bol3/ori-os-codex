import Anthropic from '@anthropic-ai/sdk';
import {
  AIProvider,
  GenerateOptions,
} from '../../interfaces/provider.interface';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  getType(): string {
    return 'ANTHROPIC';
  }

  async verify(): Promise<boolean> {
    try {
      // Verification by attempting a minimal message
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      console.error('[AnthropicProvider] Verification failed:', error.message);
      return false;
    }
  }

  async generateText(
    prompt: string,
    options?: GenerateOptions,
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature ?? 1.0,
        messages: [{ role: 'user', content: prompt }],
        stop_sequences: options?.stop,
      });

      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      throw new Error(`Anthropic generation failed: ${error.message}`);
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
