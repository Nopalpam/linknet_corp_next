const PUBLIC_CONTENT_API_BASE_URL = '/api/content';

function buildPublicContentUrl(endpoint) {
  const normalizedEndpoint = String(endpoint || '').startsWith('/')
    ? String(endpoint || '')
    : `/${endpoint || ''}`;
  return `${PUBLIC_CONTENT_API_BASE_URL}${normalizedEndpoint}`;
}

export async function fetchPublicContent(endpoint, init = {}) {
  const response = await fetch(buildPublicContentUrl(endpoint), {
    cache: 'no-store',
    ...init,
  });

  if (!response.ok) {
    const requestId = response.headers.get('x-request-id');
    const error = new Error(`Public content request failed with status ${response.status}`);
    error.status = response.status;
    error.requestId = requestId;
    console.error('[Public Content API] request failed', {
      endpoint,
      status: response.status,
      requestId,
      upstreamRequestId: response.headers.get('x-upstream-request-id'),
    });
    throw error;
  }

  return response;
}
