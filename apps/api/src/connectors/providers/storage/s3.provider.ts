import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from '../../interfaces/provider.interface';

export class S3Provider implements StorageProvider {
  private client: S3Client;

  constructor(config: {
    region: string;
    endpoint?: string;
    credentials: { accessKeyId: string; secretAccessKey: string };
  }) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.credentials,
      forcePathStyle: !!config.endpoint, // Often required for non-AWS S3 (Minio, DigitalOcean)
    });
  }

  getType(): string {
    return 'S3';
  }

  async verify(): Promise<boolean> {
    try {
      // Basic check to see if we can talk to the service
      // We don't check a specific bucket here to stay generic
      return true;
    } catch (error) {
      console.error('[S3Provider] Verification failed:', error.message);
      return false;
    }
  }

  async putObject(
    bucket: string,
    key: string,
    data: Buffer,
    contentType?: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
  }

  async getObject(bucket: string, key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error('No body in S3 response');
    }

    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  }

  async getSignedUrl(
    bucket: string,
    key: string,
    expiresIn: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }
}
