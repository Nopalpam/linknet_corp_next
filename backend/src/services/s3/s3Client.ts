/**
 * AWS S3 Client Configuration
 * 
 * Initializes the S3 client using ENV-based configuration.
 * No credentials are hardcoded — all values come from environment variables.
 * 
 * Required ENV variables:
 *   AWS_REGION            - AWS region (e.g., ap-southeast-1)
 *   AWS_ACCESS_KEY_ID     - IAM access key
 *   AWS_SECRET_ACCESS_KEY - IAM secret key
 *   AWS_S3_BUCKET         - Target S3 bucket name
 * 
 * Optional ENV variables:
 *   AWS_S3_PUBLIC_URL     - CDN/custom domain URL (e.g., https://cdn.example.com)
 *   AWS_S3_ENDPOINT       - Custom S3-compatible endpoint (e.g., MinIO, DigitalOcean Spaces)
 * 
 * ⚠️ CATATAN UNTUK MEETING IT:
 *   - Tanyakan apakah menggunakan IAM User atau IAM Role (EC2/ECS)
 *   - Jika IAM Role, AWS SDK v3 otomatis resolve credential dari instance metadata
 *   - Jika pakai CDN (CloudFront), minta CDN URL untuk AWS_S3_PUBLIC_URL
 *   - Tanyakan bucket policy: public-read atau private + presigned URL?
 */

import { S3Client } from '@aws-sdk/client-s3';
import logger from '../../utils/logger';

// ============================================================
// S3 Configuration from Environment Variables
// ============================================================

export interface S3Config {
  region: string;
  bucket: string;
  publicUrl: string | null;  // CDN or custom domain URL
  endpoint: string | null;   // Custom S3-compatible endpoint
  isConfigured: boolean;
}

/**
 * Get S3 configuration from environment variables.
 * Returns isConfigured: false if required variables are missing.
 */
export const getS3Config = (): S3Config => {
  const region = process.env.AWS_REGION || '';
  const bucket = process.env.AWS_S3_BUCKET || '';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
  const publicUrl = process.env.AWS_S3_PUBLIC_URL || null;
  const endpoint = process.env.AWS_S3_ENDPOINT || null;

  // S3 is considered configured if bucket and region are set
  // Credentials may come from IAM Role (no access key needed in that case)
  const isConfigured = !!(region && bucket);

  // If access keys are provided but incomplete, warn
  if ((accessKeyId && !secretAccessKey) || (!accessKeyId && secretAccessKey)) {
    logger.warn('[S3] Incomplete credentials: both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required');
  }

  return {
    region,
    bucket,
    publicUrl,
    endpoint,
    isConfigured,
  };
};

// ============================================================
// S3 Client Singleton
// ============================================================

let s3ClientInstance: S3Client | null = null;

/**
 * Get or create the S3 client singleton.
 * 
 * Credential resolution order (AWS SDK v3 default):
 * 1. Explicit credentials from ENV (AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY)
 * 2. AWS credential file (~/.aws/credentials)
 * 3. IAM Role via instance metadata (EC2, ECS, Lambda)
 * 4. Web Identity Token (EKS)
 * 
 * ⚠️ CATATAN UNTUK MEETING IT:
 *   Jika deploy di EC2/ECS/EKS dengan IAM Role, tidak perlu set
 *   AWS_ACCESS_KEY_ID dan AWS_SECRET_ACCESS_KEY. SDK akan otomatis
 *   mengambil credential dari instance metadata.
 */
export const getS3Client = (): S3Client | null => {
  const config = getS3Config();

  if (!config.isConfigured) {
    logger.warn('[S3] S3 is not configured. Set AWS_REGION and AWS_S3_BUCKET to enable.');
    return null;
  }

  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  try {
    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: config.region,
    };

    // Only set explicit credentials if both are provided
    // Otherwise, let SDK use default credential chain (IAM Role, etc.)
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
      logger.info('[S3] Using explicit IAM credentials from environment variables');
    } else {
      logger.info('[S3] Using default credential chain (IAM Role / instance metadata)');
    }

    // Custom endpoint support (MinIO, DigitalOcean Spaces, etc.)
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true; // Required for most S3-compatible services
      logger.info(`[S3] Using custom endpoint: ${config.endpoint}`);
    }

    s3ClientInstance = new S3Client(clientConfig);
    logger.info(`[S3] Client initialized — Region: ${config.region}, Bucket: ${config.bucket}`);

    return s3ClientInstance;
  } catch (error) {
    logger.error('[S3] Failed to initialize S3 client:', error);
    return null;
  }
};

/**
 * Reset the S3 client (useful for testing or config changes at runtime).
 */
export const resetS3Client = (): void => {
  if (s3ClientInstance) {
    s3ClientInstance.destroy();
    s3ClientInstance = null;
    logger.info('[S3] Client has been reset');
  }
};

export default getS3Client;
