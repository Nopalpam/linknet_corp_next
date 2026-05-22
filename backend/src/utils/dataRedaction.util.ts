const SENSITIVE_FIELD_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /otp/i,
  /mfa/i,
  /credit.?card/i,
  /card.?number/i,
  /\bpan\b/i,
  /\bssn\b/i,
];

const PAYMENT_NUMBER_PATTERN = /\b(?:\d[ -]*?){13,19}\b/g;
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;

const maskSensitiveString = (value: string): string =>
  value
    .replace(PAYMENT_NUMBER_PATTERN, '[REDACTED_CARD_NUMBER]')
    .replace(SSN_PATTERN, '[REDACTED_SSN]');

const isSensitiveField = (key: string): boolean =>
  SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(key));

const redactSensitiveValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return maskSensitiveString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValue(item));
  }

  if (typeof value === 'object') {
    const redacted: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      redacted[key] = isSensitiveField(key) ? '[REDACTED]' : redactSensitiveValue(entry);
    }

    return redacted;
  }

  return value;
};

export const redactSensitiveData = <T>(value: T): T => redactSensitiveValue(value) as T;
