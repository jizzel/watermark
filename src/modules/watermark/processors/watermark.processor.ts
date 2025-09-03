import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job as BullJob } from 'bullmq';
import { Job as JobSchema, JobDocument } from '../schemas/job.schema';
import { ImageUtil } from '../../../utils/image.util';
import * as storageInterface from '../../../modules/storage/storage.interface';
import { Readable } from 'stream';

@Processor('watermark', {
  concurrency: parseInt(process.env.CONCURRENCY || '2', 10),
})
export class WatermarkProcessor extends WorkerHost {
  private readonly logger = new Logger(WatermarkProcessor.name);

  constructor(
    @InjectModel(JobSchema.name) private readonly jobModel: Model<JobDocument>,
    @Inject(storageInterface.STORAGE_SERVICE)
    private readonly storageService: storageInterface.IStorage,
  ) {
    super();
  }

  private async getBufferFromStream(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async process(job: BullJob<any>): Promise<any> {
    const { name, id, data } = job;
    this.logger.log(`Processing job ${id} of type ${name}`);

    await this.jobModel.updateOne(
      { jobId: id },
      { $set: { status: 'processing' } },
    );

    try {
      const { inputPath, options } = data;
      const inputStream = await this.storageService.getStream(inputPath);
      const inputBuffer = await this.getBufferFromStream(inputStream);

      let outputBuffer: Buffer;

      if (name === 'text-watermark') {
        outputBuffer = await ImageUtil.applyTextWatermark(inputBuffer, options);
      } else if (name === 'image-watermark') {
        const watermarkStream = await this.storageService.getStream(
          options.watermarkPath,
        );
        const watermarkBuffer = await this.getBufferFromStream(watermarkStream);
        outputBuffer = await ImageUtil.applyImageWatermark(
          inputBuffer,
          watermarkBuffer,
          options,
        );
      } else {
        throw new Error(`Unsupported job type: ${name}`);
      }

      const outputKey = `processed/${id}.png`;
      await this.storageService.uploadBuffer(
        outputBuffer,
        outputKey,
        'image/png',
      );

      const publicUrl = this.storageService.getPublicUrl(outputKey);

      await this.jobModel.updateOne(
        { jobId: id },
        { $set: { status: 'completed', outputPath: publicUrl } },
      );

      // Clean up raw files
      await this.storageService.delete(inputPath);
      if (name === 'image-watermark') {
        await this.storageService.delete(options.watermarkPath);
      }

      return { url: publicUrl };
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
