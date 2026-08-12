import { UnauthorizedException } from '@nestjs/common';
import { AIController } from './ai.controller';

describe('AIController', () => {
  const aiService = {
    generateText: jest.fn(),
    analyzeSentiment: jest.fn(),
  };

  const controller = new AIController(aiService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects AI generation without organization context', () => {
    expect(() =>
      controller.generateText({}, { prompt: 'Hello world' }),
    ).toThrow(UnauthorizedException);
  });

  it('passes the authenticated organization to sentiment analysis', () => {
    controller.analyzeSentiment(
      { user: { organizationId: 'org-1' } },
      { text: 'Looks good', connectorId: 'connector-1' },
    );

    expect(aiService.analyzeSentiment).toHaveBeenCalledWith(
      'org-1',
      'Looks good',
      'connector-1',
    );
  });
});
