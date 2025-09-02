import { ApiProperty } from '@nestjs/swagger';

export class JobCreatedResponseDto {
  @ApiProperty({
    description: 'The unique identifier for the queued job.',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  jobId: string;
}

export class JobStatusResponseDto {
  @ApiProperty({
    description: 'The unique identifier for the job.',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  jobId: string;

  @ApiProperty({
    description: 'The type of watermark job.',
    enum: ['text', 'image'],
    example: 'text',
  })
  type: 'text' | 'image';

  @ApiProperty({
    description: 'The current status of the job.',
    enum: ['queued', 'processing', 'completed', 'failed'],
    example: 'completed',
  })
  status: string;

  @ApiProperty({
    description: 'The path to the original uploaded file.',
    example: 'uploads/raw/image.png',
  })
  inputPath: string;

  @ApiProperty({
    description: 'The path to the processed image with the watermark.',
    example: 'uploads/processed/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6.png',
    required: false,
  })
  outputPath?: string;

  @ApiProperty({
    description: 'The options provided for the watermarking job.',
    type: 'object',
    example: { text: 'Hello World', fontSize: 48 },
    additionalProperties: true,
  })
  options: Record<string, any>;

  @ApiProperty({
    description: 'Error message if the job failed.',
    required: false,
    example: 'File format not supported.',
  })
  error?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
