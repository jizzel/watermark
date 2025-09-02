import { Injectable, NotFoundException } from '@nestjs/common';
import { ProducerService } from '../../../../queues/producer/producer.service';
import { InjectModel } from '@nestjs/mongoose';
import { Job as JobSchema, JobDocument } from '../../schemas/job.schema';
import { Model } from 'mongoose';

@Injectable()
export class WatermarkService {
  constructor(
    private readonly producer: ProducerService,
    @InjectModel(JobSchema.name) private readonly jobModel: Model<JobDocument>,
  ) {}

  async enqueueTextJob(inputPath: string, options: any): Promise<string> {
    return this.producer.addTextWatermarkJob({ inputPath, options });
  }

  async enqueueImageJob(inputPath: string, options: any): Promise<string> {
    return this.producer.addImageWatermarkJob({ inputPath, options });
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<JobSchema> {
    const job = await this.jobModel.findOne({ jobId }).exec();
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }
    return job;
  }
}
