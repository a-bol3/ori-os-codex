import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConnectorsService } from '../connectors/connectors.service';
import { AIProviderFactory } from '../connectors/factories/ai-provider.factory';
import { GenerateOptions } from '../connectors/interfaces/provider.interface';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private readonly connectorsService: ConnectorsService) {}

  async generateText(
    organizationId: string,
    prompt: string,
    options?: GenerateOptions & { connectorId?: string },
  ): Promise<string> {
    const connector = await this.getConnector(
      organizationId,
      options?.connectorId,
    );
    const provider = AIProviderFactory.create(connector.type, connector.config);

    this.logger.log(`Generating text via ${connector.type}`);
    return await provider.generateText(prompt, options);
  }

  async analyzeSentiment(
    organizationId: string,
    text: string,
    connectorId?: string,
  ): Promise<'positive' | 'neutral' | 'negative'> {
    const connector = await this.getConnector(organizationId, connectorId);
    const provider = AIProviderFactory.create(connector.type, connector.config);

    this.logger.log(`Analyzing sentiment via ${connector.type}`);

    if (!provider.analyzeSentiment) {
      throw new Error(
        `Provider ${connector.type} does not support sentiment analysis`,
      );
    }

    return await provider.analyzeSentiment(text);
  }

  private async getConnector(organizationId: string, connectorId?: string) {
    if (connectorId) {
      return await this.connectorsService.findOne(connectorId, organizationId);
    }

    // Default to first AI connector if not specified
    const connectors = await this.connectorsService.findAll(organizationId);
    const aiConnector = connectors.find((c) =>
      ['OPENAI', 'ANTHROPIC'].includes(c.type.toUpperCase()),
    );

    if (!aiConnector) {
      throw new NotFoundException(
        'No AI connector configured for this organization',
      );
    }

    // Need full connector with decrypted config
    return await this.connectorsService.findOne(aiConnector.id, organizationId);
  }
}
