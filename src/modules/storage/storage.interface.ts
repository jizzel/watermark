import { Readable } from 'stream';
import { StorageDriver } from '../../app-config/configs/storage.config';

export interface IStorage {
  upload(
    file: { buffer: Buffer; mimetype: string; originalname: string },
    folder: string,
  ): Promise<string>;

  uploadBuffer(buffer: Buffer, key: string, mimetype: string): Promise<void>;
  getPublicUrl(key: string): string;
  delete(key: string): Promise<void>;
  getStream(key: string): Promise<Readable>;
}

/**
 * Defines the structure for local storage configuration.
 */
interface LocalConfig {
  uploadDir: string;
  publicRoot: string;
}

/**
 * Defines the structure for S3 (Cloudflare R2) configuration.
 */
interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

/**
 * Represents the configuration when the driver is 'local'.
 * This is a "discriminated union" based on the 'driver' property.
 */
interface LocalDriverConfig {
  driver: 'local';
  local: LocalConfig;
}

/**
 * Represents the configuration when the driver is 's3'.
 * This is also a "discriminated union".
 */
interface S3DriverConfig {
  driver: 's3';
  s3: S3Config;
}

export interface DriverConfig {
  driver: StorageDriver;
  local: LocalConfig;
  s3: S3Config;
}

/**
 * The main type for the application's storage configuration.
 * It can be either an S3 configuration or a local one.
 */
export type StorageConfig = S3DriverConfig | LocalDriverConfig;

export const STORAGE_SERVICE = 'STORAGE_SERVICE';
