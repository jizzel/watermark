import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueuesModule } from './queues/queues.module';
import { WatermarkModule } from './modules/watermark/watermark.module';
import { AppConfigModule } from './app-config/app-config.module';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/all-exceptions/all-exceptions.filter';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    QueuesModule,
    WatermarkModule,
    AppConfigModule,
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/watermark',
    ),
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
