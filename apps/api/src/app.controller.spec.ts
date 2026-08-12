import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = {
    getHello: jest.fn().mockReturnValue('Hello World!'),
    getHealth: jest.fn().mockReturnValue({ status: 'ok' }),
    getReadiness: jest.fn().mockResolvedValue({
      status: 'ready',
      dependencies: { database: 'ok', redis: 'skipped' },
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should return health information from the app service', () => {
      expect(appController.getHealth()).toEqual({ status: 'ok' });
    });

    it('should return readiness information from the app service', async () => {
      await expect(appController.getReadiness()).resolves.toEqual({
        status: 'ready',
        dependencies: { database: 'ok', redis: 'skipped' },
      });
    });
  });
});
