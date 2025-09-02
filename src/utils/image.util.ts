import sharp from 'sharp';
import { promises as fs } from 'fs';

export class ImageUtil {
  /**
   * Apply a text watermark to an image.
   * @param inputPath Path of the input image
   * @param options Watermark options
   * @param outputPath Path to save the processed image
   */
  static async applyTextWatermark(
    inputPath: string,
    options: {
      text: string;
      fontSize?: number;
      gravity?:
        | 'north'
        | 'northeast'
        | 'east'
        | 'southeast'
        | 'south'
        | 'southwest'
        | 'west'
        | 'northwest'
        | 'center';
      opacity?: number;
    },
    outputPath: string,
  ): Promise<void> {
    const {
      text,
      fontSize = 48,
      gravity = 'southeast',
      opacity = 0.7,
    } = options;

    const image = sharp(inputPath);
    const { width, height } = await image.metadata();

    if (!width || !height) {
      throw new Error('Unable to determine image dimensions');
    }

    // Position the text based on gravity
    let x: string;
    let y: string;
    let textAnchor: string;

    switch (gravity) {
      case 'northwest':
        x = '5%';
        y = '10%';
        textAnchor = 'start';
        break;
      case 'north':
        x = '50%';
        y = '10%';
        textAnchor = 'middle';
        break;
      case 'northeast':
        x = '95%';
        y = '10%';
        textAnchor = 'end';
        break;
      case 'west':
        x = '5%';
        y = '50%';
        textAnchor = 'start';
        break;
      case 'center':
        x = '50%';
        y = '50%';
        textAnchor = 'middle';
        break;
      case 'east':
        x = '95%';
        y = '50%';
        textAnchor = 'end';
        break;
      case 'southwest':
        x = '5%';
        y = '90%';
        textAnchor = 'start';
        break;
      case 'south':
        x = '50%';
        y = '90%';
        textAnchor = 'middle';
        break;
      case 'southeast':
      default:
        x = '95%';
        y = '90%';
        textAnchor = 'end';
        break;
    }

    // Escape text for XML
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const svgText = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .watermark { 
            fill: rgba(255, 255, 255, ${Math.max(0, Math.min(1, opacity))}); 
            font-size: ${Math.max(8, fontSize)}px; 
            font-weight: bold;
            font-family: Arial, sans-serif;
          }
        </style>
        <text x="${x}" y="${y}" text-anchor="${textAnchor}" dy=".3em" class="watermark">${escapedText}</text>
      </svg>
    `;

    await image
      .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
      .toFile(outputPath);
  }

  /**
   * Apply an image watermark (logo) to an image.
   * @param inputPath Path of the input image
   * @param options Watermark options
   * @param outputPath Path to save the processed image
   */
  static async applyImageWatermark(
    inputPath: string,
    options: {
      watermarkPath: string;
      gravity?:
        | 'north'
        | 'northeast'
        | 'east'
        | 'southeast'
        | 'south'
        | 'southwest'
        | 'west'
        | 'northwest'
        | 'center';
      opacity?: number;
      width?: number;
    },
    outputPath: string,
  ): Promise<void> {
    const {
      watermarkPath,
      gravity = 'southeast',
      opacity = 0.5,
      width: watermarkWidth,
    } = options;

    // Validate inputs
    const clampedOpacity = Math.max(0, Math.min(1, opacity));

    const image = sharp(inputPath);
    const { width: imageWidth, height: imageHeight } = await image.metadata();

    if (!imageWidth || !imageHeight) {
      throw new Error('Unable to determine main image dimensions');
    }

    // Check if watermark file exists
    try {
      await fs.access(watermarkPath);
    } catch (error) {
      throw new Error(`Watermark file not found: ${watermarkPath} ${error}`);
    }

    // Calculate watermark size
    const resizeWidth = watermarkWidth || Math.round(imageWidth * 0.25);

    // Process watermark with proper error handling
    let watermarkBuffer: Buffer;
    try {
      watermarkBuffer = await sharp(watermarkPath)
        .resize(resizeWidth, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .ensureAlpha()
        .modulate({ brightness: 1, saturation: 1 })
        .composite([
          {
            input: Buffer.from([
              255,
              255,
              255,
              Math.floor(255 * clampedOpacity),
            ]),
            raw: { width: 1, height: 1, channels: 4 },
            tile: true,
            blend: 'dest-in',
          },
        ])
        .png()
        .toBuffer();
    } catch (error) {
      throw new Error(`Failed to process watermark image: ${error}`);
    }

    await image
      .composite([
        {
          input: watermarkBuffer,
          gravity: gravity as any, // Sharp's gravity type is more restrictive
          blend: 'over',
        },
      ])
      .toFile(outputPath);
  }

  /**
   * Delete a file safely
   * @param filePath Path to the file to delete
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath); // Check if file exists first
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.warn(`Failed to delete file: ${filePath}`, error.message);
      }
      // Silently ignore if file doesn't exist
    }
  }
}
