'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Plus, Search, Trash2, X } from 'lucide-react';
import {
  LinknetMediaChannel,
  LinknetMediaGenre,
  LinknetMediaReel,
  LinknetMediaReelItem,
  mediaService,
} from '@/services/media.service';

type MediaKind = 'channel' | 'reel_item' | 'genre';

interface MediaOption {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  searchText: string;
}

function moveArrayItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function stableReelItemId(item: LinknetMediaReelItem, reelName: string, index: number) {
  return String(item.id || `${reelName}:${item.title || item.name || index}`);
}

function getChannelOptions(channels: LinknetMediaChannel[]): MediaOption[] {
  return channels.map((channel) => {
    const genres = Array.isArray(channel.genre) ? channel.genre.join(', ') : '';
    const title = channel.name || String(channel.id);

    return {
      id: String(channel.id),
      title,
      subtitle: genres,
      image: channel.logo,
      searchText: [channel.id, channel.name, genres].filter(Boolean).join(' ').toLowerCase(),
    };
  });
}

function getReelItemOptions(reels: LinknetMediaReel[]): MediaOption[] {
  return reels.flatMap((reel) => (
    (reel.data || []).map((item, index) => {
      const id = stableReelItemId(item, reel.name, index);
      const title = item.title || item.name || id;
      const genres = Array.isArray(item.genre) ? item.genre.join(', ') : '';
      const subtitle = [reel.name, genres, item.year].filter(Boolean).join(' - ');

      return {
        id,
        title,
        subtitle,
        image: item.poster_portrait || item.poster || item.poster_landscape,
        searchText: [id, title, subtitle, item.channel_name].filter(Boolean).join(' ').toLowerCase(),
      };
    })
  ));
}

function getGenreOptions(genres: Array<LinknetMediaGenre | string>): MediaOption[] {
  return genres.map((genre, index) => {
    const name = typeof genre === 'string' ? genre : genre.name || String((genre as any).id || index);
    const id = String(name);

    return {
      id,
      title: name,
      subtitle: 'Genre',
      searchText: [id, name].filter(Boolean).join(' ').toLowerCase(),
    };
  });
}

