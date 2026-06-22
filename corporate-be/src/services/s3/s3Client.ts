/**
 * AWS S3 Client Configuration
 *
 * Menggunakan IRSA (IAM Role for Service Account) sebagai metode autentikasi.
 * Tidak ada credential statis — AWS SDK v3 secara otomatis mengambil credential
 * melalui default credential provider chain.
 *
 * Required ENV variables:
 *   AWS_REGION    - AWS region (e.g., ap-southeast-3)
 *   AWS_S3_BUCKET - Target S3 bucket name
 *
 * Optional ENV variables:
 *   AWS_S3_PUBLIC_URL - CDN/custom domain URL (e.g., https://cdn.example.com)
 *   AWS_S3_ENDPOINT   - Custom S3-compatible endpoint (e.g., MinIO, DigitalOcean Spaces)
 *
 * Credential resolution order (AWS SDK v3 default):
 *   1. Environment variables (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) — local dev only
 *   2. AWS credential file (~/.aws/credentials) — local dev via AWS CLI profile
 *   3. Web Identity Token / IRSA (EKS) — production
 *   4. IAM Role via instance metadata (EC2, ECS)
 */

import { S3Client } from '@aws-sdk/client-s3';
import logger from '../../utils/logger';

const DEFAULT_AWS_REGION = 'ap-southeast-3';
const DEFAULT_AWS_BUCKET_NAME = '329599622292-jakarta-app-linknetcoid';

const readEnv = (key: string): string => process.env[key]?.trim() || '';

// ============================================================
// S3 Configuration from Environment Variables
// ============================================================

export interface S3Config {
  region: string;
  bucket: string;
  publicUrl: string | null;  // CDN or custom domain URL
  endpoint: string | null;   // Custom S3-compatible endpoint
  regionFallbackUsed: boolean;
  bucketFallbackUsed: boolean;
  bucketEnvName: string;
  isConfigured: boolean;
}

/**
 * Get S3 configuration from environment variables.
 * Returns isConfigured: false if required variables are missing.
 */
export const getS3Config = (): S3Config => {
  const regionEnv = readEnv('AWS_REGION');
  const bucketEnv = readEnv('AWS_S3_BUCKET');
  const bucketAliasEnv = readEnv('AWS_BUCKET_NAME');
  const region = regionEnv || DEFAULT_AWS_REGION;
  const bucket = bucketEnv || bucketAliasEnv || DEFAULT_AWS_BUCKET_NAME;
  const publicUrl = readEnv('AWS_S3_PUBLIC_URL') || null;
  const endpoint = readEnv('AWS_S3_ENDPOINT') || null;

  const isConfigured = !!(region && bucket);

  return {
    region,
    bucket,
    publicUrl,
    endpoint,
    regionFallbackUsed: !regionEnv,
    bucketFallbackUsed: !bucketEnv && !bucketAliasEnv,
    bucketEnvName: bucketEnv ? 'AWS_S3_BUCKET' : (bucketAliasEnv ? 'AWS_BUCKET_NAME' : 'fallback-default'),
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
 * Credential diambil otomatis oleh AWS SDK v3 melalui default credential provider chain.
 * Di production (EKS + IRSA), SDK membaca Web Identity Token yang di-inject oleh Kubernetes.
 * Di local development, SDK membaca ~/.aws/credentials atau environment variables.
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
      // Tidak ada explicit credentials — SDK menggunakan default credential provider chain.
      // Di EKS (IRSA): Web Identity Token otomatis di-inject oleh Kubernetes.
      // Di local: AWS CLI profile (~/.aws/credentials) atau env vars sementara.
    };

    logger.info('[S3] Using default credential provider chain (IRSA / AWS CLI profile)');

    // Custom endpoint support (MinIO, DigitalOcean Spaces, etc.)
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true; // Required for most S3-compatible services
      logger.info('[S3] Using custom endpoint', { endpoint: config.endpoint });
    }

    s3ClientInstance = new S3Client(clientConfig);
    logger.info('[S3] Client initialized', {
      region: config.region,
      bucket: config.bucket,
    });

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
