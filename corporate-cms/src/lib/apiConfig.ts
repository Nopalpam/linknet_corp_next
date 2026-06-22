const STAGING_BACKEND_ORIGIN = "https://dev-be.lncorp.local";
const API_VERSION_SUFFIX_PATTERN = /\/api\/v\d+\/?$/i;
const API_SUFFIX_PATTERN = /\/api\/?$/i;
const ANY_API_SUFFIX_PATTERN = /\/api(?:\/v\d+)?\/?$/i;

export const getConfiguredBackendUrl = (): string => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const backendUrl = configuredUrl || STAGING_BACKEND_ORIGIN;

  return backendUrl.replace(/\/+$/, "");
};

export const getBackendOrigin = (): string => {
  return getConfiguredBackendUrl().replace(ANY_API_SUFFIX_PATTERN, "");
};

export const getApiBaseUrl = (): string => {
  const backendUrl = getConfiguredBackendUrl();

  if (API_VERSION_SUFFIX_PATTERN.test(backendUrl)) {
    return backendUrl.replace(/\/v\d+\/?$/i, "");
  }

  if (API_SUFFIX_PATTERN.test(backendUrl)) {
    return backendUrl;
  }

  return `${backendUrl}/api`;
};

export const getApiV1BaseUrl = (): string => {
  const backendUrl = getConfiguredBackendUrl();

  if (API_VERSION_SUFFIX_PATTERN.test(backendUrl)) {
    return backendUrl;
  }

  if (API_SUFFIX_PATTERN.test(backendUrl)) {
    return `${backendUrl}/v1`;
  }

  return `${backendUrl}/api/v1`;
};
