import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(@Inject(ConfigService) private configService: ConfigService) {
    const rawKey =
      this.configService.get<string>('ENCRYPTION_MASTER_KEY') ||
      this.configService.get<string>('ENCRYPTION_KEY');

    if (!rawKey) {
      throw new Error(
        'ENCRYPTION_MASTER_KEY is not defined in environment variables',
      );
    }

    // Ensure key is 32 bytes. If it's hex, convert it. If it's string, hash it.
    if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
      this.key = Buffer.from(rawKey, 'hex');
    } else {
      this.key = crypto.createHash('sha256').update(rawKey).digest();
    }
  }

  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag().toString('hex');

      // format: iv:authTag:encryptedData
      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
      throw new InternalServerErrorException('Encryption failed');
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new InternalServerErrorException('Decryption failed');
    }
  }
}
