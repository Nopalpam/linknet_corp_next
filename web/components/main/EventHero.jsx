'use client';

import { useCallback } from 'react';
import LinknetLink from '@/components/base/Link';
import Button from '@/components/base/Button';
import Icon from '@/components/base/Icon';
import { useModalFormEventRegister } from '@/components/base/modals/ModalFormEventRegister';

const STATUS_CONFIG = {
  upcoming: {
    label: 'Upcoming',
    dotClassName: 'bg-[#FFB800]',
  },
  ongoing: {
    label: 'On Going',
    dotClassName: 'bg-[#12A594]',
  },
  ended: {
    label: 'Ended',
    dotClassName: 'bg-white/70',
  },
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function normalizeImageSrc(src) {
  return typeof src === 'string' && src.trim() ? src.trim() : null;
}

export default function EventHero({
  config,
  posterSrc = '',
  posterAlt = 'Event Poster',
  thumbnailSrc = '',
  thumbnailMobileSrc = '',
  badgeText,
  status = 'ongoing',
  title = 'Linknet Strengthens the Digital Ecosystem Through the National Technology Summit 2025',
  location = 'at Pullman Jakarta Indonesia Thamrin CBD, Jakarta',
  dateLabel = 'Sep 14 - Sep 20, 2026',
  timeLabel = '05:00 - 14:00 WIB',
  ctaText = 'Register',
  ctaLink = '#',
  ctaTarget = '_self',
  ctaModalPayload = null,
  className = '',
}) {
  const { openModal } = useModalFormEventRegister();
  const {
    sectionId,
    className: configClassName = '',
    bgImage: configBgImageDesktop = '',
    bgImageMobile: configBgImageMobile = '',
  } = config || {};

  const resolvedThumbnailDesktop =
    normalizeImageSrc(configBgImageDesktop) || normalizeImageSrc(thumbnailSrc);
  const resolvedThumbnailMobile =
    normalizeImageSrc(configBgImageMobile) ||
    normalizeImageSrc(thumbnailMobileSrc) ||
    resolvedThumbnailDesktop;
  const resolvedPosterSrc =
    normalizeImageSrc(posterSrc) || resolvedThumbnailDesktop || resolvedThumbnailMobile;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.ongoing;
  const statusLabel = badgeText || statusConfig.label;
  const hasBackground = Boolean(resolvedThumbnailDesktop || resolvedThumbnailMobile);
  const isEnded = status === 'ended';
  const resolvedCtaText = isEnded ? 'Event has Ended' : ctaText;
  const shouldOpenModal = Boolean(ctaModalPayload);

  const handleCtaClick = useCallback(() => {
    if (isEnded || !shouldOpenModal) {
      return;
    }

    openModal(ctaModalPayload);
  }, [ctaModalPayload, isEnded, openModal, shouldOpenModal]);

  return (
    <section
      id={sectionId}
      className={cn('bg-white p-2 pt-0', configClassName, className)}
    >
      <div className="relative w-full overflow-hidden rounded-[20px] md:rounded-[24px]">
        <div className="relative [85vh] md:h-[72vh] md:min-h-0">
          {hasBackground && (
            <>
              {resolvedThumbnailDesktop && (
                <img
                  src={resolvedThumbnailDesktop}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 hidden h-full w-full scale-110 object-cover blur-[24px] md:block"
                />
              )}

              {resolvedThumbnailMobile && (
                <img
                  src={resolvedThumbnailMobile}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 block h-full w-full scale-110 object-cover blur-[24px] md:hidden"
                />
              )}

              {/* {resolvedThumbnailDesktop && (
                <img
                  src={resolvedThumbnailDesktop}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 hidden h-full w-full object-cover md:block"
                />
              )}

              {resolvedThumbnailMobile && (
                <img
                  src={resolvedThumbnailMobile}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 block h-full w-full object-cover md:hidden"
                />
              )} */}
            </>
          )}

          <div className="absolute inset-0 bg-[#131313]/[0.32]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131313]/45 via-[#131313]/24 to-[#131313]/18" />

          <div className="relative z-10 flex h-full items-end px-6 pb-6 pt-8 md:px-[56px] md:pb-[52px] md:pt-[56px]">
            <div className="flex w-full flex-col items-center gap-7 text-center md:max-w-[750px] md:flex-row md:items-start md:text-left">
              <div className="shrink-0">
                <div className="overflow-hidden aspect-[300/373] w-[200px] rounded-[12px] shadow-md md:rounded-[12px]">
                  {resolvedPosterSrc ? (
                    <img
                      src={resolvedPosterSrc}
                      alt={posterAlt}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/12 text-center text-body-b5 font-medium text-white/80">
                      {posterAlt}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex min-w-0 max-w-[698px] flex-1 flex-col items-center md:items-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/12 px-2.5 py-1 backdrop-blur-[18px]">
                  <span className={cn('h-2.5 w-2.5 rounded-full', statusConfig.dotClassName)} />
                  <span className="text-caption-c1 font-medium text-white">
                    {statusLabel}
                  </span>
                </div>

                <h1 className="mt-4 max-w-[698px] text-headline-h4 md:text-headline-h3 font-bold text-white line-clamp-4">
                  {title}
                </h1>

                <p className="mt-3 text-body-b5 md:text-body-b4  font-regular text-white/80">
                  at {location}
                </p>

                <div className="mt-6 md:mt-4 flex w-full flex-col items-start gap-4 rounded-[16px] border border-white/8 bg-white/14 p-4 backdrop-blur-[18px] md:mt-[24px] md:w-auto md:min-w-[400px] md:flex-row md:items-center justify-start md:justify-between md:gap-4 md:px-[14px] md:py-[10px]">
                  <div className="flex min-w-0 items-center gap-3 md:gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-white">
                      <Icon
                        name="calendar"
                        colorClass="icon--white"
                        className="h-5 w-5"
                        style={{ '--icon-size': '20px' }}
                      />
                    </div>

                    <div className="min-w-0 text-left">
                      <p className="truncate text-body-b5 font-medium text-white">
                        {dateLabel}
                      </p>
                      <p className="text-caption-c1 mt-0.5 font-regular text-white/88">
                        {timeLabel}
                      </p>
                    </div>
                  </div>

                  {shouldOpenModal ? (
                    <Button
                      type="button"
                      variant="secondary-outline--white"
                      size="md"
                      disabled={isEnded}
                      onClick={handleCtaClick}
                      className="w-full md:w-auto"
                    >
                      <span>{resolvedCtaText}</span>
                    </Button>
                  ) : (
                    <LinknetLink
                      href={ctaLink}
                      target={ctaTarget}
                      variant="secondary-outline--white"
                      size="md"
                      disabled={isEnded}
                      className="w-full md:w-auto"
                    >
                      <span>{resolvedCtaText}</span>
                    </LinknetLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
