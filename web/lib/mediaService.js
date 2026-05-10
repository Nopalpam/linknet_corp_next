const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const MEDIA_ENDPOINT = `${API_BASE_URL}/linknet-media`;
const CACHE_TTL_MS = 5 * 60 * 1000;

let mediaCache = null;
let mediaCacheUntil = 0;
let mediaRequest = null;

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeIdList(value) {
  return asArray(value).map(String).map((item) => item.trim()).filter(Boolean);
}

function shouldUseStaticFallback(settings = {}) {
  return settings?.source === 'static_fallback';
}

function getMediaSourceItems(apiItems = [], settings = {}, fallback = []) {
  if (shouldUseStaticFallback(settings)) {
    return asArray(fallback);
  }

  return asArray(apiItems);
}

function normalizeMediaLabel(value) {
  if (value && typeof value === 'object') {
    return value.en || value.id || value.label || value.name || '';
  }

  return typeof value === 'string' ? value : '';
}

function getFirstArray(settings, keys) {
  return keys.map((key) => settings?.[key]).find(Array.isArray) || [];
}

function normalizePayload(payload) {
  const source = payload?.success && payload?.data ? payload.data : payload;

  return {
    channels: asArray(source?.channels),
    reels: asArray(source?.reels),
    genres: asArray(source?.genres),
  };
}

