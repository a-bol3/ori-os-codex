import { AIProvider } from '../interfaces/provider.interface';
import { OpenAIProvider } from '../providers/ai/openai.provider';
import { AnthropicProvider } from '../providers/ai/anthropic.provider';

export class AIProviderFactory {
  static create(type: string, config: any): AIProvider {
    switch (type.toUpperCase()) {
      case 'OPENAI':
        return new OpenAIProvider(config.apiKey);
      case 'ANTHROPIC':
        return new AnthropicProvider(config.apiKey);
      default:
        throw new Error(`Unsupported AI provider type: ${type}`);
    }
  }
}
