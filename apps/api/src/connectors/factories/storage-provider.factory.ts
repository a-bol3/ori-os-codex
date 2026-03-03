import { StorageProvider } from '../interfaces/provider.interface';
import { LocalFileProvider } from '../providers/storage/local.provider';
import { S3Provider } from '../providers/storage/s3.provider';

export class StorageProviderFactory {
  static create(type: string, config: any): StorageProvider {
    switch (type.toUpperCase()) {
      case 'LOCAL':
        return new LocalFileProvider(config.baseDir || 'uploads');
      case 'S3':
        return new S3Provider({
          region: config.region,
          endpoint: config.endpoint,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        });
      default:
        throw new Error(`Unsupported storage provider type: ${type}`);
    }
  }
}
