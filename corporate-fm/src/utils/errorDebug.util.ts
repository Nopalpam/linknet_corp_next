type ErrorWithMetadata = Error & {
  code?: string;
  Code?: string;
  $metadata?: {
    httpStatusCode?: number;
    requestId?: string;
    extendedRequestId?: string;
  };
};

export type ErrorDiagnostic = {
  code: string;
  statusCode: number;
  source: 'corporate-fm' | 'aws-s3' | 'network' | 'cors' | 'validation';
  message: string;
  likelyCause: string;
  awsRequestId?: string;
};

const getErrorCode = (error: unknown): string => {
  const candidate = error as Partial<ErrorWithMetadata>;
  return (
    candidate.code ||
    candidate.Code ||
    candidate.name ||
    (typeof candidate.message === 'string' ? candidate.message : 'UnknownError')
  );
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unknown error';
};

const isTimeoutOrNetworkError = (code: string, message: string): boolean => {
  const normalized = `${code} ${message}`.toLowerCase();
  return [
    'timeout',
    'timedout',
    'etimedout',
    'econnreset',
    'enotfound',
    'eai_again',
    'network',
    'socket',
    'dns',
  ].some((needle) => normalized.includes(needle));
};

export const classifyError = (error: unknown): ErrorDiagnostic => {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);
  const statusCode = (error as Partial<ErrorWithMetadata>)?.$metadata?.httpStatusCode;
  const awsRequestId = (error as Partial<ErrorWithMetadata>)?.$metadata?.requestId;
  const normalized = `${code} ${message}`.toLowerCase();

  if (code === 'AccessDenied' || statusCode === 403) {
    return {
      code: 'AccessDenied',
      statusCode: 403,
      source: 'aws-s3',
      message: 'S3 rejected the request with AccessDenied',
      likelyCause: 'IAM Role or bucket policy likely does not allow this action for the target bucket/prefix.',
      awsRequestId,
    };
  }

  if (code === 'NoSuchBucket' || normalized.includes('specified bucket does not exist')) {
    return {
      code: 'NoSuchBucket',
      statusCode: 404,
      source: 'aws-s3',
      message: 'S3 bucket was not found',
      likelyCause: 'Bucket name may be wrong, missing, deleted, or the runtime points to the wrong environment.',
      awsRequestId,
    };
  }

  if (
    code === 'PermanentRedirect' ||
    code === 'AuthorizationHeaderMalformed' ||
    code === 'IllegalLocationConstraintException' ||
    statusCode === 301 ||
    (normalized.includes('region') && normalized.includes('wrong')) ||
    (normalized.includes('region') && normalized.includes('redirect')) ||
    normalized.includes('location constraint')
  ) {
    return {
      code: 'BucketRegionMismatch',
      statusCode: statusCode || 400,
      source: 'aws-s3',
      message: 'S3 bucket region mismatch',
      likelyCause: 'AWS_REGION does not match the bucket region, or the S3 endpoint points to a different region.',
      awsRequestId,
    };
  }

  if (code === 'InvalidBucketName') {
    return {
      code: 'InvalidBucketName',
      statusCode: 400,
      source: 'aws-s3',
      message: 'S3 bucket name is invalid',
      likelyCause: 'AWS_BUCKET_NAME/AWS_S3_BUCKET is empty, malformed, or not the expected LinkNet bucket name.',
      awsRequestId,
    };
  }

  if (code === 'CredentialsProviderError' || message.includes('Could not load credentials')) {
    return {
      code: 'CredentialsProviderError',
      statusCode: 503,
      source: 'aws-s3',
      message: 'AWS credentials could not be resolved by the default provider chain',
      likelyCause: 'IAM Role, IRSA, pod identity, or local AWS profile is not available to the runtime.',
      awsRequestId,
    };
  }

  if (code === 'SignatureDoesNotMatch') {
    return {
      code: 'SignatureDoesNotMatch',
      statusCode: 403,
      source: 'aws-s3',
      message: 'S3 signature validation failed',
      likelyCause: 'AWS signing, region, endpoint, or credential source may not match the bucket.',
      awsRequestId,
    };
  }

  if (isTimeoutOrNetworkError(code, message)) {
    return {
      code: 'NetworkingError',
      statusCode: 504,
      source: 'network',
      message: 'Network error while calling AWS S3',
      likelyCause: 'Runtime may not reach AWS S3 because of network, DNS, proxy, VPN, firewall, or timeout issues.',
      awsRequestId,
    };
  }

  if (code === 'CORS_ORIGIN_DENIED' || message.toLowerCase().includes('cors')) {
    return {
      code: 'CORS_ORIGIN_DENIED',
      statusCode: 403,
      source: 'cors',
      message: 'Origin is not allowed by corporate-fm CORS policy',
      likelyCause: 'CMS origin is not listed in ALLOWED_ORIGINS for corporate-fm.',
    };
  }

  if (message.includes('File too large')) {
    return {
      code: 'PayloadTooLarge',
      statusCode: 413,
      source: 'validation',
      message: 'Uploaded payload is too large',
      likelyCause: 'File size exceeds MAX_FILE_SIZE_MB or multer upload limits.',
    };
  }

  if (message.toLowerCase().includes('not allowed') || message.toLowerCase().includes('file type')) {
    return {
      code: 'UnsupportedFileType',
      statusCode: 415,
      source: 'validation',
      message: 'File type is not supported',
      likelyCause: 'Extension or MIME type validation rejected the file.',
    };
  }

  return {
    code,
    statusCode: statusCode || 500,
    source: 'corporate-fm',
    message: 'File manager service failed while processing the request',
    likelyCause: message || 'Unhandled corporate-fm error. Check service logs with the request ID.',
    awsRequestId,
  };
};

export const toSafeErrorLog = (
  error: unknown,
  requestId?: string,
  extra?: Record<string, unknown>
): Record<string, unknown> => {
  const diagnostic = classifyError(error);
  return {
    requestId,
    code: diagnostic.code,
    source: diagnostic.source,
    statusCode: diagnostic.statusCode,
    message: getErrorMessage(error),
    awsRequestId: diagnostic.awsRequestId,
    ...extra,
  };
};
