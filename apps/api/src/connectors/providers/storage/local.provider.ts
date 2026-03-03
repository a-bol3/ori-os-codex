import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageProvider } from '../../interfaces/provider.interface';

export class LocalFileProvider implements StorageProvider {
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = path.isAbsolute(baseDir)
      ? baseDir
      : path.join(process.cwd(), baseDir);
  }

  getType(): string {
    return 'LOCAL';
  }

  async verify(): Promise<boolean> {
    try {
      await fs.access(this.baseDir);
      return true;
    } catch {
      try {
        await fs.mkdir(this.baseDir, { recursive: true });
        return true;
      } catch (error) {
        console.error(
          '[LocalFileProvider] Verification failed:',
          error.message,
        );
        return false;
      }
    }
  }

  async putObject(
    bucket: string,
    key: string,
    data: Buffer,
    contentType?: string,
  ): Promise<void> {
    const fullPath = path.join(this.baseDir, bucket, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, data);
  }

  async getObject(bucket: string, key: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, bucket, key);
    return await fs.readFile(fullPath);
  }

  async getSignedUrl(
    bucket: string,
    key: string,
    expiresIn: number,
  ): Promise<string> {
    // For local storage, we just return a local path or a relative URL
    // In a real application, this would point to a controller route that serves the file
    return `/api/media/download/${bucket}/${key}`;
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    const fullPath = path.join(this.baseDir, bucket, key);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}
