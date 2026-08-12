import { UnauthorizedException } from '@nestjs/common';
import { ConnectorsController } from './connectors.controller';

type ConnectorsServiceMock = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  testConnection: jest.Mock;
};

type EmailFallbackMock = {
  sendWithFallback: jest.Mock;
};

describe('ConnectorsController', () => {
  const connectorsService: ConnectorsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    testConnection: jest.fn(),
  };

  const emailFallback: EmailFallbackMock = {
    sendWithFallback: jest.fn(),
  };

  const controller = new ConnectorsController(
    connectorsService as never,
    emailFallback as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects connector access without organization context', () => {
    expect(() => controller.findAll({})).toThrow(UnauthorizedException);
  });

  it('passes the authenticated organization to the service', () => {
    controller.findOne({ user: { organizationId: 'org-1' } }, 'connector-1');

    expect(connectorsService.findOne).toHaveBeenCalledWith(
      'connector-1',
      'org-1',
    );
  });
});
