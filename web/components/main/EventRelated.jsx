'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import CardEvent from '@/components/base/cards/CardEvent';
import LinknetLink from '@/components/base/Link';
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

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function eventMatchesState(event, state) {
  const normalized = normalizeState(state);
  if (normalized === 'all') return true;
  return normalizeState(event.public_state || event.state || event.status) === normalized;
}

function sortEventsByType(events, type) {
  switch (type) {
    case 'random':
      return shuffleArray(events);
    case 'newest':
      return [...events].sort((a, b) => {
        const aDate = new Date(a.created_at || a.createdAt || 0);
        const bDate = new Date(b.created_at || b.createdAt || 0);
        return bDate - aDate;
      });
    case 'latest':
    default:
      return [...events].sort((a, b) => {
        const aDate = new Date(a.start_date || a.startDate || a.event_date || a.date || 0);
        const bDate = new Date(b.start_date || b.startDate || b.event_date || b.date || 0);
        return bDate - aDate;
      });
  }
}

const DEFAULT_INTRO = {
  as: 'h2',
  title: 'Other Events',
  align: 'left',
};

/**
 * EventRelated
 *
 * Displays related events on an event detail page.
 *
 * Props:
 *   currentEvent  — the event currently being viewed (used to exclude from list)
 *   events        — array of candidate events to pick from
 *   type          — 'latest' | 'newest' | 'random'  (default: 'latest')
 *   limit         — max items to display             (default: 4)
 *   introData     — Intro section config from page builder (label/title/description)
 *   className     — optional extra CSS classes
 */
export default function EventRelated({
  currentEvent,
  events = null,
  type = 'latest',
  state = 'all',
  limit = 4,
  introData,
  className = '',
}) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const needsFetch = events === null || events === undefined;
  const normalizedState = normalizeState(state);
  const [clientState, setClientState] = useState({
    fetchKey: '',
    events: [],
  });
  const fetchKey = useMemo(() => {
    if (!needsFetch) {
      return '';
    }

    return JSON.stringify({ locale, limit, normalizedState, type });
  }, [limit, locale, needsFetch, normalizedState, type]);

  useEffect(() => {
    if (!needsFetch) return undefined;

    let cancelled = false;
    const qp = new URLSearchParams();
    qp.set('limit', String(Math.max(Number(limit) + 1, 6)));
    qp.set('sortBy', type === 'newest' ? 'created_at' : 'start_date');
    qp.set('sortOrder', 'desc');
    qp.set('locale', String(locale));

    const apiState = toApiState(normalizedState);
    if (apiState) qp.set('state', apiState);

    fetch(`${API_BASE_URL}/events?${qp.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) {
          setClientState({
            fetchKey,
            events: json?.data || [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setClientState({
            fetchKey,
            events: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey, limit, locale, needsFetch, normalizedState, type]);

  const isLoading = needsFetch && clientState.fetchKey !== fetchKey;

  const relatedEvents = useMemo(() => {
    const sourceEvents = needsFetch
      ? (isLoading ? [] : clientState.events)
      : (Array.isArray(events) ? events : []);

    // Exclude current event by id and slug
    const filtered = sourceEvents.filter(
      (event) =>
        event.publishStatus !== 'inactive' &&
        event.status !== 'draft' &&
        event.status !== 'DRAFT' &&
        eventMatchesState(event, normalizedState) &&
        (!currentEvent?.id || event.id !== currentEvent.id) &&
        (!currentEvent?.slug || event.slug !== currentEvent.slug),
    );

    const sorted = sortEventsByType(filtered, type);
    // Show as many as available up to limit
    return sorted.slice(0, limit);
  }, [clientState.events, currentEvent?.id, currentEvent?.slug, events, isLoading, limit, needsFetch, normalizedState, type]);

  const resolvedIntro = introData || DEFAULT_INTRO;
  const shouldRenderIntro = hasIntroContent(resolvedIntro);

  // Fallback when no related events found
  if (isLoading) {
    return null;
  }

  if (!relatedEvents.length) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container">
          {shouldRenderIntro && (
            <div className="mb-6">
              <Intro {...resolvedIntro} />
            </div>
          )}
          <p className="text-body-b4 text-secondary">No related events</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`overflow-hidden relative py-12 md:py-16 ${className}`}>
      <div className="container">
        {shouldRenderIntro && (
          <div className="mb-6 md:mb-10">
            <Intro {...resolvedIntro} />
          </div>
        )}

        <Swiper
          slidesPerView={2}
          spaceBetween={12}
          breakpoints={{
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1200: {
              slidesPerView: Math.min(4, relatedEvents.length),
              spaceBetween: 24,
            },
          }}
          className="!overflow-visible"
        >
          {relatedEvents.map((event) => (
            <SwiperSlide key={event.id} className="!h-auto">
              <CardEvent
                href={`/${locale}/events/${event.slug}`}
                image={event.image || event.cover_image || event.thumbnailImage}
                title={event.title}
                date={event.date}
                startDate={event.startDate || event.start_date}
                endDate={event.endDate || event.end_date}
                location={event.location || event.venue}
                status={event.public_state || event.state || event.status}
                className="!max-w-none w-full h-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="mt-10 flex justify-center md:mt-12">
          <LinknetLink
            href={`/${locale}/events`}
            variant="secondary-outline"
            size="lg"
          >
            Discover More Event
          </LinknetLink>
        </div>
      </div>
    </section>
  );
}
