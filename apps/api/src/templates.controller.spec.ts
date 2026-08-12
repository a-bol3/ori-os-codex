import { UnauthorizedException } from '@nestjs/common';
import { TemplatesController } from './templates.controller';

describe('TemplatesController', () => {
  const emailTemplate = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  const prisma = {
    emailTemplate,
  };

  const ai = {
    generateContent: jest.fn(),
  };

  const controller = new TemplatesController(prisma as never, ai as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects listing templates without organization context', async () => {
    await expect(controller.findAll({})).rejects.toThrow(UnauthorizedException);
  });

  it('creates generated templates inside the authenticated organization', async () => {
    ai.generateContent.mockResolvedValue({
      name: 'Generated template',
      content: '<p>Hello</p>',
    });
    emailTemplate.create.mockResolvedValue({ id: 'template-1' });

    await controller.generate(
      { user: { organizationId: 'org-1' } },
      { prompt: 'welcome email', type: 'Email' },
    );

    const [createArgs] = emailTemplate.create.mock.calls[0] as [unknown];

    expect(createArgs).toMatchObject({
      data: {
        organizationId: 'org-1',
        name: 'Generated template',
        bodyHtml: '<p>Hello</p>',
      },
    });
  });
});
