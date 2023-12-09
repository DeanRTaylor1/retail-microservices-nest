import { scrypt, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { promisify } from 'util';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  public async encrypt(password: string): Promise<string> {
    const secret = this.configService.get<string>('SECRET_KEY');
    const iv = randomBytes(16);
    const key = (await promisify(scrypt)(secret, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const encryptedText = Buffer.concat([
      cipher.update(password, 'utf8'),
      cipher.final(),
    ]);
    return `${iv.toString('hex')}:${encryptedText.toString('base64')}`;
  }

  public async decrypt(encrypted: string): Promise<string> {
    const [ivHex, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const secret = this.configService.get<string>('SECRET_KEY');
    const key = (await promisify(scrypt)(secret, 'salt', 32)) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key, iv);

    const decryptedText = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'base64')),
      decipher.final(),
    ]);
    return decryptedText.toString('utf8');
  }
}
