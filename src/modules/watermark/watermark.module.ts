import { Module } from '@nestjs/common';
import { WatermarkService } from './services/watermark/watermark.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QueuesModule } from '../../queues/queues.module';
import { Job, JobSchema } from './schemas/job.schema';
import { WatermarkProcessor } from './processors/watermark.processor';
import { WatermarkController } from './controllers/watermark/watermark.controller';

@Module({
  imports: [
    QueuesModule,
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
  ],
  providers: [WatermarkService, WatermarkProcessor],
  exports: [WatermarkService],
  controllers: [WatermarkController],
})
export class WatermarkModule {}
