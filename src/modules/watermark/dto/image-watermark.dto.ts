import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ImageWatermarkDto {
  @ApiPropertyOptional({
    description: 'Position of the watermark.',
    example: 'southeast',
    enum: ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'center'],
  })
  @IsOptional()
  @IsIn(['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'center'])
  gravity?: string;

  @ApiPropertyOptional({
    description: 'Opacity of the watermark (0.0 to 1.0).',
    example: 0.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  opacity?: number;

  @ApiPropertyOptional({
    description: 'Width to resize the watermark image to in pixels.',
    example: 150,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  width?: number;
}
