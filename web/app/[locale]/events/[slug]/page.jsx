import { notFound } from 'next/navigation';
import EventDetail from '@/components/main/EventDetail';
import { getEventBySlug, getEvents } from '@/lib/eventsApi';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug, { locale });

  if (!event) {
    return {
      title: 'Event Not Found | Link Net',
      description: 'The requested event could not be found.',
    };
  }

  return {
    title: `${event.title} | Link Net Events`,
    description: event.excerpt ? event.excerpt.replace(/<[^>]*>/g, ' ').slice(0, 160) : 'Event detail from Link Net.',
    openGraph: {
      title: `${event.title} | Link Net Events`,
      description: event.excerpt ? event.excerpt.replace(/<[^>]*>/g, ' ').slice(0, 160) : 'Event detail from Link Net.',
      images: event.cover_image ? [event.cover_image] : [],
    },
  };
}

export default async function EventDetailPage({ params }) {
  const { locale, slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const { data: allEvents } = await getEvents({ limit: 20, locale });
  const relatedEvents = (allEvents || []).filter((e) => e.slug !== slug);

  return <EventDetail event={event} relatedEvents={relatedEvents} locale={locale} />;
}
