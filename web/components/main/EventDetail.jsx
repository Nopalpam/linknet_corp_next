import Link from 'next/link';
import EventRegistrationForm from './EventRegistrationForm';
import EventRelatedNews from './EventRelatedNews';
import {
  formatEventDateLabel,
  formatEventTimeLabel,
  formatEventTimestamp,
  stripHtml,
} from '@/lib/eventFormatters';

const STATE_BADGE_CLASS = {
  upcoming: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-emerald-100 text-emerald-800',
  ended: 'bg-neutral-200 text-neutral-700',
};

function renderMetaItem(label, value) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-caption-c1 font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <p className="mt-2 text-body-b4 font-medium text-black">{value}</p>
    </div>
  );
}

export default function EventDetail({ event, locale = 'en' }) {
  const state = event.public_state || event.state || 'event';
  const dateLabel = formatEventDateLabel(event);
  const timeLabel = formatEventTimeLabel(event);
  const excerpt = stripHtml(event.excerpt || '');
  const organizer = event.organizer || {
    label: event.organizer_label || 'Organized by',
    name: event.organizer_name || 'PT Link Net Tbk',
    logo: event.organizer_logo || '/assets/logos/linknet-logo.svg',
  };
  const locationSection = event.locationSection || event.location_section;
  const externalRegisterLink = event.registerLink || event.register_link;
  const isRegistrationOpen = event.isRegistrationOpen ?? event.is_registration_open;
  const heroTitle = event.heroTitle || event.hero_title || event.title;
  const heroLocation = event.heroLocation || event.hero_location || [event.venue, event.location].filter(Boolean).join(', ');

  return (
    <article className="bg-white pb-20">
      <div className="container mx-auto px-4 pt-10 md:px-0 md:pt-14">
        <Link href={`/${locale}/events`} className="inline-flex items-center text-body-b5 font-medium text-secondary hover:text-black">
          ← Back to events
        </Link>
      </div>

      <div className="container mx-auto px-4 pt-6 md:px-0 md:pt-8">
        <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-neutral-50">
          {event.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.cover_image} alt={event.title} className="aspect-[16/7] w-full object-cover" />
          ) : (
            <div className="flex aspect-[16/7] items-center justify-center bg-gradient-to-br from-neutral-200 via-neutral-100 to-white text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Event Detail
            </div>
          )}

          <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-12">
            <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-caption-c1 font-semibold uppercase tracking-[0.24em] ${STATE_BADGE_CLASS[state] || 'bg-yellow-100 text-yellow-800'}`}>
                  {state}
                </span>
                <h1 className="mt-4 text-headline-h3 text-black">{heroTitle}</h1>

                <div className="mt-5 flex flex-wrap gap-3">
                  {dateLabel ? (
                    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-body-b5 font-medium text-secondary">
                      {dateLabel}
                    </span>
                  ) : null}
                  {timeLabel ? (
                    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-body-b5 font-medium text-secondary">
                      {timeLabel}
                    </span>
                  ) : null}
                  {heroLocation ? (
                    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-body-b5 font-medium text-secondary">
                      {heroLocation}
                    </span>
                  ) : null}
                </div>

                {excerpt ? (
                  <p className="mt-6 border-l-2 border-yellow-500 pl-4 text-body-b4 italic text-secondary">
                    {excerpt}
                  </p>
                ) : null}

                <div
                  className="prose prose-lg mt-8 max-w-none text-black prose-headings:text-black prose-a:text-blue-700"
                  dangerouslySetInnerHTML={{ __html: event.content }}
                />
              </div>

              <aside className="space-y-4">
                {renderMetaItem('Date', dateLabel)}
                {renderMetaItem('Time', timeLabel)}
                {renderMetaItem('Venue', event.venue)}
                {renderMetaItem('Location', event.address || heroLocation)}
                {renderMetaItem('Ticket', event.ticketPrice || event.ticket_price || 'FREE')}
                {event.registrationEndedTime || event.registration_end_at ? renderMetaItem('Registration Closes', formatEventTimestamp(event.registrationEndedTime || event.registration_end_at)) : null}

                <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
                  <p className="text-caption-c1 font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    {organizer.label}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    {organizer.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={organizer.logo} alt={organizer.name} className="h-12 w-12 rounded-full border border-neutral-200 object-contain bg-white p-2" />
                    ) : null}
                    <div>
                      <p className="text-body-b4 font-semibold text-black">{organizer.name}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-neutral-200 bg-black p-5 text-white">
                  <p className="text-caption-c1 font-semibold uppercase tracking-[0.18em] text-white/70">Registration</p>
                  {isRegistrationOpen ? (
                    <p className="mt-3 text-body-b5 text-white/80">
                      Registration is currently open for up to {event.maxRegisterParticipants || event.max_register_participants || 1} participant{(event.maxRegisterParticipants || event.max_register_participants || 1) > 1 ? 's' : ''} per company submission.
                    </p>
                  ) : (
                    <p className="mt-3 text-body-b5 text-white/80">
                      Registration is not available for this event at the moment.
                    </p>
                  )}

                  {externalRegisterLink && externalRegisterLink !== '#' ? (
                    <a
                      href={externalRegisterLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-3 text-body-b5 font-semibold text-black transition hover:bg-neutral-100"
                    >
                      Open External Registration
                    </a>
                  ) : null}
                </div>
              </aside>
            </div>

            {locationSection?.mapEmbedUrl || locationSection?.map_embed_url ? (
              <section className="mt-12 overflow-hidden rounded-[28px] border border-neutral-200 bg-white">
                <div className="border-b border-neutral-200 px-6 py-5">
                  <h2 className="text-body-b2 font-bold text-black">Event Location</h2>
                  {locationSection.address ? (
                    <p className="mt-2 text-body-b5 text-secondary">{locationSection.address}</p>
                  ) : null}
                </div>
                <iframe
                  title={locationSection.name || event.title}
                  src={locationSection.mapEmbedUrl || locationSection.map_embed_url}
                  className="h-[360px] w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
                {locationSection.directionsLink || locationSection.directions_link ? (
                  <div className="px-6 py-5">
                    <a
                      href={locationSection.directionsLink || locationSection.directions_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-black px-5 py-3 text-body-b5 font-semibold text-black transition hover:bg-black hover:text-white"
                    >
                      Get Directions
                    </a>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      </div>

      {isRegistrationOpen ? <EventRegistrationForm event={event} /> : null}
      <EventRelatedNews articles={event.relatedNews || event.related_news || []} locale={locale} />
    </article>
  );
}