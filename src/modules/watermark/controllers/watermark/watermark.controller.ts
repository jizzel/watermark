import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { WatermarkService } from '../../services/watermark/watermark.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { multerConfig } from '../../../../app-config/configs/multer.config';
import { TextWatermarkDto } from '../../dto/text-watermark.dto';
import { ImageWatermarkDto } from '../../dto/image-watermark.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  JobCreatedResponseDto,
  JobStatusResponseDto,
} from '../../dto/job-response.dto';

@ApiTags('Watermark')
@Controller('watermark')
export class WatermarkController {
  constructor(private readonly watermarkService: WatermarkService) {}

  @Post('text')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Apply a text watermark to an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file and text watermark options.',
    schema: {
      type: 'object',
      required: ['file', 'text'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The image to which the watermark will be applied.',
        },
        text: {
          type: 'string',
          example: '© My Brand',
          description: 'The text for the watermark.',
        },
        fontSize: {
          type: 'number',
          example: 48,
          description: 'Font size of the text.',
        },
        gravity: {
          type: 'string',
          example: 'southeast',
          description: 'Position of the watermark.',
          enum: [
            'north',
            'northeast',
            'east',
            'southeast',
            'south',
            'southwest',
            'west',
            'northwest',
            'center',
          ],
        },
        opacity: {
          type: 'number',
          format: 'float',
          example: 0.7,
          description: 'Opacity of the watermark (0.0 to 1.0).',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'The job has been successfully queued.',
    type: JobCreatedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request. Missing file or invalid data.',
  })
  async applyTextWatermark(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: TextWatermarkDto,
  ) {
    if (!file) throw new BadRequestException('Image file is required');

    const jobId = await this.watermarkService.enqueueTextJob(file.path, body);

    return { jobId };
  }

  @Post('image')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'watermark', maxCount: 1 },
      ],
      multerConfig,
    ),
  )
  @ApiOperation({ summary: 'Apply an image watermark to another image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Main image, watermark image, and options.',
    schema: {
      type: 'object',
      required: ['file', 'watermark'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The main image.',
        },
        watermark: {
          type: 'string',
          format: 'binary',
          description: 'The watermark image.',
        },
        gravity: {
          type: 'string',
          example: 'southeast',
          description: 'Position of the watermark.',
          enum: [
            'north',
            'northeast',
            'east',
            'southeast',
            'south',
            'southwest',
            'west',
            'northwest',
            'center',
          ],
        },
        opacity: {
          type: 'number',
          format: 'float',
          example: 0.5,
          description: 'Opacity of the watermark (0.0 to 1.0).',
        },
        width: {
          type: 'number',
          example: 150,
          description: 'Width to resize the watermark image to.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'The job has been successfully queued.',
    type: JobCreatedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request. Missing files or invalid data.',
  })
  async applyImageWatermark(
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; watermark?: Express.Multer.File[] },
    @Body() body: ImageWatermarkDto,
  ) {
    if (!files.file?.[0])
      throw new BadRequestException('Image file is required');
    if (!files.watermark?.[0])
      throw new BadRequestException('Watermark image file is required');

    const jobId = await this.watermarkService.enqueueImageJob(
      files.file[0].path,
      {
        ...body,
        watermarkPath: files.watermark[0].path,
      },
    );

    return { jobId };
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get the status of a watermarking job' })
  @ApiParam({
    name: 'jobId',
    type: 'string',
    description: 'The ID of the job to check.',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @ApiOkResponse({
    description: 'The job status was retrieved successfully.',
    type: JobStatusResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.watermarkService.getJobStatus(jobId);
  }
}
