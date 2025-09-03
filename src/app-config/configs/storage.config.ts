import { registerAs } from '@nestjs/config';

export enum StorageDriver {
  LOCAL = 'local',
  S3 = 's3',
}

export const storageConfig = registerAs('storage', () => {
  const driver =
    process.env.CLOUDFLARE_R2_ENDPOINT &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
      ? StorageDriver.S3
      : StorageDriver.LOCAL;

  return {
    driver,
    local: {
      uploadDir: process.env.UPLOAD_DIR || './uploads',
      publicRoot: process.env.PUBLIC_ROOT || '/static',
    },
    s3: {
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      bucket: process.env.CLOUDFLARE_R2_BUCKET,
    },
  };
});
