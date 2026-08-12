import {  Controller, Post, Body, UseGuards, Req, Inject } from '@nestjs/common';
import { AIService } from './ai-service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

type GenerateTextBody = {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  connectorId?: string;
};

type AnalyzeSentimentBody = { text: string; connectorId?: string };

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(@Inject(AIService) private readonly aiService: AIService) {}

  @Post('generate')
  generateText(
    @Req() req: AuthenticatedRequest,
    @Body() body: GenerateTextBody,
  ) {
    const organizationId = requireOrganizationId(req);
    return this.aiService.generateText(organizationId, body.prompt, {
      model: body.model,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      connectorId: body.connectorId,
    });
  }

  @Post('sentiment')
  analyzeSentiment(
    @Req() req: AuthenticatedRequest,
    @Body() body: AnalyzeSentimentBody,
  ) {
    const organizationId = requireOrganizationId(req);
    return this.aiService.analyzeSentiment(
      organizationId,
      body.text,
      body.connectorId,
    );
  }
}
