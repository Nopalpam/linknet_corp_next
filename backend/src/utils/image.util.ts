import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessedImage {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  size: number;
}

/**
 * Process and optimize image for avatar
 * - Resize to 400x400
 * - Convert to WebP format for better compression
 * - Optimize quality
 */
export const processAvatarImage = async (
  imageBuffer: Buffer
): Promise<ProcessedImage> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const filename = `avatar-${timestamp}-${uniqueId}.webp`;

    // Process image with sharp
    const processedBuffer = await sharp(imageBuffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toBuffer();

    return {
      buffer: processedBuffer,
      filename,
      mimetype: 'image/webp',
      size: processedBuffer.length
    };
  } catch (error) {
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate image dimensions and format
 */
export const validateImage = async (imageBuffer: Buffer): Promise<boolean> => {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    // Check if it's a valid image
    if (!metadata.format || !metadata.width || !metadata.height) {
      return false;
    }

    // Check if dimensions are reasonable (min 100x100, max 5000x5000)
    if (metadata.width < 100 || metadata.height < 100) {
      return false;
    }

    if (metadata.width > 5000 || metadata.height > 5000) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Get image metadata
 */
export const getImageMetadata = async (imageBuffer: Buffer) => {
  try {
    return await sharp(imageBuffer).metadata();
  } catch (error) {
    throw new Error(`Failed to read image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
