import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConnectorsService } from '../connectors/connectors.service';
import { StorageProviderFactory } from '../connectors/factories/storage-provider.factory';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly connectorsService: ConnectorsService) {}

  async uploadFile(
    organizationId: string,
    file: Express.Multer.File,
    options: { bucket?: string; path?: string; connectorId?: string },
  ) {
    const connector = await this.getConnector(
      organizationId,
      options.connectorId,
    );
    const provider = StorageProviderFactory.create(
      connector.type,
      connector.config,
    );

    const bucket = options.bucket || 'default';
    const key = options.path
      ? `${options.path}/${file.originalname}`
      : file.originalname;

    this.logger.log(
      `Uploading file ${key} to bucket ${bucket} via ${connector.type}`,
    );
    await provider.putObject(bucket, key, file.buffer, file.mimetype);

    return {
      bucket,
      key,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      connectorId: connector.id,
    };
  }

  async getDownloadUrl(
    organizationId: string,
    bucket: string,
    key: string,
    connectorId?: string,
    expiresIn: number = 3600,
  ) {
    const connector = await this.getConnector(organizationId, connectorId);
    const provider = StorageProviderFactory.create(
      connector.type,
      connector.config,
    );

    return await provider.getSignedUrl(bucket, key, expiresIn);
  }

  async deleteFile(
    organizationId: string,
    bucket: string,
    key: string,
    connectorId?: string,
  ) {
    const connector = await this.getConnector(organizationId, connectorId);
    const provider = StorageProviderFactory.create(
      connector.type,
      connector.config,
    );

    await provider.deleteObject(bucket, key);
  }

  private async getConnector(organizationId: string, connectorId?: string) {
    if (connectorId) {
      return await this.connectorsService.findOne(connectorId, organizationId);
    }

    // Default to first storage connector if not specified
    const connectors = await this.connectorsService.findAll(organizationId);
    const storageConnector = connectors.find((c) =>
      ['LOCAL', 'S3'].includes(c.type.toUpperCase()),
    );

    if (!storageConnector) {
      throw new NotFoundException(
        'No storage connector configured for this organization',
      );
    }

    // Need full connector with decrypted config
    return await this.connectorsService.findOne(
      storageConnector.id,
      organizationId,
    );
  }
}
