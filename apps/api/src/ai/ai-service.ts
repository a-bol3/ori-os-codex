import {  Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { ConnectorsService } from '../connectors/connectors.service';
import { AIProviderFactory } from '../connectors/factories/ai-provider.factory';
import { GenerateOptions } from '../connectors/interfaces/provider.interface';
import { prepareExternalAiInput } from '@ori-os/core';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(@Inject(ConnectorsService) private readonly connectorsService: ConnectorsService) {}

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
    const safePrompt = prepareExternalAiInput(prompt);
    if (safePrompt !== prompt) {
      this.logger.warn('PII was redacted before sending text to an external AI provider');
    }
    return await provider.generateText(safePrompt, options);
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

    const safeText = prepareExternalAiInput(text);
    if (safeText !== text) {
      this.logger.warn('PII was redacted before sending sentiment text to an external AI provider');
    }
    return await provider.analyzeSentiment(safeText);
  }

  private async getConnector(organizationId: string, connectorId?: string) {
    if (connectorId) {
      return await this.connectorsService.getForProvider(connectorId, organizationId);
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
    return await this.connectorsService.getForProvider(aiConnector.id, organizationId);
  }
}
