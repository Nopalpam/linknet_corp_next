import React from 'react';
import Link from 'next/link';
import Icon from '../Icon';
import { formatEventDateLabel } from '@/lib/eventFormatters';

const STATUS_STYLES = {
  upcoming: {
    label: 'Upcoming',
    badgeClassName: 'bg-white text-black',
    dotClassName: 'bg-[#FFB800]',
  },
  ongoing: {
    label: 'On Going',
    badgeClassName: 'bg-white text-black',
    dotClassName: 'bg-[#12A594]',
  },
  ended: {
    label: 'Ended',
    badgeClassName: 'bg-white/50 text-black/70 backdrop-blur-sm',
    dotClassName: 'bg-white',
  },
};

const DEFAULT_STATUS = STATUS_STYLES.upcoming;

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function CardEventContent({
  title,
  image,
  date,
  startDate,
  endDate,
  location,
  status = 'upcoming',
  className = '',
}) {
  const statusConfig = STATUS_STYLES[status] || DEFAULT_STATUS;
  const eventDateLabel = formatEventDateLabel({ date, startDate, endDate });

  return (
    <>
      <div className="lnCardEvent__media relative overflow-hidden rounded-[12px] md:rounded-[20px]">
        <div className="lnCardEvent__badgeWrap absolute left-2 top-2 md:left-3 md:top-3 z-10">
          <span
            className={cn(
              'lnCardEvent__badge inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption-c1 font-medium leading-none shadow-md',
              statusConfig.badgeClassName
            )}
          >
            <span className={cn('lnCardEvent__badgeDot h-2 w-2 rounded-full', statusConfig.dotClassName)} />
            {statusConfig.label}
          </span>
        </div>

        <div className="lnCardEvent__thumbnail aspect-[300/373] w-full overflow-hidden bg-neutral-100">
          {image ? (
            <img
              src={image}
              alt={title}
              className="lnCardEvent__image h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-caption-c1 font-semibold uppercase tracking-wider text-neutral-500">
              Event
            </div>
          )}
        </div>
      </div>

      <div className="lnCardEvent__content flex flex-1 flex-col gap-5 p-[16px] pt-[10px] md:p-[20px] md:pt-[12px]">
        <h3 className="lnCardEvent__title text-body-b5 md:text-body-b4 font-bold leading-[1.35] text-black line-clamp-3 md:line-clamp-2">
          {title}
        </h3>

        <div className="lnCardEvent__footer mt-auto">
          <div className="lnCardEvent__details flex flex-1 flex-col gap-1.5">
            {eventDateLabel && (
              <div className="lnCardEvent__detailItem flex items-center gap-2 text-caption-c1 md:text-body-b5 text-secondary">
                <Icon name="calendar" className="text-secondary" />
                <span className="lnCardEvent__detailText">{eventDateLabel}</span>
              </div>
            )}

            {location && (
              <div className="lnCardEvent__detailItem flex items-center gap-2 text-caption-c1 md:text-body-b5 text-secondary">
                <Icon name="pin-map" className="text-secondary" />
                <span className="lnCardEvent__detailText">{location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function CardEvent({
  href,
  target,
  rel,
  ...props
}) {
  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={cn(
          'lnCardEvent border border-gray-100 group flex h-full max-w-[300px] w-full flex-col overflow-hidden rounded-[12px] md:rounded-[20px] bg-white shadow-md transition-all duration-300',
          props.className
        )}
      >
        <CardEventContent {...props} />
      </Link>
    );
  }

  return (
    <div
      className={cn(
        'lnCardEvent border border-gray-100 group flex h-full max-w-[300px] w-full flex-col overflow-hidden rounded-[12px] md:rounded-[20px] bg-white shadow-md transition-all duration-300',
        props.className
      )}
    >
      <CardEventContent {...props} />
    </div>
  );
}
