"use client";

const toTitle = (value: string) =>
  value
    .replace(/\.\d+$/g, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const detailMessages = (details: unknown): string[] => {
  if (!details || typeof details !== "object") return [];

  return Object.entries(details as Record<string, unknown>).flatMap(([field, value]) => {
    const label = toTitle(field);

    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((message) => `${label}: ${message}`);
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return [`${label}: ${value}`];
    }

    return detailMessages(value).map((message) => `${label}: ${message}`);
  });
};

export const getApiErrorMessage = (error: unknown, fallback = "An error occurred") => {
  const maybeError = error as {
    message?: string;
    response?: {
      data?: {
        message?: string;
        error?: {
          message?: string;
          details?: unknown;
        };
        details?: unknown;
      };
    };
  };

  const data = maybeError.response?.data;
  const details = detailMessages(data?.error?.details ?? data?.details);

  if (details.length > 0) {
    return details.slice(0, 6).join("; ");
  }

  return data?.error?.message || data?.message || maybeError.message || fallback;
};

export const normalizeApiError = (error: unknown, fallback?: string) => {
  const normalized = new Error(getApiErrorMessage(error, fallback));
  const maybeError = error as {
    response?: unknown;
    code?: unknown;
  };

  (normalized as Error & { response?: unknown; code?: unknown }).response = maybeError.response;
  (normalized as Error & { response?: unknown; code?: unknown }).code = maybeError.code;

  return normalized;
};
