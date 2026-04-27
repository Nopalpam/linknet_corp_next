import EventsList from '@/components/main/EventsList';
import { getEvents } from '@/lib/eventsApi';

export const metadata = {
  title: 'Events | Link Net',
  description: 'Published Link Net events and upcoming activities.',
};

export default async function EventsPage({ params }) {
  const { locale } = await params;
  const { data } = await getEvents({ limit: 12, sortBy: 'start_date', sortOrder: 'asc' });

  return <EventsList events={data} locale={locale} />;
}