function useMediaOptions(kind: MediaKind) {
  const [channels, setChannels] = useState<LinknetMediaChannel[]>([]);
  const [reels, setReels] = useState<LinknetMediaReel[]>([]);
  const [genres, setGenres] = useState<LinknetMediaGenre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError('');
    mediaService
      .getMediaData()
      .then((data) => {
        if (!mounted) return;
        setChannels(data.channels || []);
        setReels(data.reels || []);
        setGenres(data.genres || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setChannels([]);
        setReels([]);
        setGenres([]);
        setError(err instanceof Error ? err.message : 'Failed to load media data');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const options = useMemo(
    () => {
      if (kind === 'channel') return getChannelOptions(channels);
      if (kind === 'genre') return getGenreOptions(genres);
      return getReelItemOptions(reels);
    },
    [channels, genres, kind, reels]
  );

  return { options, loading, error, reels };
}

export function MediaIdsField({
  label,
  value,
  onChange,
  kind,
}: {
  label: string;
  value: any;
  onChange: (ids: string[]) => void;
  kind: MediaKind;
}) {
  const [query, setQuery] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragDepth = useRef(0);
  const { options, loading, error } = useMediaOptions(kind);
  const selectedIds = Array.isArray(value) ? value.map(String).filter(Boolean) : [];
  const selectedSet = new Set(selectedIds);
  const optionById = new Map(options.map((option) => [option.id, option]));
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = normalizedQuery
    ? options.filter((option) => option.searchText.includes(normalizedQuery))
    : options;

  const toggle = (id: string) => {
    onChange(selectedSet.has(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id]);
  };

  const moveSelected = (index: number, direction: -1 | 1) => {
    onChange(moveArrayItem(selectedIds, index, index + direction));
  };

  const handleDragStart = useCallback((event: React.DragEvent, index: number) => {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragDepth.current = 0;
  }, []);

  const handleDrop = useCallback((event: React.DragEvent, targetIndex: number) => {
    event.preventDefault();
    if (dragIndex === null) return;

    onChange(moveArrayItem(selectedIds, dragIndex, targetIndex));
    setDragIndex(null);
    setDragOverIndex(null);
    dragDepth.current = 0;
  }, [dragIndex, onChange, selectedIds]);

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>

      {selectedIds.length > 0 && (
        <div className="mb-3 rounded-lg border border-brand-100 bg-brand-50/40 dark:border-brand-900/50 dark:bg-brand-900/10">
          {selectedIds.map((id, index) => {
            const option = optionById.get(id);

            return (
              <div
                key={`${id}-${index}`}
                draggable
                onDragStart={(event) => handleDragStart(event, index)}
                onDragEnd={handleDragEnd}
                onDragEnter={(event) => {
                  event.preventDefault();
                  dragDepth.current += 1;
                  setDragOverIndex(index);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  dragDepth.current -= 1;
                  if (dragDepth.current <= 0) {
                    dragDepth.current = 0;
                    setDragOverIndex(null);
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(event) => handleDrop(event, index)}
                className={`flex items-center gap-2 border-b border-brand-100 px-3 py-2 text-xs last:border-b-0 dark:border-brand-900/50 ${
                  dragOverIndex === index && dragIndex !== index ? 'bg-white/70 dark:bg-gray-800/60' : ''
                } ${dragIndex === index ? 'opacity-60' : ''}`}
              >
                <button type="button" className="cursor-grab rounded p-1 text-gray-400" title="Drag to reorder">
                  <GripVertical className="h-4 w-4" />
                </button>
                <span className="w-5 text-center font-semibold text-brand-600 dark:text-brand-300">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-gray-800 dark:text-gray-100">
                    {option?.title || id}
                  </span>
                  {option?.subtitle && <span className="block truncate text-gray-400">{option.subtitle}</span>}
                </span>
                <button type="button" onClick={() => moveSelected(index, -1)} disabled={index === 0} className="rounded p-1 text-gray-400 disabled:opacity-35" title="Move up">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveSelected(index, 1)} disabled={index === selectedIds.length - 1} className="rounded p-1 text-gray-400 disabled:opacity-35" title="Move down">
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => toggle(id)} className="rounded p-1 text-red-500" title="Remove">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={kind === 'channel'
            ? 'Search channel name or genre...'
            : kind === 'genre'
              ? 'Search genre...'
              : 'Search highlight title, reel, or channel...'}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="px-3 py-3 text-xs text-gray-500">Loading media data...</div>
        ) : error ? (
          <div className="px-3 py-3 text-xs text-red-500">{error}</div>
        ) : visibleOptions.length > 0 ? (
          visibleOptions.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-start gap-2 border-b border-gray-100 px-3 py-2 text-xs last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={selectedSet.has(option.id)}
                onChange={() => toggle(option.id)}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-800 dark:text-gray-100">{option.title}</span>
                {option.subtitle && <span className="block truncate text-gray-400">{option.subtitle}</span>}
              </span>
            </label>
          ))
        ) : (
          <div className="px-3 py-3 text-xs text-gray-500">No media found.</div>
        )}
      </div>

      <p className="mt-1 text-[11px] leading-tight text-gray-400">
        Selected order is used when Sort By is set to Manual order. Empty selection renders an empty state on public media components.
      </p>
    </div>
  );
}

function MediaReelNameSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (name: string) => void;
}) {
  const { reels, loading, error } = useMediaOptions('reel_item');

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <select
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        disabled={loading || Boolean(error)}
      >
        <option value="">{loading ? 'Loading reels...' : error ? 'Failed to load reels' : 'Manual category name'}</option>
        {reels.map((reel) => (
          <option key={reel.name} value={reel.name}>
            {reel.name} ({reel.data?.length || 0})
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] leading-tight text-gray-400">
        Optional. Use a Reel Name from the API as this category label, or leave empty and type a manual name.
      </p>
    </div>
  );
}

export function MediaGenreField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (ids: string[]) => void;
}) {
  return (
    <MediaIdsField
      label={label}
      value={value}
      onChange={onChange}
      kind="genre"
    />
  );
}

export function MediaHighlightCategoriesField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (categories: any[]) => void;
}) {
  const categories = Array.isArray(value) ? value : [];

  const updateCategory = (index: number, patch: Record<string, any>) => {
    onChange(categories.map((category, categoryIndex) => (
      categoryIndex === index ? { ...category, ...patch } : category
    )));
  };

  const addCategory = () => {
    onChange([
      ...categories,
      {
        id: `category-${Date.now()}`,
        label: '',
        source_reel_name: '',
        reel_item_ids: [],
      },
    ]);
  };

  const removeCategory = (index: number) => {
    onChange(categories.filter((_, categoryIndex) => categoryIndex !== index));
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    onChange(moveArrayItem(categories, index, index + direction));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        <button
          type="button"
          onClick={addCategory}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add category
        </button>
      </div>

      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={category.id || index} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-500">Category {index + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveCategory(index, -1)} disabled={index === 0} className="rounded p-1 text-gray-400 disabled:opacity-35" title="Move up">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveCategory(index, 1)} disabled={index === categories.length - 1} className="rounded p-1 text-gray-400 disabled:opacity-35" title="Move down">
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => removeCategory(index)} className="rounded p-1 text-red-500" title="Remove category">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-gray-500">Manual Category Name</label>
                <input
                  type="text"
                  value={category.label || ''}
                  onChange={(event) => updateCategory(index, { label: event.target.value })}
                  placeholder="Example: Now Showing"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <MediaReelNameSelect
                label="Use API Reel Name"
                value={category.source_reel_name || ''}
                onChange={(nextName) => updateCategory(index, { source_reel_name: nextName })}
              />

              <MediaIdsField
                label="Reel Items"
                value={category.reel_item_ids || []}
                onChange={(ids) => updateCategory(index, { reel_item_ids: ids })}
                kind="reel_item"
              />
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-center text-xs text-gray-500 dark:border-gray-700">
          No categories configured. Public frontend will show Data not available.
        </div>
      )}
    </div>
  );
}
