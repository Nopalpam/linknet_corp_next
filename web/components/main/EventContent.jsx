'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import Button from '@/components/base/Button';
import LinknetLink from '@/components/base/Link';
import Icon from '@/components/base/Icon';
import { useModalFormEventRegister } from '@/components/base/modals/ModalFormEventRegister';
import { formatEventDateLabel, formatEventTimeLabel, formatEventTimestamp } from '@/data/components/eventList';
import { NEWS_LIST } from '@/data/components/newsList';

const COLLAPSED_HEIGHT = 500;

function formatArticleDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DetailItem({ icon, label, value, subvalue, highlight }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F7F7] text-black">
        <Icon name={icon} style={{ '--icon-size': '20px' }} />
      </div>

      <div className="min-w-0">
        <p className="text-caption-c1 font-regular text-secondary">{label}</p>
        <p className={`mt-1 text-body-b4 font-medium ${highlight ? 'text-black' : 'text-[#393939]'}`}>
          {value}
        </p>
        {subvalue ? (
          <p className="mt-0.5 text-body-b5 font-regular text-secondary">
            {subvalue}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function EventContent({ event }) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const { openModal } = useModalFormEventRegister();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);
  const detailHeaderRef = useRef(null);
  const contentWrapRef = useRef(null);
  const contentInnerRef = useRef(null);
  const contentHeightRef = useRef(0);
  const isExpandedRef = useRef(false);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  useLayoutEffect(() => {
    if (!contentWrapRef.current || !contentInnerRef.current) return undefined;

    const wrap = contentWrapRef.current;
    const inner = contentInnerRef.current;

    const updateCollapsedState = () => {
      const fullHeight = inner.scrollHeight;
      contentHeightRef.current = fullHeight;
      const nextExpandable = fullHeight > COLLAPSED_HEIGHT + 8;

      setIsExpandable(nextExpandable);

      gsap.killTweensOf(wrap);
      gsap.set(wrap, {
        height: nextExpandable && !isExpandedRef.current ? COLLAPSED_HEIGHT : 'auto',
      });
    };

    updateCollapsedState();
    const resizeObserver = new ResizeObserver(updateCollapsedState);
    resizeObserver.observe(inner);
    window.addEventListener('resize', updateCollapsedState);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCollapsedState);
      gsap.killTweensOf(wrap);
    };
  }, [event?.content]);

  useEffect(() => {
    if (!contentWrapRef.current || !contentInnerRef.current || !isExpandable) return;

    const wrap = contentWrapRef.current;
    const fullHeight = contentHeightRef.current || contentInnerRef.current.scrollHeight;

    gsap.killTweensOf(wrap);

    if (isExpanded) {
      gsap.fromTo(
        wrap,
        { height: wrap.offsetHeight || COLLAPSED_HEIGHT },
        {
          height: fullHeight,
          duration: 0.45,
          ease: 'power2.inOut',
          onComplete: () => gsap.set(wrap, { height: 'auto' }),
        }
      );
      return;
    }

    gsap.fromTo(
      wrap,
      { height: wrap.offsetHeight || fullHeight },
      {
        height: COLLAPSED_HEIGHT,
        duration: 0.4,
        ease: 'power2.inOut',
      }
    );
  }, [isExpanded, isExpandable, event?.content]);

  if (!event) return null;

  const organizer = event.organizer || {};
  const locationSection = event.locationSection || {};
  const isEnded = event.status === 'ended';
  const relatedArticle = Array.isArray(event?.articleIds)
    ? event.articleIds
        .map((id) => NEWS_LIST.find((item) => item.id === id && item.status === 'active'))
        .find(Boolean) || null
    : null;

  const handleToggleExpand = () => {
    const nextExpanded = !isExpanded;

    if (!nextExpanded && detailHeaderRef.current) {
      const top = detailHeaderRef.current.getBoundingClientRect().top + window.scrollY - 96;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: 'smooth',
      });
    }

    setIsExpanded(nextExpanded);
  };

  const handleRegisterClick = () => {
    if (isEnded) {
      return;
    }

    openModal({
      eventName: event.title,
      Promo_Website__c: event.title,
      Page_Website__c: `/${locale}/events/${event.slug}`,
      Source_Website__c: 'Event Website',
      maxParticipants: event.maxRegisterParticipants,
      eventSlug: event.slug,
    });
  };

  return (
    <section className="bg-white pb-20 pt-8 md:pb-28 md:pt-10">
      <div className="container">
        <div className="grid gap-10 grid-cols-1 md:grid-cols-3">
          <div className="min-w-0 md:col-span-2">
            {relatedArticle ? (
              <div className="mb-10 rounded-[16px] border border-neutral p-4 md:py-4 md:px-5">
                <p className="text-body-b5 font-regular text-secondary">Article about this event</p>

                <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <Link
                      href={`/${locale}/news/${relatedArticle.slug}`}
                      className="block shrink-0 overflow-hidden rounded-[16px]"
                    >
                      <img
                        src={relatedArticle.image}
                        alt={relatedArticle.title}
                        className="h-[72px] w-[72px] object-cover"
                      />
                    </Link>

                    <div className="min-w-0">
                      <Link
                        href={`/${locale}/news/${relatedArticle.slug}`}
                        className="text-body-b4 font-medium text-black transition-colors line-clamp-2 hover:text-primary"
                      >
                        {relatedArticle.title}
                      </Link>
                      <p className="mt-1 text-body-b5 font-regular text-secondary">
                        {formatArticleDate(relatedArticle.newsDate)}
                      </p>
                    </div>
                  </div>

                  <LinknetLink
                    href={`/${locale}/news/${relatedArticle.slug}`}
                    variant="secondary-outline"
                    size="md"
                    className="shrink-0 !hidden md:!block"
                  >
                    <span>Read Article</span>
                  </LinknetLink>
                </div>
              </div>
            ) : null}

            <h2 ref={detailHeaderRef} className="hidden text-headline-h5 font-bold text-black">Event Detail</h2>

            <div
              ref={contentWrapRef}
              className="lnEventDetail relative mt-4 overflow-hidden"
            >
              <div
                ref={contentInnerRef}
                className="text-body-b4 font-regular text-black [&>p]:mb-5 [&>blockquote]:mb-9 [&>blockquote]:max-w-[880px] [&>blockquote]:text-body-b4 [&>blockquote]:font-regular [&>blockquote]:text-[#393939] md:[&>blockquote]:text-[18px]"
                dangerouslySetInnerHTML={{ __html: event.content }}
              />

              {isExpandable && !isExpanded ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/92 to-transparent" />
              ) : null}
            </div>

            {isExpandable ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className="inline-flex items-center gap-2 text-body-b5 font-medium text-black transition-colors hover:text-primary"
                >
                  <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    style={{ '--icon-size': '16px' }}
                  />
                </button>
              </div>
            ) : null}

            <div className="mt-12">
              <p className="text-body-b5 font-regular text-secondary">
                {organizer.label}
              </p>

              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral bg-white shadow-[0_8px_20px_rgba(19,19,19,0.04)]">
                  <img
                    src={organizer.logo}
                    alt={organizer.name}
                    className="h-2.5 w-auto object-contain"
                  />
                </div>

                <p className="text-body-b4 font-medium text-black">
                  {organizer.name}
                </p>
              </div>
            </div>
          </div>

          <aside className="md:sticky xl:top-24 xl:self-start lg:-mt-[156px] w-full">
            <div className="rounded-[20px] border border-[#F3F3F3] bg-white p-6 shadow-[0_28px_70px_rgba(19,19,19,0.08)] md:p-[24px]">
              <h3 className="text-headline-h5 font-bold text-black">Event Detail</h3>

              <div className="mt-5 space-y-4">
                <DetailItem
                  icon="calendar"
                  label="Date"
                  value={formatEventDateLabel(event)}
                  subvalue={formatEventTimeLabel(event)}
                />
                <DetailItem
                  icon="pin-location"
                  label="Venue"
                  value={event.venue}
                />
                <DetailItem
                  icon="pricing-tag"
                  label="Ticket Price"
                  value={event.ticketPrice}
                  highlight
                />
              </div>

              <div className="mt-8">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={isEnded}
                  onClick={handleRegisterClick}
                  className="w-full"
                >
                  <span>{isEnded ? 'Event has Ended' : 'Register Now'}</span>
                </Button>

                {!isEnded ? (
                  <p className="mt-5 text-center text-caption-c1 font-regular text-secondary">
                    Registered Open Until <br /> {formatEventTimestamp(event.registrationEndedTime)}
                  </p>
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-16 border-t border-[#E8E8E8] pt-16 md:mt-20 md:pt-20">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_820px] xl:gap-[72px]">
            <div>
              <h2 className="text-headline-h4 font-bold text-black">
                Event Location
              </h2>
            </div>

            <div className="min-w-0">
              <div className="overflow-hidden rounded-[24px] border border-[#F3F3F3] bg-white shadow-[0_20px_54px_rgba(19,19,19,0.06)]">
                <div className="aspect-[824/424] overflow-hidden bg-[#F5F5F5]">
                  <iframe
                    title={locationSection.name || 'Event map'}
                    src={locationSection.mapEmbedUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>

                <div className="p-6 md:p-8">
                  <h3 className="text-headline-h5 font-bold text-black">
                    {locationSection.name}
                  </h3>

                  <p className="mt-2 max-w-[620px] text-body-b4 font-regular text-secondary">
                    {locationSection.address}
                  </p>

                  <div className="mt-7">
                    <LinknetLink
                      href={locationSection.directionsLink}
                      target="_blank"
                      rel="noreferrer"
                      variant="secondary-outline"
                      size="md"
                      iconLeft={<Icon name="pin-location" style={{ '--icon-size': '20px' }} />}
                    >
                      <span>Get Direction</span>
                    </LinknetLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
