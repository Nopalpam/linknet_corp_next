const API_PREFIX_PATTERN = /\/api\/v\d+\/?$/;

export const getBackendOrigin = (): string => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL || "https://dev-be.lncorp.local";
  return configuredUrl.replace(API_PREFIX_PATTERN, "").replace(/\/$/, "");
};

export const normalizeBackendAssetUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${getBackendOrigin()}${url}`;
  }

  return `${getBackendOrigin()}/${url}`;
};
