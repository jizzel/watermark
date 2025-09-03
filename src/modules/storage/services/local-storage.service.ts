import { Inject, Injectable, Logger } from '@nestjs/common';
import { IStorage } from '../storage.interface';
import type { ConfigType } from '@nestjs/config';
import { storageConfig } from '../../../app-config/configs/storage.config';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import { createReadStream } from 'fs';

@Injectable()
export class LocalStorageService implements IStorage {
  private readonly logger = new Logger(LocalStorageService.name);

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {}

  async upload(
    file: { buffer: Buffer; originalname: string },
    folder: string,
  ): Promise<string> {
    const filename = `${uuidv4()}${extname(file.originalname)}`;
    const key = join(folder, filename);
    await this.uploadBuffer(file.buffer, key);
    return key;
  }

  async uploadBuffer(buffer: Buffer, key: string): Promise<void> {
    const filePath = join(this.config.local.uploadDir, key);
    const dir = join(filePath, '..');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, buffer);
  }

  getPublicUrl(key: string): string {
    return join(this.config.local.publicRoot, key).replace(/\\/g, '/');
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.config.local.uploadDir, key);
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        this.logger.warn(
          `Failed to delete local file: ${filePath}`,
          error.message,
        );
      }
    }
  }

  async getStream(key: string): Promise<Readable> {
    const filePath = join(this.config.local.uploadDir, key);
    return createReadStream(filePath);
  }
}
