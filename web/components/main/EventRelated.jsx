'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import CardEvent from '@/components/base/cards/CardEvent';
import LinknetLink from '@/components/base/Link';
import { EVENT_LIST } from '@/data/components/eventList';

const MAX_ITEMS = 4;

const STATUS_PRIORITY = {
  ongoing: 0,
  upcoming: 1,
  ended: 2,
};

function getEventPrimaryDate(event) {
  const value = event?.startDate || event?.date || event?.endDate;

  if (!value) return null;

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function sortEventsByPriority(a, b) {
  const statusDiff = (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99);

  if (statusDiff !== 0) return statusDiff;

  const firstDate = getEventPrimaryDate(a);
  const secondDate = getEventPrimaryDate(b);

  if (firstDate && secondDate) {
    return firstDate - secondDate;
  }

  if (firstDate) return -1;
  if (secondDate) return 1;

  return 0;
}

export default function EventRelated({ currentEvent, events, className = '' }) {
  const params = useParams();
  const locale = params?.locale || 'en';

  const relatedEvents = useMemo(() => {
    if (!currentEvent) return [];

    const sourceEvents = Array.isArray(events) && events.length > 0 ? events : EVENT_LIST;
    const allActiveEvents = sourceEvents.filter(
      (event) => event.publishStatus !== 'inactive' && event.status !== 'draft' && event.id !== currentEvent.id
    );

    const prioritizedEvents = [];
    const otherEvents = [];

    allActiveEvents
      .slice()
      .sort(sortEventsByPriority)
      .forEach((event) => {
        if (event.status === 'ongoing' || event.status === 'upcoming') {
          prioritizedEvents.push(event);
          return;
        }

        otherEvents.push(event);
      });

    if (prioritizedEvents.length >= MAX_ITEMS) {
      return prioritizedEvents.slice(0, MAX_ITEMS);
    }

    return [...prioritizedEvents, ...otherEvents.slice(0, MAX_ITEMS - prioritizedEvents.length)];
  }, [currentEvent, events]);

  if (!relatedEvents.length) return null;

  return (
    <section className={`overflow-hidden relative ${className}`}>
      <div className="container">
        <div className="">
          <div className="mb-4 md:mb-8">
            <h2 className="text-headline-h4 font-bold text-black">Other Events</h2>
          </div>

          <Swiper
            slidesPerView={2}
            spaceBetween={12}
            breakpoints={{
              768: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1200: {
                slidesPerView: 4,
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
                  status={event.status || event.public_state || event.state}
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
      </div>
    </section>
  );
}
