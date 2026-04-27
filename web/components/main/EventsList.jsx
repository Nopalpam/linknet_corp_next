import Link from 'next/link';

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return '';
  }

  const startLabel = start.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!endDate) {
    return startLabel;
  }

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) {
    return startLabel;
  }

  const endLabel = end.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${startLabel} - ${endLabel}`;
}

export default function EventsList({ events = [], locale = 'en' }) {
  if (!events.length) {
    return (
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-0">
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
            <p className="text-body-b3 font-medium text-black">No events available</p>
            <p className="mt-2 text-body-b5 text-secondary">Published events will appear here once they are ready.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-0">
        <div className="mb-10 max-w-3xl">
          <span className="mb-3 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-caption-c1 font-semibold uppercase tracking-[0.24em] text-yellow-800">
            Events
          </span>
          <h1 className="text-headline-h4 text-black">Events</h1>
          <p className="mt-3 text-body-b4 text-secondary">
            Upcoming and published events from Link Net, rendered through the dedicated CMS event API.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/${locale}/events/${event.slug}`}
              className="group overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                {event.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-200 via-neutral-100 to-white text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    Event
                  </div>
                )}
                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-black/75 px-3 py-1 text-caption-c1 font-semibold uppercase tracking-[0.18em] text-white">
                    {event.public_state || 'event'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <p className="text-body-b5 font-medium text-secondary">{formatDateRange(event.start_date, event.end_date)}</p>
                  <h2 className="mt-2 text-body-b2 font-bold text-black">{event.title}</h2>
                </div>

                {event.excerpt ? (
                  <p className="line-clamp-3 text-body-b5 text-secondary">{event.excerpt.replace(/<[^>]*>/g, ' ')}</p>
                ) : null}

                <span className="inline-flex items-center text-body-b5 font-semibold text-black">
                  View detail
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}