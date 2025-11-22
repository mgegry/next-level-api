import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const key = configService.get('ENCRYPTION_KEY');
    if (!key) throw new Error('ENCRYPTION_KEY missing');
    if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes');
    this.key = Buffer.from(key, 'utf-8');
  }

  async decrypt(ciphertext: string) {
    const raw = Buffer.from(ciphertext, 'base64');

    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(raw.length - 16);
    const encrypted = raw.subarray(12, raw.length - 16);

    // IMPORTANT: Force TypeScript to treat it as DecipherGCM
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      iv,
    ) as crypto.DecipherGCM;

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    const jsonToReturn = await JSON.parse(decrypted.toString('utf8'));
    return jsonToReturn;
  }
}