export async function fetchLinknetMedia({ force = false } = {}) {
  const now = Date.now();

  if (!force && mediaCache && mediaCacheUntil > now) {
    return mediaCache;
  }

  if (!force && mediaRequest) {
    return mediaRequest;
  }

  mediaRequest = fetch(MEDIA_ENDPOINT, {
    headers: { Accept: 'application/json' },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Media API returned ${response.status}`);
      }

      const payload = await response.json();
      const data = normalizePayload(payload);
      mediaCache = data;
      mediaCacheUntil = Date.now() + CACHE_TTL_MS;
      return data;
    })
    .finally(() => {
      mediaRequest = null;
    });

  return mediaRequest;
}

export function getStableReelItemId(item, reelName, index) {
  return String(item?.id || `${reelName}:${item?.title || item?.name || index}`);
}

export function normalizeMediaChannel(channel, index = 0) {
  const rawId = channel?.id ?? channel?.channel_id ?? channel?.channelId ?? index;
  const channelName = channel?.name || channel?.channelName || channel?.channel_name || String(rawId);
  const rawNumber = channel?.channelNumber || channel?.channel_number || channel?.channel_no || channel?.number || channel?.no || '';
  const channelNumber = rawNumber ? String(rawNumber).replace(/^CH\s*/i, 'CH ') : '';
  const categories = asArray(channel?.genre || channel?.genres || channel?.categories)
    .map((entry) => slugify(entry))
    .filter(Boolean);

  return {
    ...channel,
    id: String(rawId),
    image: channel?.logo || channel?.image || '',
    channelName,
    channelNumber,
    categories,
    apiOrder: index,
  };
}

export function normalizeMediaGenre(genre, index = 0) {
  const name = typeof genre === 'string'
    ? genre
    : genre?.name || genre?.label || genre?.title || String(genre?.id || index);
  const id = String(
    typeof genre === 'object' && genre !== null
      ? genre.id || genre.slug || name
      : name
  );

  return {
    ...(typeof genre === 'object' && genre !== null ? genre : {}),
    id,
    name,
    slug: slugify(name || id),
    apiOrder: index,
  };
}

export function normalizeMediaHighlight(item, reelName, index, channelMap = new Map()) {
  const channel = channelMap.get(String(item?.channel_id || '')) || channelMap.get(String(item?.channel_name || '').toLowerCase());
  const title = item?.title || item?.name || '';
  const genres = asArray(item?.genre);
  const year = item?.year ? String(item.year) : '';
  const category = genres[0] || item?.category || '';
  const actor = asArray(item?.actor).filter(Boolean).join(', ');
  const id = getStableReelItemId(item, reelName, index);

  return {
    ...item,
    id,
    badge: item?.badge || reelName || null,
    posterImage_landscape: item?.poster_landscape || item?.posterImage_landscape || item?.posterImageLandscape || item?.poster || '',
    bgImageVertical: item?.poster_portrait || item?.posterImage || item?.poster || '',
    posterImage: item?.poster_portrait || item?.poster || item?.poster_landscape || '',
    title,
    metaItems: [category, year].filter(Boolean),
    year,
    category,
    rating: item?.rating || '',
    synopsis: item?.synopsis || '',
    channelLogo: item?.channel_logo || item?.channelLogo || channel?.image || '',
    channelName: item?.channel_name || item?.channelName || channel?.channelName || '',
    watchChannel: item?.channel_name || item?.channelName || channel?.channelName || '',
    watchChannelCode: channel?.channelNumber || '',
    details: [
      category ? { label: 'Genre', value: category } : null,
      year ? { label: 'Release', value: year } : null,
      actor ? { label: 'Actor', value: actor } : null,
      item?.channel_name ? { label: 'Channel', value: item.channel_name } : null,
    ].filter(Boolean),
    href: item?.href || '/entertainment/channels',
    reelName,
    apiOrder: index,
  };
}

export function normalizeMediaData(data) {
  const channels = asArray(data?.channels).map(normalizeMediaChannel);
  const channelMap = new Map();

  channels.forEach((channel) => {
    channelMap.set(String(channel.id), channel);
    channelMap.set(String(channel.channelName || '').toLowerCase(), channel);
  });

  const highlights = asArray(data?.reels).flatMap((reel) => (
    asArray(reel?.data).map((item, index) => normalizeMediaHighlight(item, reel?.name || 'Highlight', index, channelMap))
  ));

  return {
    channels,
    highlights,
    reels: asArray(data?.reels),
    genres: asArray(data?.genres).map(normalizeMediaGenre),
  };
}

function getSelectedIds(settings, keys) {
  return normalizeIdList(getFirstArray(settings, keys));
}

export function sortMediaItems(items, settings = {}, selectedIds = []) {
  const sortBy = settings.sort_by || settings.sortBy || 'api_order';
  const direction = settings.sort_direction || settings.sortDirection || 'asc';
  const multiplier = direction === 'desc' ? -1 : 1;

  if (sortBy === 'manual' && selectedIds.length > 0) {
    const order = new Map(selectedIds.map((id, index) => [String(id), index]));
    return [...items].sort((a, b) => (order.get(String(a.id)) ?? 99999) - (order.get(String(b.id)) ?? 99999));
  }

  if (sortBy === 'api_order') {
    return [...items].sort((a, b) => ((a.apiOrder ?? 0) - (b.apiOrder ?? 0)) * multiplier);
  }

  return [...items].sort((a, b) => {
    const left = sortBy === 'channel_number'
      ? a.channelNumber || ''
      : sortBy === 'year'
        ? Number(a.year || 0)
        : String(a.channelName || a.title || '');
    const right = sortBy === 'channel_number'
      ? b.channelNumber || ''
      : sortBy === 'year'
        ? Number(b.year || 0)
        : String(b.channelName || b.title || '');

    if (typeof left === 'number' && typeof right === 'number') return (left - right) * multiplier;
    return String(left).localeCompare(String(right), undefined, { numeric: true }) * multiplier;
  });
}

export function resolveMediaChannels(mediaData, settings = {}, fallback = []) {
  const channels = getMediaSourceItems(mediaData?.channels, settings, fallback);
  const selectedIds = getSelectedIds(settings, ['channel_ids', 'channelIds']);
  const selectedSet = new Set(selectedIds);
  const selectedGenres = getSelectedIds(settings, ['genre_ids', 'genreIds', 'genre_names', 'genreNames', 'genres'])
    .map(slugify)
    .filter(Boolean);
  const selectedGenreSet = new Set(selectedGenres);
  const limit = Number(settings.limit || settings.displayLimit || 0);
  const filtered = channels.filter((channel) => {
    const matchesSelectedChannel = selectedSet.size > 0 && selectedSet.has(String(channel.id));
    const matchesSelectedGenre = selectedGenreSet.size > 0
      && asArray(channel.categories).some((category) => selectedGenreSet.has(slugify(category)));

    if (selectedSet.size === 0 && selectedGenreSet.size === 0 && !shouldUseStaticFallback(settings)) {
      return false;
    }

    if (selectedSet.size > 0 && selectedGenreSet.size > 0) {
      return matchesSelectedChannel && matchesSelectedGenre;
    }

    return selectedSet.size > 0 ? matchesSelectedChannel : matchesSelectedGenre;
  });

  const sorted = sortMediaItems(filtered, settings, selectedIds);
  return limit > 0 ? sorted.slice(0, limit) : sorted;
}

export function resolveMediaHighlights(mediaData, settings = {}, fallback = []) {
  const highlights = getMediaSourceItems(mediaData?.highlights, settings, fallback);
  const selectedIds = getSelectedIds(settings, ['reel_item_ids', 'reelItemIds', 'highlight_item_ids', 'highlightItemIds']);
  const selectedSet = new Set(selectedIds);
  const limit = Number(settings.limit || settings.displayLimit || 0);
  const filtered = highlights.filter((item) => {
    if (selectedSet.size === 0 && !shouldUseStaticFallback(settings)) return false;
    if (selectedSet.size > 0 && !selectedSet.has(String(item.id))) return false;
    return true;
  });
  const sorted = sortMediaItems(filtered, settings, selectedIds);

  return limit > 0 ? sorted.slice(0, limit) : sorted;
}

export function resolveMediaHighlightGroups(mediaData, settings = {}, fallbackGroups = {}) {
  if (shouldUseStaticFallback(settings)) {
    return Object.entries(fallbackGroups || {}).reduce((groups, [key, items]) => {
      groups[key] = {
        value: key,
        label: key.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
        items: asArray(items),
      };
      return groups;
    }, {});
  }

  const categories = getFirstArray(settings, ['highlight_categories', 'highlightCategories', 'categories']);
  const highlights = asArray(mediaData?.highlights);
  const highlightById = new Map(highlights.map((item) => [String(item.id), item]));

  return categories.reduce((groups, category, index) => {
    if (!category || typeof category !== 'object') return groups;

    const selectedIds = getSelectedIds(category, ['reel_item_ids', 'reelItemIds', 'highlight_item_ids', 'highlightItemIds']);
    const items = selectedIds.map((id) => highlightById.get(id)).filter(Boolean);
    const sourceReelName = category.source_reel_name || category.sourceReelName || category.reel_name || category.reelName || '';
    const label = normalizeMediaLabel(category.label || category.name || category.title) || sourceReelName || `Category ${index + 1}`;
    const value = String(category.value || category.id || slugify(label) || `category-${index + 1}`);

    if (items.length > 0) {
      groups[value] = { value, label, sourceReelName, items };
    }

    return groups;
  }, {});
}

export function buildMediaTabs(channels, configuredTabs = []) {
  if (Array.isArray(configuredTabs) && configuredTabs.length > 0 && channels.length > 0) {
    return configuredTabs;
  }

  const categories = Array.from(new Set(channels.flatMap((channel) => channel.categories || []))).filter(Boolean);

  return [
    { value: 'all', label: 'All Channel' },
    ...categories.map((category) => ({
      value: category,
      label: category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    })),
  ];
}

export function buildChannelLogoRows(channels, settings = {}, rows = 2, perRow = 5) {
  const selectedIds = getSelectedIds(settings, ['logo_channel_ids', 'logoChannelIds']);
  const selectedSet = new Set(selectedIds);
  const source = selectedIds.length > 0
    ? channels.filter((channel) => selectedSet.has(String(channel.id)))
    : channels;
  const logos = source
    .filter((channel) => channel.image)
    .slice(0, rows * perRow)
    .map((channel) => ({ name: channel.channelName, img: channel.image }));

  return Array.from({ length: rows }, (_, rowIndex) => (
    logos.slice(rowIndex * perRow, rowIndex * perRow + perRow)
  )).filter((row) => row.length > 0);
}
