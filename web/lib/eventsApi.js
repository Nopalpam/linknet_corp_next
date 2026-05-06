const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export async function getEvents(params = {}) {
  try {
    const queryString = buildQueryString(params);
    const url = queryString ? `${API_BASE_URL}/events?${queryString}` : `${API_BASE_URL}/events`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { data: [], pagination: null };
    }

    const json = await res.json();
    return {
      data: json.data || [],
      pagination: json.pagination || null,
    };
  } catch (_error) {
    return { data: [], pagination: null };
  }
}

export async function getEventBySlug(slug, params = {}) {
  try {
    const queryString = buildQueryString(params);
    const url = queryString
      ? `${API_BASE_URL}/events/${encodeURIComponent(slug)}?${queryString}`
      : `${API_BASE_URL}/events/${encodeURIComponent(slug)}`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (_error) {
    return null;
  }
}

export async function createEventRegistration(slug, payload) {
  const res = await fetch(`${API_BASE_URL}/events/${encodeURIComponent(slug)}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to submit event registration');
  }

  return json;
}
