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
    genres: asArray(source?.genres || source?.genre),
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

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getGenreId(genre) {
  if (genre && typeof genre === 'object') {
    return String(genre.id ?? genre.slug ?? genre.name ?? '').trim();
  }

  return String(genre ?? '').trim();
}

function buildGenreMap(genres = []) {
  const map = new Map();

  asArray(genres).forEach((genre, index) => {
    const normalized = normalizeMediaGenre(genre, index);
    map.set(String(normalized.id), normalized);
    map.set(slugify(normalized.name), normalized);
  });

  return map;
}

export function normalizeMediaChannel(channel, index = 0, genreMap = new Map()) {
  const rawId = channel?.id ?? channel?.channel_id ?? channel?.channelId ?? index;
  const channelName = channel?.name || channel?.channelName || channel?.channel_name || String(rawId);
  const rawNumber = channel?.channelNumber || channel?.channel_number || channel?.channel_no || channel?.number || channel?.no || '';
  const channelNumber = rawNumber ? String(rawNumber).replace(/^CH\s*/i, 'CH ') : '';
  const genreIds = asArray(channel?.genre || channel?.genres || channel?.categories)
    .map(getGenreId)
    .filter(Boolean);
  const genreNames = genreIds
    .map((id) => genreMap.get(String(id))?.name || id)
    .filter(Boolean);
  const categories = uniqueValues([
    ...genreIds.map((id) => String(id)),
    ...genreNames.map((name) => slugify(name)),
  ]);

  return {
    ...channel,
    id: String(rawId),
    channelId: String(rawId),
    number: rawNumber,
    image: channel?.logo || channel?.image || '',
    channelName,
    channelNumber,
    genreIds,
    genreNames,
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
    nameSlug: slugify(name || id),
    apiOrder: index,
  };
}

export function normalizeMediaHighlight(item, reelName, index, channelMap = new Map(), genreMap = new Map()) {
  const channelId = item?.channel_id ?? item?.channelId ?? '';
  const channel = channelMap.get(String(channelId)) || channelMap.get(String(item?.channel_name || '').toLowerCase());
  const title = item?.title || item?.name || '';
  const genreIds = asArray(item?.genre || item?.genres).map(getGenreId).filter(Boolean);
  const genres = genreIds.map((id) => genreMap.get(String(id))?.name || id);
  const year = item?.year ? String(item.year) : '';
  const category = genres[0] || item?.category || '';
  const actor = asArray(item?.actor).filter(Boolean).join(', ');
  const id = getStableReelItemId(item, reelName, index);
  const resolvedChannelName = item?.channel_name || item?.channelName || channel?.channelName || '';

  return {
    ...item,
    id,
    channelId: String(channelId || channel?.id || ''),
    genreIds,
    genreNames: genres,
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
    channelName: resolvedChannelName,
    watchChannel: resolvedChannelName,
    watchChannelCode: channel?.channelNumber || '',
    details: [
      category ? { label: 'Genre', value: category } : null,
      year ? { label: 'Release', value: year } : null,
      actor ? { label: 'Actor', value: actor } : null,
      resolvedChannelName ? { label: 'Channel', value: resolvedChannelName } : null,
    ].filter(Boolean),
    href: item?.href || '/entertainment/channels',
    reelName,
    apiOrder: index,
  };
}

export function normalizeMediaData(data) {
  const genres = asArray(data?.genres || data?.genre).map(normalizeMediaGenre);
  const genreMap = buildGenreMap(genres);
  const channels = asArray(data?.channels).map((channel, index) => normalizeMediaChannel(channel, index, genreMap));
  const channelMap = new Map();

  channels.forEach((channel) => {
    channelMap.set(String(channel.id), channel);
    channelMap.set(String(channel.channelName || '').toLowerCase(), channel);
  });

  const highlights = asArray(data?.reels).flatMap((reel) => (
    asArray(reel?.data).map((item, index) => normalizeMediaHighlight(item, reel?.name || 'Highlight', index, channelMap, genreMap))
  ));

  return {
    channels,
    highlights,
    reels: asArray(data?.reels),
    genres,
  };
}

function getSelectedIds(settings, keys) {
  return normalizeIdList(getFirstArray(settings, keys));
}

