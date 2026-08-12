import {
  fixtureMode,
  prepareExternalAiInput,
  ProviderConfigurationError,
  requireConfiguredProvider,
} from '@ori-os/core';
import type {
  AIProvider,
  EmailMessage,
  EmailProvider,
  EmailResult,
  GenerateOptions,
  IntegrationHealth,
  NotificationProvider,
  Provider,
  StorageProvider,
  WorkspaceFeatureFlags,
} from '@ori-os/core';

describe('shared core contracts', () => {
  it('re-exports shared provider contracts for ORI products', () => {
    const provider: Provider = {
      getType: () => 'email',
      verify: async () => true,
    };

    const emailMessage: EmailMessage = {
      from: { name: 'ORI', email: 'business@ori-craftlabs.com' },
      to: [{ email: 'test@example.com' }],
      subject: 'Quick Test',
      html: '<p>Hello</p>',
    };

    const emailResult: EmailResult = {
      messageId: 'msg_123',
      status: 'sent',
    };

    const emailProvider: EmailProvider = {
      ...provider,
      send: async () => emailResult,
    };

    const storageProvider: StorageProvider = {
      ...provider,
      putObject: async () => undefined,
      getObject: async () => Buffer.from('ok'),
      getSignedUrl: async () => 'https://example.com',
      deleteObject: async () => undefined,
    };

    const aiOptions: GenerateOptions = {
      model: 'gpt-4.1-mini',
      temperature: 0.2,
      maxTokens: 50,
    };

    const aiProvider: AIProvider = {
      ...provider,
      generateText: async (_prompt, _options) => 'ok',
    };

    const notificationProvider: NotificationProvider = {
      ...provider,
      sendNotification: async () => undefined,
    };

    const integrationHealth: IntegrationHealth = {
      provider: 'Resend',
      kind: 'email',
      status: 'healthy',
      checkedAt: new Date().toISOString(),
    };

    const workspaceFlags: WorkspaceFeatureFlags = {
      aiEnabled: false,
      emailEnabled: true,
      testBenchEnabled: false,
      externalPiiProcessingEnabled: false,
    };

    expect(provider.getType()).toBe('email');
    expect(emailMessage.subject).toBe('Quick Test');
    expect(emailResult.status).toBe('sent');
    expect(emailProvider).toBeDefined();
    expect(storageProvider).toBeDefined();
    expect(aiOptions.temperature).toBe(0.2);
    expect(aiProvider).toBeDefined();
    expect(notificationProvider).toBeDefined();
    expect(integrationHealth.kind).toBe('email');
    expect(workspaceFlags.emailEnabled).toBe(true);
  });

  it('fails closed for missing providers in production while allowing fixtures outside production', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalFixture = process.env.ENABLE_EMAIL_FIXTURES;

    delete process.env.ENABLE_EMAIL_FIXTURES;
    process.env.NODE_ENV = 'production';

    expect(() =>
      requireConfiguredProvider('email', false, {
        NODE_ENV: 'production',
      }),
    ).toThrow(ProviderConfigurationError);

    process.env.NODE_ENV = 'development';
    process.env.ENABLE_EMAIL_FIXTURES = 'true';

    expect(fixtureMode('ENABLE_EMAIL_FIXTURES')).toBe(true);
    expect(() =>
      requireConfiguredProvider('email', false, {
        NODE_ENV: 'development',
      }),
    ).not.toThrow();

    process.env.NODE_ENV = originalEnv;
    if (originalFixture === undefined) {
      delete process.env.ENABLE_EMAIL_FIXTURES;
    } else {
      process.env.ENABLE_EMAIL_FIXTURES = originalFixture;
    }
  });

  it('redacts external AI input unless explicit PII processing is enabled', () => {
    const originalFlag = process.env.ENABLE_EXTERNAL_AI_PII;

    delete process.env.ENABLE_EXTERNAL_AI_PII;

    expect(prepareExternalAiInput('Hello Abad Bolanos <abad@example.com>')).toContain(
      'Abad Bolanos',
    );
    expect(prepareExternalAiInput('Hello Abad Bolanos <abad@example.com>')).toContain(
      '[redacted-email]',
    );

    process.env.ENABLE_EXTERNAL_AI_PII = 'true';
    expect(prepareExternalAiInput('Hello Abad Bolanos <abad@example.com>')).toContain(
      'Abad Bolanos',
    );

    if (originalFlag === undefined) {
      delete process.env.ENABLE_EXTERNAL_AI_PII;
    } else {
      process.env.ENABLE_EXTERNAL_AI_PII = originalFlag;
    }
  });
});
