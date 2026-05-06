import EventsList from '@/components/main/EventsList';
import { getEvents } from '@/lib/eventsApi';

export const metadata = {
  title: 'Events | Link Net',
  description: 'Published Link Net events and upcoming activities.',
};

const VALID_STATES = ['all', 'upcoming', 'ongoing', 'ended'];
const DEFAULT_LIMIT = 12;

const DEFAULT_INTRO = {
  as: 'h1',
  label: 'EVENTS',
  title: 'Discover Our Events',
  description: 'Upcoming and published events from Link Net.',
  align: 'left',
};

export default async function EventsPage({ params, searchParams }) {
  const { locale } = await params;
  const { state, limit: limitParam, page: pageParam } = (await searchParams) || {};

  const uiState = VALID_STATES.includes(state) ? state : 'all';
  const limit = Math.min(Number(limitParam) || DEFAULT_LIMIT, 100);
  const page = Math.max(Number(pageParam) || 1, 1);

  // Map UI state to API state param
  const apiParams = { page, limit, sortBy: 'start_date', sortOrder: 'asc', locale };
  if (uiState !== 'all') apiParams.state = uiState;

  const { data, pagination } = await getEvents(apiParams);

  return (
    <EventsList
      events={data}
      pagination={pagination}
      state={uiState}
      limit={limit}
      locale={locale}
      introData={DEFAULT_INTRO}
      itemsPerRow={3}
      showPagination
    />
  );
}
