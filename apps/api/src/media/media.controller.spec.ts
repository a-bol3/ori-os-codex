import { UnauthorizedException } from '@nestjs/common';
import { MediaController } from './media.controller';

describe('MediaController', () => {
  const mediaService = {
    uploadFile: jest.fn(),
    getDownloadUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  const controller = new MediaController(mediaService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects upload without organization context', () => {
    expect(() =>
      controller.uploadFile({}, {} as Express.Multer.File, {}),
    ).toThrow(UnauthorizedException);
  });

  it('passes the authenticated organization to download URL generation', () => {
    controller.getSignedUrl(
      { user: { organizationId: 'org-1' } },
      'bucket-1',
      'file.txt',
      'connector-1',
      '600',
    );

    expect(mediaService.getDownloadUrl).toHaveBeenCalledWith(
      'org-1',
      'bucket-1',
      'file.txt',
      'connector-1',
      600,
    );
  });
});