export function sortMediaItems(items, settings = {}, selectedIds = []) {
  const sortBy = settings.sort_by || settings.sortBy || 'api_order';
  const direction = settings.sort_direction || settings.sortDirection || 'asc';
  const multiplier = direction === 'desc' ? -1 : 1;

  if (selectedIds.length > 0 && (sortBy === 'manual' || settings.preserve_selected_order !== false)) {
    const order = new Map(selectedIds.map((id, index) => [String(id), index]));
    return [...items].sort((a, b) => {
      const byManualOrder = (order.get(String(a.id)) ?? 99999) - (order.get(String(b.id)) ?? 99999);
      return byManualOrder !== 0 ? byManualOrder : ((a.apiOrder ?? 0) - (b.apiOrder ?? 0));
    });
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
    .flatMap((entry) => [String(entry), slugify(entry)])
    .filter(Boolean);
  const selectedGenreSet = new Set(selectedGenres);
  const limit = Number(settings.limit || settings.displayLimit || 0);
  const filtered = channels.filter((channel) => {
    const matchesSelectedChannel = selectedSet.size > 0 && selectedSet.has(String(channel.id));
    const matchesSelectedGenre = selectedGenreSet.size > 0
      && [
        ...asArray(channel.genreIds).map(String),
        ...asArray(channel.categories).map(String),
      ].some((category) => selectedGenreSet.has(category) || selectedGenreSet.has(slugify(category)));

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

  if (categories.length === 0) {
    return highlights.reduce((groups, item) => {
      const label = item.reelName || 'Highlight';
      const value = slugify(label) || 'highlight';
      if (!groups[value]) {
        groups[value] = { value, label, sourceReelName: label, items: [] };
      }
      groups[value].items.push(item);
      return groups;
    }, {});
  }

  return categories.reduce((groups, category, index) => {
    if (!category || typeof category !== 'object') return groups;

    const selectedIds = getSelectedIds(category, ['reel_item_ids', 'reelItemIds', 'highlight_item_ids', 'highlightItemIds']);
    const sourceReelName = category.source_reel_name || category.sourceReelName || category.reel_name || category.reelName || '';
    const items = selectedIds.length > 0
      ? selectedIds.map((id) => highlightById.get(id)).filter(Boolean)
      : highlights.filter((item) => !sourceReelName || item.reelName === sourceReelName);
    const label = normalizeMediaLabel(category.label || category.name || category.title) || sourceReelName || `Category ${index + 1}`;
    const value = String(category.value || category.id || slugify(label) || `category-${index + 1}`);

    if (items.length > 0) {
      groups[value] = { value, label, sourceReelName, items };
    }

    return groups;
  }, {});
}

export function buildMediaTabs(channels, configuredTabs = []) {
  const categories = Array.from(new Set(channels.flatMap((channel) => channel.categories || []))).filter(Boolean);
  const categorySet = new Set(categories);

  if (Array.isArray(configuredTabs) && configuredTabs.length > 0 && channels.length > 0) {
    const validTabs = configuredTabs.filter((tab) => {
      const value = String(tab?.value ?? tab?.id ?? '');
      return value === 'all' || categorySet.has(value);
    });

    if (validTabs.length > 0) {
      return validTabs;
    }
  }

  return [
    { value: 'all', label: 'All Channel' },
    ...categories.map((category) => ({
      value: category,
      label: category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    })),
  ];
}

function hashString(value) {
  return String(value || '').split('').reduce((hash, char) => {
    return ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
  }, 2166136261);
}

function seededShuffle(items, seed) {
  return [...items]
    .map((item) => {
      const itemSeed = hashString(`${seed}:${item.id}:${item.channelName}`);
      return { item, sort: itemSeed };
    })
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

export function buildChannelLogoRows(channels, settings = {}, rows = 2, perRow = 5) {
  const allowedLimits = [10, 15, 20, 25];
  const requestedLimit = Number(
    settings.logo_display_limit ||
    settings.logoDisplayLimit ||
    settings.show_data_per ||
    settings.showDataPer ||
    rows * perRow
  );
  const limit = allowedLimits.includes(requestedLimit) ? requestedLimit : rows * perRow;
  const seed = settings.logo_shuffle_seed || settings.logoShuffleSeed || new Date().toISOString().slice(0, 10);
  const source = seededShuffle(channels, seed);
  const logos = source
    .filter((channel) => channel.image)
    .slice(0, limit)
    .map((channel) => ({ name: channel.channelName, img: channel.image }));
  const rowCount = Math.max(1, Math.min(rows, logos.length));
  const itemsPerRow = Math.ceil(logos.length / rowCount);

  return Array.from({ length: rowCount }, (_, rowIndex) => (
    logos.slice(rowIndex * itemsPerRow, rowIndex * itemsPerRow + itemsPerRow)
  )).filter((row) => row.length > 0);
}
