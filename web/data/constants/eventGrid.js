import { EVENT_LIST } from '@/data/components/eventList';

const ACTIVE_EVENT_ITEMS = EVENT_LIST
  .filter((event) => event.publishStatus === 'active')
  .map((event) => ({
    id: event.id,
    slug: event.slug,
    image: event.image,
    title: event.title,
    date: event.date,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
    status: event.status,
  }));

export const EVENT_GRID_DATA = {
  'featured-event': {
    config: {
      sectionId: 'featured-event',
      className: '',
      heroClassName: '',
      contentClassName: '',
      itemsPerPage: 8,
      emptyMessage: 'No events available at the moment.',
    },
    introData: {
      as: 'h2',
      label: 'FIND YOUR NEXT EXPERIENCE',
      title: 'Discover & Promote Upcoming Event',
      description: '',
      align: 'left',
    },
    header: {
      title: 'Featured Event',
    },
    items: ACTIVE_EVENT_ITEMS,
    pagination: {
      currentPage: 1,
      totalPages: Math.ceil(ACTIVE_EVENT_ITEMS.length / 8),
    },
  },
};
