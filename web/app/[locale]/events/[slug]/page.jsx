import { notFound } from 'next/navigation';
import EventDetail from '@/components/main/EventDetail';
import { getEventBySlug, getEvents } from '@/lib/eventsApi';
import { getPublicSettings } from '@/lib/cmsApi';
import { buildBasicMetadata, stripHtml } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const [event, publicSettings] = await Promise.all([
    getEventBySlug(slug, { locale }),
    getPublicSettings(),
  ]);

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
    };
  }

  return buildBasicMetadata({
    title: event.title,
    description: event.excerpt ? stripHtml(event.excerpt).slice(0, 160) : 'Event detail from Link Net.',
    image: event.cover_image,
    locale,
    path: `events/${slug}`,
    publicSettings,
  });
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
