import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AIService } from './ai-service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate')
  generateText(
    @Req() req: any,
    @Body()
    body: {
      prompt: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      connectorId?: string;
    },
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.aiService.generateText(organizationId, body.prompt, {
      model: body.model,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      connectorId: body.connectorId,
    });
  }

  @Post('sentiment')
  analyzeSentiment(
    @Req() req: any,
    @Body() body: { text: string; connectorId?: string },
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.aiService.analyzeSentiment(
      organizationId,
      body.text,
      body.connectorId,
    );
  }
}
