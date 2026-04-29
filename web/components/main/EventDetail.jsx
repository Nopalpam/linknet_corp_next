import EventHero from '@/components/main/EventHero';
import EventContent from '@/components/main/EventContent';
import EventRelated from '@/components/main/EventRelated';
import { formatEventDateLabel, formatEventTimeLabel } from '@/lib/eventFormatters';

function normalizeEvent(event) {
  if (!event) return null;

  const locationSection = event.locationSection || event.location_section || {};
  const organizer = event.organizer || {};
  const coverImage = event.cover_image || event.coverImage || event.thumbnailImage || event.thumbnail_image || '';
  const posterImage = event.posterImage || event.poster_image || event.poster || coverImage;
  const status = event.status || event.public_state || event.state || 'ongoing';
  const heroLocation =
    event.heroLocation ||
    event.hero_location ||
    [event.venue, event.location, event.address].filter(Boolean).join(', ');

  return {
    ...event,
    id: event.id,
    slug: event.slug,
    title: event.title || event.heroTitle || event.hero_title,
    heroTitle: event.heroTitle || event.hero_title || event.title,
    posterImage,
    thumbnailImage: coverImage,
    thumbnailMobileImage: event.thumbnailMobileImage || event.thumbnail_mobile_image || coverImage,
    badgeText: event.badgeText || event.badge_text || event.public_state || event.state,
    status,
    heroLocation,
    location: heroLocation,
    venue: event.venue || event.location || heroLocation,
    ticketPrice: event.ticketPrice || event.ticket_price || 'FREE',
    registerLink: event.registerLink || event.register_link || '#',
    maxRegisterParticipants: event.maxRegisterParticipants || event.max_register_participants || 1,
    registrationEndedTime: event.registrationEndedTime || event.registration_end_at || event.registration_ended_time,
    startDate: event.startDate || event.start_date || event.date,
    endDate: event.endDate || event.end_date,
    timeStart: event.timeStart || event.time_start || event.start_date || event.date,
    timeEnd: event.timeEnd || event.time_end || event.end_date,
    content: event.content || event.description || event.excerpt || '',
    organizer: {
      label: organizer.label || event.organizer_label || 'Organized by',
      name: organizer.name || event.organizer_name || 'PT Link Net Tbk',
      logo: organizer.logo || event.organizer_logo || '/assets/logos/linknet-logo.svg',
    },
    locationSection: {
      name: locationSection.name || event.venue || heroLocation,
      address: locationSection.address || event.address || heroLocation,
      mapEmbedUrl: locationSection.mapEmbedUrl || locationSection.map_embed_url || '',
      directionsLink: locationSection.directionsLink || locationSection.directions_link || '#',
    },
    relatedEvents: event.relatedEvents || event.related_events || [],
  };
}

export default function EventDetail({ event, locale = 'en' }) {
  if (!event) return null;
  const normalizedEvent = normalizeEvent(event);
  const isRegistrationOpen =
    event.isRegistrationOpen ?? event.is_registration_open ?? normalizedEvent.status !== 'ended';

  return (
    <>
      <EventHero
        posterSrc={normalizedEvent.posterImage}
        thumbnailSrc={normalizedEvent.thumbnailImage}
        thumbnailMobileSrc={normalizedEvent.thumbnailMobileImage}
        badgeText={normalizedEvent.badgeText}
        status={normalizedEvent.status}
        title={normalizedEvent.heroTitle}
        location={normalizedEvent.heroLocation}
        dateLabel={formatEventDateLabel(normalizedEvent)}
        timeLabel={formatEventTimeLabel(normalizedEvent)}
        ctaLink={normalizedEvent.registerLink}
        ctaModalPayload={isRegistrationOpen ? {
          eventName: normalizedEvent.title,
          Promo_Website__c: normalizedEvent.title,
          Page_Website__c: `/${locale}/events/${normalizedEvent.slug}`,
          Source_Website__c: 'Event Website',
          maxParticipants: normalizedEvent.maxRegisterParticipants,
          eventSlug: normalizedEvent.slug,
        } : null}
      />

      <EventContent event={normalizedEvent} />
      <EventRelated currentEvent={normalizedEvent} events={normalizedEvent.relatedEvents} />
    </>
  );
}
