import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Credentials (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) intentionally omitted.
// In production the SDK resolves credentials automatically via IRSA
// (IAM Role for Service Account). In local development, credentials are
// resolved from the AWS CLI profile / environment variables set by the
// developer — no static keys are read by this application.
const REQUIRED_ENV: string[] = [
  'AWS_REGION',
  'AWS_BUCKET_NAME',
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// No explicit `credentials` block — the AWS SDK default credential provider
// chain handles resolution:
//   1. Environment variables (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) — local dev
//   2. AWS CLI shared credentials file (~/.aws/credentials) — local dev
//   3. EKS Pod Identity / IRSA token projection — production (EKS)
export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
});

export const AWS_BUCKET_NAME: string = process.env.AWS_BUCKET_NAME!;

// CDN_URL should be host only (no trailing slash), e.g. d24cmpzg3ht16e.cloudfront.net
export const CDN_URL: string = process.env.CDN_URL || '';
