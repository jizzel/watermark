import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IStorage } from '../storage.interface';
import type { ConfigType } from '@nestjs/config';
import { storageConfig } from '../../../app-config/configs/storage.config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { Readable } from 'stream';

@Injectable()
export class S3StorageService implements IStorage, OnModuleInit {
  private s3Client: S3Client;

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {}

  onModuleInit() {
    const { endpoint, accessKeyId, secretAccessKey, bucket } = this.config.s3;

    if (endpoint && accessKeyId && secretAccessKey && bucket) {
      this.s3Client = new S3Client({
        endpoint,
        region: 'auto',
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else if (endpoint || accessKeyId || secretAccessKey || bucket) {
      // If we get here, at least one is defined but not all
      console.log(
        'S3 storage is not fully configured. Please check your environment variables. ' +
          'Else local storage may be be used',
      );
      throw new Error(
        'S3 storage is not fully configured. Please check your environment variables.',
      );
    }
  }

  async upload(
    file: { buffer: Buffer; mimetype: string; originalname: string },
    folder: string,
  ): Promise<string> {
    const filename = `${uuidv4()}${extname(file.originalname)}`;
    const key = join(folder, filename).replace(/\\/g, '/');
    await this.uploadBuffer(file.buffer, key, file.mimetype);
    return key;
  }

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    mimetype: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });
    await this.s3Client.send(command);
  }

  getPublicUrl(key: string): string {
    if (!this.config.s3.endpoint || !this.config.s3.bucket) {
      throw new Error('S3 endpoint or bucket is not configured.');
    }
    const endpoint = new URL(this.config.s3.endpoint);
    return `${endpoint.protocol}//${this.config.s3.bucket}.${endpoint.host}/${key}`;
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  async getStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: key,
    });
    const { Body } = await this.s3Client.send(command);
    if (Body instanceof Readable) {
      return Body;
    }
    throw new Error('Could not get readable stream from S3 object body.');
  }
}
