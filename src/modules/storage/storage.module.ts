import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  storageConfig,
  StorageDriver,
} from '../../app-config/configs/storage.config';
import { STORAGE_SERVICE } from './storage.interface';
import { LocalStorageService } from './services/local-storage.service';
import { S3StorageService } from './services/s3-storage.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(storageConfig)],
  providers: [
    LocalStorageService,
    S3StorageService,
    {
      provide: STORAGE_SERVICE,
      inject: [storageConfig.KEY, LocalStorageService, S3StorageService],
      useFactory: (
        config: ConfigType<typeof storageConfig>,
        local: LocalStorageService,
        s3: S3StorageService,
      ) => (config.driver === StorageDriver.S3 ? s3 : local),
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
