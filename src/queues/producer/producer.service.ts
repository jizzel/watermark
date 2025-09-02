import { v4 as uuidv4 } from 'uuid';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from '../../modules/watermark/schemas/job.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);

  constructor(
    @InjectQueue('watermark') private readonly watermarkQueue: Queue,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
  ) {}

  async addTextWatermarkJob(payload: any): Promise<string> {
    const jobId = uuidv4();
    await this.jobModel.create({
      jobId,
      type: 'text',
      status: 'queued',
      inputPath: payload.inputPath,
      options: payload.options,
    });
    await this.watermarkQueue.add('text-watermark', payload, { jobId });
    this.logger.log(`Enqueued text watermark job: ${jobId}`);
    return jobId;
  }

  async addImageWatermarkJob(payload: any): Promise<string> {
    const jobId = uuidv4();
    await this.jobModel.create({
      jobId,
      type: 'image',
      status: 'queued',
      inputPath: payload.inputPath,
      options: payload.options,
    });
    await this.watermarkQueue.add('image-watermark', payload, { jobId });
    this.logger.log(`Enqueued image watermark job: ${jobId}`);
    return jobId;
  }
}
