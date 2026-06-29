import { isSafeObjectKey } from './securityInput.util';

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

const isDigit = (char: string): boolean => char >= '0' && char <= '9';
const isPaymentSeparator = (char: string): boolean => char === ' ' || char === '-';

const maskSsn = (value: string): string => {
  let result = '';
  let index = 0;

  while (index < value.length) {
    const candidate = value.slice(index, index + 11);
    const isSsn =
      candidate.length === 11 &&
      isDigit(candidate.charAt(0)) &&
      isDigit(candidate.charAt(1)) &&
      isDigit(candidate.charAt(2)) &&
      candidate.charAt(3) === '-' &&
      isDigit(candidate.charAt(4)) &&
      isDigit(candidate.charAt(5)) &&
      candidate.charAt(6) === '-' &&
      isDigit(candidate.charAt(7)) &&
      isDigit(candidate.charAt(8)) &&
      isDigit(candidate.charAt(9)) &&
      isDigit(candidate.charAt(10));

    if (isSsn) {
      result += '[REDACTED_SSN]';
      index += 11;
      continue;
    }

    result += value.charAt(index);
    index++;
  }

  return result;
};

const maskPaymentNumbers = (value: string): string => {
  let result = '';
  let index = 0;

  while (index < value.length) {
    if (!isDigit(value.charAt(index))) {
      result += value.charAt(index);
      index++;
      continue;
    }

    let cursor = index;
    let digits = 0;
    let lastDigitEnd = index;

    while (cursor < value.length && (isDigit(value.charAt(cursor)) || isPaymentSeparator(value.charAt(cursor)))) {
      if (isDigit(value.charAt(cursor))) {
        digits++;
        lastDigitEnd = cursor + 1;
      }
      cursor++;
    }

    if (digits >= 13 && digits <= 19) {
      result += '[REDACTED_CARD_NUMBER]';
      index = lastDigitEnd;
      continue;
    }

    result += value.charAt(index);
    index++;
  }

  return result;
};

const maskSensitiveString = (value: string): string => maskPaymentNumbers(maskSsn(value));

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
    const redactedEntries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => isSafeObjectKey(key))
      .map(([key, entry]) => [
        key,
        isSensitiveField(key) ? '[REDACTED]' : redactSensitiveValue(entry),
      ]);

    return Object.assign(Object.create(null), Object.fromEntries(redactedEntries));
  }

  return value;
};

export const redactSensitiveData = <T>(value: T): T => redactSensitiveValue(value) as T;
