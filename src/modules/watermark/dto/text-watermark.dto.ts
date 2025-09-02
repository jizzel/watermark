import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class TextWatermarkDto {
  @ApiProperty({
    description: 'The text for the watermark.',
    example: '© My Brand 2024',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    description: 'Font size of the text.',
    example: 48,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  fontSize?: number;

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
    example: 0.7,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  opacity?: number;
}
