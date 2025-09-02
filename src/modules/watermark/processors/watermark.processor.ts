import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job as BullJob } from 'bullmq';
import { Job as JobSchema, JobDocument } from '../schemas/job.schema';
import { join } from 'path';
import { ImageUtil } from '../../../utils/image.util';

@Processor('watermark', {
  concurrency: parseInt(process.env.CONCURRENCY || '2', 10),
})
export class WatermarkProcessor extends WorkerHost {
  private readonly logger = new Logger(WatermarkProcessor.name);

  constructor(
    @InjectModel(JobSchema.name) private readonly jobModel: Model<JobDocument>,
  ) {
    super();
  }

  async process(job: BullJob<any>): Promise<any> {
    const { name, id, data } = job;
    this.logger.log(`Processing job ${id} of type ${name}`);

    await this.jobModel.updateOne(
      { jobId: id },
      { $set: { status: 'processing' } },
    );

    try {
      const outputPath = join('./uploads/processed', `${id}.png`);
      if (name === 'text-watermark') {
        await ImageUtil.applyTextWatermark(data.inputPath, data.options, outputPath);
      } else if (name === 'image-watermark') {
        await ImageUtil.applyImageWatermark(
          data.inputPath,
          data.options,
          outputPath,
        );
      }

      await this.jobModel.updateOne(
        { jobId: id },
        { $set: { status: 'completed', outputPath } },
      );

      return { outputPath };
    } catch (err: any) {
      this.logger.error(`Job ${id} failed: ${err.message}`);
      await this.jobModel.updateOne(
        { jobId: id },
        { $set: { status: 'failed', error: err.message } },
      );
      throw err;
    }
  }
}
