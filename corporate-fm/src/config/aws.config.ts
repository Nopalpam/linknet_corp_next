import { S3Client } from '@aws-sdk/client-s3';
import './env-loader';

const DEFAULT_AWS_REGION = 'ap-southeast-3';
const DEFAULT_AWS_BUCKET_NAME = '329599622292-jakarta-app-linknetcoid';

const readEnv = (key: string): string => process.env[key]?.trim() || '';

// Credentials (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) intentionally omitted.
// In production the SDK resolves credentials automatically via IRSA
// (IAM Role for Service Account). In local development, credentials are
// resolved from the AWS CLI profile / environment variables set by the
// developer — no static keys are read by this application.
const AWS_REGION_ENV_VALUE = readEnv('AWS_REGION');
const AWS_BUCKET_NAME_ENV_VALUE = readEnv('AWS_BUCKET_NAME');
const AWS_S3_BUCKET_ENV_VALUE = readEnv('AWS_S3_BUCKET');
const AWS_REGION = AWS_REGION_ENV_VALUE || DEFAULT_AWS_REGION;
const AWS_BUCKET_NAME_VALUE =
  AWS_BUCKET_NAME_ENV_VALUE || AWS_S3_BUCKET_ENV_VALUE || DEFAULT_AWS_BUCKET_NAME;
const AWS_BUCKET_ENV_NAME = AWS_BUCKET_NAME_ENV_VALUE
  ? 'AWS_BUCKET_NAME'
  : (AWS_S3_BUCKET_ENV_VALUE ? 'AWS_S3_BUCKET' : 'fallback-default');
const AWS_S3_ENDPOINT = readEnv('AWS_S3_ENDPOINT');

// No explicit `credentials` block — the AWS SDK default credential provider
// chain handles resolution:
//   1. Environment variables (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) — local dev
//   2. AWS CLI shared credentials file (~/.aws/credentials) — local dev
//   3. EKS Pod Identity / IRSA token projection — production (EKS)
export const s3Client = new S3Client({
  region: AWS_REGION,
  ...(AWS_S3_ENDPOINT
    ? {
        endpoint: AWS_S3_ENDPOINT,
        forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE !== 'false',
      }
    : {}),
});

export const AWS_REGION_NAME: string = AWS_REGION;
export const AWS_BUCKET_NAME: string = AWS_BUCKET_NAME_VALUE;
export const AWS_BUCKET_ENV: string = AWS_BUCKET_ENV_NAME;
export const AWS_ENDPOINT: string = AWS_S3_ENDPOINT || '';
export const AWS_REGION_SOURCE: string = AWS_REGION_ENV_VALUE ? 'AWS_REGION' : 'fallback-default';
export const AWS_REGION_FALLBACK_USED: boolean = !AWS_REGION_ENV_VALUE;
export const AWS_BUCKET_FALLBACK_USED: boolean = !AWS_BUCKET_NAME_ENV_VALUE && !AWS_S3_BUCKET_ENV_VALUE;

// CDN_URL should be host only (no trailing slash), e.g. d24cmpzg3ht16e.cloudfront.net
export const CDN_URL: string = process.env.CDN_URL || '';
