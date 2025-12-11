import sharp from 'sharp';

interface ThumbnailSizes {
  small: { width: number; height: number };
  medium: { width: number; height: number };
  large: { width: number; height: number };
}

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

interface ThumbnailResult {
  small: ProcessedImage;
  medium: ProcessedImage;
  large: ProcessedImage;
}

class ImageProcessingService {
  private readonly thumbnailSizes: ThumbnailSizes = {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 800, height: 800 },
  };

  private readonly webpQuality = 80;
  private readonly jpegQuality = 85;

  /**
   * Check if file is an image based on mime type
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Get image dimensions and metadata
   */
  async getImageMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    try {
      const metadata = await sharp(buffer).metadata();
      return metadata;
    } catch (error) {
      throw new Error(`Failed to read image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Optimize image - convert to WebP for better compression
   */
  async optimizeImage(buffer: Buffer, options?: { quality?: number; format?: 'webp' | 'jpeg' }): Promise<ProcessedImage> {
    try {
      const format = options?.format || 'webp';
      const quality = options?.quality || (format === 'webp' ? this.webpQuality : this.jpegQuality);

      let pipeline = sharp(buffer);

      // Convert to specified format with optimization
      if (format === 'webp') {
        pipeline = pipeline.webp({ quality });
      } else if (format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality, progressive: true });
      }

      const optimizedBuffer = await pipeline.toBuffer({ resolveWithObject: true });

      return {
        buffer: optimizedBuffer.data,
        width: optimizedBuffer.info.width,
        height: optimizedBuffer.info.height,
        format: optimizedBuffer.info.format,
        size: optimizedBuffer.info.size,
      };
    } catch (error) {
      throw new Error(`Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Resize image to specific dimensions
   */
  async resizeImage(
    buffer: Buffer,
    width: number,
    height: number,
    options?: { fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'; format?: 'webp' | 'jpeg' }
  ): Promise<ProcessedImage> {
    try {
      const format = options?.format || 'webp';
      const fit = options?.fit || 'cover';
      const quality = format === 'webp' ? this.webpQuality : this.jpegQuality;

      let pipeline = sharp(buffer)
        .resize(width, height, {
          fit,
          withoutEnlargement: true,
        });

      // Apply format conversion
      if (format === 'webp') {
        pipeline = pipeline.webp({ quality });
      } else if (format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality, progressive: true });
      }

      const resizedBuffer = await pipeline.toBuffer({ resolveWithObject: true });

      return {
        buffer: resizedBuffer.data,
        width: resizedBuffer.info.width,
        height: resizedBuffer.info.height,
        format: resizedBuffer.info.format,
        size: resizedBuffer.info.size,
      };
    } catch (error) {
      throw new Error(`Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate all thumbnail sizes for an image
   */
  async generateThumbnails(buffer: Buffer, format: 'webp' | 'jpeg' = 'webp'): Promise<ThumbnailResult> {
    try {
      const [small, medium, large] = await Promise.all([
        this.resizeImage(buffer, this.thumbnailSizes.small.width, this.thumbnailSizes.small.height, { format }),
        this.resizeImage(buffer, this.thumbnailSizes.medium.width, this.thumbnailSizes.medium.height, { format }),
        this.resizeImage(buffer, this.thumbnailSizes.large.width, this.thumbnailSizes.large.height, { format }),
      ]);

      return { small, medium, large };
    } catch (error) {
      throw new Error(`Failed to generate thumbnails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Crop image to specific dimensions
   */
  async cropImage(
    buffer: Buffer,
    left: number,
    top: number,
    width: number,
    height: number,
    format: 'webp' | 'jpeg' = 'webp'
  ): Promise<ProcessedImage> {
    try {
      const quality = format === 'webp' ? this.webpQuality : this.jpegQuality;

      let pipeline = sharp(buffer)
        .extract({ left, top, width, height });

      // Apply format conversion
      if (format === 'webp') {
        pipeline = pipeline.webp({ quality });
      } else if (format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality, progressive: true });
      }

      const croppedBuffer = await pipeline.toBuffer({ resolveWithObject: true });

      return {
        buffer: croppedBuffer.data,
        width: croppedBuffer.info.width,
        height: croppedBuffer.info.height,
        format: croppedBuffer.info.format,
        size: croppedBuffer.info.size,
      };
    } catch (error) {
      throw new Error(`Failed to crop image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rotate image
   */
  async rotateImage(buffer: Buffer, angle: number, format: 'webp' | 'jpeg' = 'webp'): Promise<ProcessedImage> {
    try {
      const quality = format === 'webp' ? this.webpQuality : this.jpegQuality;

      let pipeline = sharp(buffer).rotate(angle);

      // Apply format conversion
      if (format === 'webp') {
        pipeline = pipeline.webp({ quality });
      } else if (format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality, progressive: true });
      }

      const rotatedBuffer = await pipeline.toBuffer({ resolveWithObject: true });

      return {
        buffer: rotatedBuffer.data,
        width: rotatedBuffer.info.width,
        height: rotatedBuffer.info.height,
        format: rotatedBuffer.info.format,
        size: rotatedBuffer.info.size,
      };
    } catch (error) {
      throw new Error(`Failed to rotate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert image to grayscale
   */
  async grayscale(buffer: Buffer, format: 'webp' | 'jpeg' = 'webp'): Promise<ProcessedImage> {
    try {
      const quality = format === 'webp' ? this.webpQuality : this.jpegQuality;

      let pipeline = sharp(buffer).grayscale();

      // Apply format conversion
      if (format === 'webp') {
        pipeline = pipeline.webp({ quality });
      } else if (format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality, progressive: true });
      }

      const grayscaleBuffer = await pipeline.toBuffer({ resolveWithObject: true });

      return {
        buffer: grayscaleBuffer.data,
        width: grayscaleBuffer.info.width,
        height: grayscaleBuffer.info.height,
        format: grayscaleBuffer.info.format,
        size: grayscaleBuffer.info.size,
      };
    } catch (error) {
      throw new Error(`Failed to convert to grayscale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add watermark to image
   */
  async addWatermark(
    buffer: Buffer,
    watermarkBuffer: Buffer,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'bottom-right'
  ): Promise<ProcessedImage> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Resize watermark to 20% of image width
      const watermarkWidth = Math.floor((metadata.width || 800) * 0.2);
      const resizedWatermark = await sharp(watermarkBuffer)
        .resize(watermarkWidth)
        .toBuffer();

      const watermarkMetadata = await sharp(resizedWatermark).metadata();

      // Calculate position
      let left = 0;
      let top = 0;

      const padding = 20;

      switch (position) {
        case 'top-left':
          left = padding;
          top = padding;
          break;
        case 'top-right':
          left = (metadata.width || 0) - (watermarkMetadata.width || 0) - padding;
          top = padding;
          break;
        case 'bottom-left':
          left = padding;
          top = (metadata.height || 0) - (watermarkMetadata.height || 0) - padding;
          break;
        case 'bottom-right':
          left = (metadata.width || 0) - (watermarkMetadata.width || 0) - padding;
          top = (metadata.height || 0) - (watermarkMetadata.height || 0) - padding;
          break;
        case 'center':
          left = ((metadata.width || 0) - (watermarkMetadata.width || 0)) / 2;
          top = ((metadata.height || 0) - (watermarkMetadata.height || 0)) / 2;
          break;
      }

      const watermarkedBuffer = await image
        .composite([
          {
            input: resizedWatermark,
            top: Math.floor(top),
            left: Math.floor(left),
          },
        ])
        .toBuffer({ resolveWithObject: true });

      return {
        buffer: watermarkedBuffer.data,
        width: watermarkedBuffer.info.width,
        height: watermarkedBuffer.info.height,
        format: watermarkedBuffer.info.format,
        size: watermarkedBuffer.info.size,
      };
    } catch (error) {
      throw new Error(`Failed to add watermark: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get thumbnail sizes configuration
   */
  getThumbnailSizes(): ThumbnailSizes {
    return this.thumbnailSizes;
  }
}

export default new ImageProcessingService();
