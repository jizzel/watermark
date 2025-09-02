import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, unique: true })
  jobId: string;

  @Prop({ enum: ['text', 'image'], required: true })
  type: 'text' | 'image';

  @Prop({
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  })
  status: string;

  @Prop({ required: true })
  inputPath: string;

  @Prop()
  outputPath?: string;

  @Prop({ type: Object })
  options: Record<string, any>;

  @Prop()
  error?: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
