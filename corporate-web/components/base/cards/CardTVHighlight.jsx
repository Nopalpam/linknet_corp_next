'use client';

import React, { useState } from 'react';
import ModalTVHighlight from '../modals/ModalTVHighlight';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

const badgeToneMap = {
  'coming soon': 'bg-white text-black',
  'trending': 'bg-white text-black',
  'now showing': 'bg-white text-black'
};

export default function CardTVHighlight({
  badge = 'Coming Soon',
  image,
  posterImageLandscape,
  bgImageVertical,
  title = 'MIKE BREWER: BORN DEALER',
  year = '2025',
  category = 'TV Series',
  rating = '13+',
  metaItems,
  channelLogo,
  channelName,
  posterImage,
  synopsis,
  watchChannel,
  watchChannelCode,
  trailerUrl,
  details = [],
  href,
  className = '',
  mediaClassName = '',
  imageClassName = '',
  contentClassName = '',
  titleClassName = '',
  metaClassName = '',
  channelWrapClassName = '',
  channelLogoClassName = ''
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const normalizedBadge = String(badge).trim().toLowerCase();
  const badgeToneClass = badgeToneMap[normalizedBadge] || badgeToneMap['coming soon'];
  const resolvedMetaItems = Array.isArray(metaItems) && metaItems.length > 0
    ? metaItems
    : [year, category, rating].filter(Boolean);

  const content = (
    <article
      className={cx(
        'lnCardTVHighlight CardTVHightlight CardTVHightlight_root',
        'group flex h-full w-full flex-col rounded-[16px] transition-all duration-300 p-0 md:scale-[0.97] md:p-2 md:hover:scale-100',
        'md:hover:bg-white md:hover:shadow-xs',
        className
      )}
    >
      <div className={cx(
        'lnCardTVHighlight__media CardTVHightlight_media relative overflow-hidden rounded-[12px] md:rounded-[12px]',
        mediaClassName
      )}>
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className={cx(
              'lnCardTVHighlight__image CardTVHightlight_image aspect-[5/7] w-full object-cover',
              imageClassName
            )}
          />
        ) : (
          <div className="lnCardTVHighlight__placeholder CardTVHightlight_placeholder aspect-[5/7] w-full bg-neutral-200" />
        )}

        {/* <div className="CardTVHightlight_overlay pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" /> */}

        {/* {badge && (
          <div className="lnCardTVHighlight__badgeWrap CardTVHightlight_badgeWrap absolute left-2 top-2 md:left-3 md:top-3">
            <span
              className={cx(
                'lnCardTVHighlight__badge CardTVHightlight_badge',
                'inline-flex items-center rounded-full px-2.5 py-1.5',
                'text-caption-c1 font-medium',
                badgeToneClass
              )}
            >
              {badge}
            </span>
          </div>
        )} */}
      </div>

      <div className={cx(
        'lnCardTVHighlight__content CardTVHightlight_content flex flex-1 flex-col gap-1 px-2 pb-2 pt-2.5 md:px-2 md:pt-2.5',
        contentClassName
      )}>
        <div className="lnCardTVHighlight__header CardTVHightlight_header flex items-start justify-between gap-2">
          <h3 className={cx(
            'lnCardTVHighlight__title CardTVHightlight_title line-clamp-2 min-h-[44px] min-w-0 flex-1 text-body-b5 font-bold uppercase text-black',
            titleClassName
          )}>
            {title}
          </h3>

          {(channelLogo || channelName) && (
            <div className={cx(
              'lnCardTVHighlight__channel CardTVHightlight_channel flex shrink-0 items-center justify-end pt-1',
              channelWrapClassName
            )}>
              {channelLogo ? (
                <img
                  src={channelLogo}
                  alt={channelName || `${title} channel`}
                  loading="lazy"
                  className={cx(
                    'lnCardTVHighlight__channelLogo CardTVHightlight_channelLogo h-[16px] w-auto object-contain md:h-[44px]',
                    channelLogoClassName
                  )}
                />
              ) : (
                <span className="lnCardTVHighlight__channelName CardTVHightlight_channelName text-caption-c1 font-semibold leading-none tracking-[0.01em] text-secondary">
                  {channelName}
                </span>
              )}
            </div>
          )}
        </div>

        <p className={cx(
          'lnCardTVHighlight__meta CardTVHightlight_meta text-body-b5 font-regular text-secondary',
          metaClassName
        )}>
          {resolvedMetaItems.map((item, index) => (
            <React.Fragment key={`${item}-${index}`}>
              {index > 0 && <span className="px-1.5">{'\u00b7'}</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </p>
      </div>
    </article>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="lnCardTVHighlight__trigger block w-full border-0 bg-transparent p-0 text-left"
        aria-label={`Open details for ${title}`}
      >
        {content}
      </button>

      {isModalOpen && (
        <ModalTVHighlight
          onClose={() => setIsModalOpen(false)}
          item={{
            title,
            year,
            category,
            rating,
            posterImageLandscape,
            bgImageVertical,
            posterImage,
            synopsis,
            channelLogo,
            channelName,
            watchChannel,
            watchChannelCode,
            trailerUrl,
            details,
            href
          }}
        />
      )}
    </>
  );
}
