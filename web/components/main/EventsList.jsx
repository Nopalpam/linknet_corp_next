'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';

import CardEvent from '@/components/base/cards/CardEvent';
import Intro from '@/components/base/section/Intro';
import { hasIntroContent } from '../../../shared/presentation/intro';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const VALID_STATES = ['all', 'upcoming', 'ongoing', 'ended'];

function normalizeState(state) {
  if (state === 'past') return 'ended';
  return VALID_STATES.includes(state) ? state : 'all';
}

function toApiState(state) {
  const normalized = normalizeState(state);
  return normalized === 'all' ? null : normalized;
}

function getEventDate(event) {
  const raw = event.start_date || event.startDate || event.event_date || event.date;
  const parsed = raw ? new Date(raw) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

function getEventEndDate(event) {
  const raw = event.end_date || event.endDate;
  const parsed = raw ? new Date(raw) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

function getStateFromDate(event) {
  const explicit = event.public_state || event.state;
  if (explicit) return normalizeState(explicit);

  const start = getEventDate(event);
  if (!start) return 'ended';

  const now = new Date();
  const end = getEventEndDate(event) || new Date(start);
  end.setHours(23, 59, 59, 999);

  if (now < start) return 'upcoming';
  if (now <= end) return 'ongoing';
  return 'ended';
}

function filterByState(events, state) {
  const normalized = normalizeState(state);
  if (normalized === 'all') return events;
  return events.filter((event) => getStateFromDate(event) === normalized);
}

function getGridClass(itemsPerRow) {
  const normalized = Math.min(Math.max(Number(itemsPerRow) || 3, 1), 4);

  if (normalized === 1) return 'grid-cols-1';
  if (normalized === 2) return 'grid-cols-1 md:grid-cols-2';
  if (normalized === 4) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
}

function EmptyState({ state }) {
  const normalized = normalizeState(state);
  const message = normalized === 'upcoming'
    ? 'No upcoming events at the moment.'
    : normalized === 'ongoing'
      ? 'No ongoing events at the moment.'
      : normalized === 'ended'
        ? 'No ended events found.'
        : 'Published events will appear here once they are ready.';

  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
      <p className="text-body-b3 font-medium text-black">No events available</p>
      <p className="mt-2 text-body-b5 text-secondary">{message}</p>
    </div>
  );
}

function SkeletonGrid({ itemsPerRow }) {
  return (
    <div className={`grid gap-6 ${getGridClass(itemsPerRow)}`}>
      {Array.from({ length: Math.min((Number(itemsPerRow) || 3) * 2, 8) }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="animate-pulse overflow-hidden rounded-[20px] bg-neutral-100">
          <div className="aspect-[300/373] bg-neutral-200" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-3/5 rounded bg-neutral-200" />
            <div className="h-6 w-full rounded bg-neutral-200" />
            <div className="h-4 w-4/5 rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages })
    .map((_, index) => index + 1)
    .filter((page) => (
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
    ));

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Events pagination">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className="rounded-full border border-neutral-300 px-4 py-2 text-body-b5 font-medium text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        const showGap = previous && page - previous > 1;

        return (
          <span key={page} className="flex items-center gap-2">
            {showGap ? <span className="text-body-b5 text-secondary">...</span> : null}
            <button
              type="button"
              onClick={() => onPageChange(page)}
              className={`h-10 w-10 rounded-full text-body-b5 font-medium transition ${
                page === currentPage
                  ? 'bg-black text-white'
                  : 'border border-neutral-300 text-black hover:border-black'
              }`}
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="rounded-full border border-neutral-300 px-4 py-2 text-body-b5 font-medium text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}

export default function EventsList({
  events: eventsProp = null,
  pagination: paginationProp = null,
  state = 'all',
  limit = 12,
  sortBy = 'start_date',
  sortDirection = 'asc',
  itemsPerRow = 3,
  showPagination = true,
  introData,
  locale: localeProp,
  className = '',
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = localeProp || params?.locale || 'en';
  const normalizedState = normalizeState(state);
  const pageFromUrl = Number(searchParams?.get('page')) || 1;
  const needsFetch = eventsProp === null || eventsProp === undefined;
  const resolvedPage = paginationProp?.currentPage || pageFromUrl || 1;

  const [requestedPage, setRequestedPage] = useState(resolvedPage);
  const [clientState, setClientState] = useState({
    fetchKey: '',
    events: [],
    pagination: null,
  });
  const currentPage = needsFetch ? requestedPage : resolvedPage;
  const fetchKey = useMemo(() => {
    if (!needsFetch) {
      return '';
    }

    return JSON.stringify({
      currentPage,
      limit,
      locale,
      normalizedState,
      sortBy,
      sortDirection,
    });
  }, [currentPage, limit, locale, needsFetch, normalizedState, sortBy, sortDirection]);

  useEffect(() => {
    if (!needsFetch) return undefined;

    let cancelled = false;
    const qp = new URLSearchParams();
    qp.set('page', String(currentPage));
    qp.set('limit', String(limit));
    qp.set('sortBy', String(sortBy));
    qp.set('sortOrder', String(sortDirection).toLowerCase() === 'desc' ? 'desc' : 'asc');
    qp.set('locale', String(locale));

    const apiState = toApiState(normalizedState);
    if (apiState) qp.set('state', apiState);

    fetch(`${API_BASE_URL}/events?${qp.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        setClientState({
          fetchKey,
          events: json?.data || [],
          pagination: json?.pagination || null,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setClientState({
            fetchKey,
            events: [],
            pagination: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentPage, fetchKey, limit, locale, needsFetch, normalizedState, sortBy, sortDirection]);

  const isLoading = needsFetch && clientState.fetchKey !== fetchKey;

  const events = useMemo(() => {
    if (needsFetch) {
      return isLoading ? [] : clientState.events;
    }

    return filterByState(eventsProp || [], normalizedState).slice(0, limit);
  }, [clientState.events, eventsProp, isLoading, limit, needsFetch, normalizedState]);

  const pagination = needsFetch
    ? (isLoading ? null : clientState.pagination)
    : paginationProp;
  const totalPages = pagination?.totalPages || 1;
  const activePage = pagination?.currentPage || currentPage;
  const resolvedIntro = introData || {
    as: 'h2',
    label: 'FIND YOUR NEXT EXPERIENCE',
    title: 'Discover & Promote Upcoming Event',
    description: '',
    align: 'left',
  };
  const shouldRenderIntro = hasIntroContent(resolvedIntro);

  const handlePageChange = (page) => {
    if (page === activePage) return;

    if (needsFetch) {
      setRequestedPage(page);
      return;
    }

    const nextParams = new URLSearchParams(searchParams?.toString());
    nextParams.set('page', String(page));
    nextParams.set('limit', String(limit));
    if (normalizedState === 'all') {
      nextParams.delete('state');
    } else {
      nextParams.set('state', normalizedState);
    }

    router.push(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <section className={`bg-white py-16 md:py-24 ${className}`.trim()}>
      <div className="container mx-auto px-4 md:px-0">
        {shouldRenderIntro && (
          <div className="mb-10">
            <Intro {...resolvedIntro} />
          </div>
        )}

        {isLoading ? (
          <SkeletonGrid itemsPerRow={itemsPerRow} />
        ) : !events.length ? (
          <EmptyState state={normalizedState} />
        ) : (
          <div className={`grid gap-6 ${getGridClass(itemsPerRow)}`}>
            {events.map((event) => (
              <CardEvent
                key={event.id}
                href={`/${locale}/events/${event.slug}`}
                image={event.cover_image || event.image || event.thumbnailImage}
                title={event.title}
                date={event.date}
                startDate={event.start_date || event.startDate}
                endDate={event.end_date || event.endDate}
                location={event.location || event.venue}
                status={event.public_state || event.state || event.status}
                className="!max-w-none"
              />
            ))}
          </div>
        )}

        {showPagination && !isLoading ? (
          <Pagination currentPage={activePage} totalPages={totalPages} onPageChange={handlePageChange} />
        ) : null}
      </div>
    </section>
  );
}
