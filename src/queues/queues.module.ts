import { Module } from '@nestjs/common';
import { ProducerService } from './producer/producer.service';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from '../app-config/app-config.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSchema } from '../modules/watermark/schemas/job.schema';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
        defaultJobOptions: {
          attempts: 3,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'watermark' }),
    MongooseModule.forFeature([{ name: 'Job', schema: JobSchema }]),
  ],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class QueuesModule {}
