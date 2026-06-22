'use client';

import { useState } from 'react';
import Button from '../Button';
import LinknetLink from '../Link';
import Icon from '../Icon';

// ---------------------------------------------------------------------------
// CardSolutions – multi-variant solution card component
//
// Props (shared):
//   variant       : 'parent' | 'child' | 'child-lg'  (required)
//   thumbnail     : string – src URL for the card image (e.g. "/assets/images/leased-line.jpg")
//   thumbnailAlt  : string – alt text for the image
//   category      : string – label shown on the badge (e.g. "Connectivity")
//   categoryIcon  : string – path to icon from /assets/icons/ (e.g. "/assets/icons/monitor.svg")
//   title         : string – card title
//   description   : string – short body copy
//   href          : string – destination URL for CTA / card link
//
// Extra props for child / child-lg:
//   tags          : string[] – "Suitable for:" pill tags
//   ctaLabel      : string   – override CTA text (default: "Learn More")
//
// Extra props for parent (variant="parent"):
//   ctaLabel      : string   – override CTA text (default: "View Details")
// ---------------------------------------------------------------------------

// ─── cx: lightweight classname joiner (avoids multiline whitespace hydration issues) ──
function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ─── Badge ──────────────────────────────────────────────────────────────────
function CardBadge({ icon, label }) {
  return (
    <div
      className="lnCardSolutions__badge lnCardBadge absolute top-4 left-4 flex items-center gap-1.5"
      role="note"
      aria-label={`Kategori: ${label}`}
    >
      <span className="lnCardSolutions__badgeIcon lnCardBadge__icon flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm shrink-0 h-[32px] w-[32px]">
        <img
          src={icon}
          alt=""
          aria-hidden={true}
          className="lnCardSolutions__badgeImage lnCardBadge__img w-5 h-5 object-contain"
        />
      </span>
      <span className="lnCardSolutions__badgeLabel lnCardBadge__label text-body-b5 font-medium text-black bg-white rounded-full px-2.5 py-1 shadow-sm h-[32px]">
        {label}
      </span>
    </div>
  );
}

// ─── Tag Pill ────────────────────────────────────────────────────────────────
function TagPill({ label }) {
  return (
    <span className="lnCardSolutions__tag lnCardTag inline-flex items-center px-3 py-1 bg-light-1 rounded-full text-caption-c1 font-regular text-black">
      {label}
    </span>
  );
}

// ─── variant="parent" ───────────────────────────────────────────────────────
function CardParent({ thumbnail, thumbnailAlt = '', category, categoryIcon, title, description, href = '#', ctaLabel = 'View Details', className }) {
  return (
    <article
      className={cx(
        'lnCardSolutions lnCardSolutions--parent lnCard lnCard--parent group relative flex flex-col w-full h-full md:h-[420px] p-2 bg-white md:bg-transparent shadow-(--shadow-md) md:shadow-none rounded-2xl md:overflow-hidden cursor-pointer',
        // Transisi parent: shadow dan background
        'transition-all duration-300 ease-in-out hover:bg-white ',
        className
      )}
    >
        <div className="lnCardSolutions__media lnCard__media relative w-full overflow-hidden rounded-2xl h-[275px] group-hover:md:h-full transition-transform duration-400 ease-linear">
            <img
                src={thumbnail}
                alt={thumbnailAlt || title}
                className={cx(
                    'lnCardSolutions__thumbnail lnCard__thumbnail w-full h-full object-cover ',
                )}
            />
            {category && <CardBadge icon={categoryIcon} label={category} />}
        </div>

      <div className="lnCardSolutions__body lnCard__body flex justify-between flex-col gap-2 pt-4 pb-4 px-2 z-10 min-h-[200px] md:min-h-max">
        <div className="lnCardSolutions__bodyText lnCard__body_text">
            <h3 className="lnCardSolutions__title lnCard__title text-headline-h5 font-bold text-black">{title}</h3>
            <p className="lnCardSolutions__desc lnCard__desc text-body-b5 text-secondary leading-relaxed line-clamp-3 md:line-clamp-2 group-hover:line-clamp-none mt-2">{description}</p>
        </div>

        <div
            className={cx(
            'lnCardSolutions__ctaWrap',
            // Menggunakan max-height dan padding transisi alih-alih h-auto
            'transition-all duration-300 ease-in-out md:max-h-0 md:opacity-0 md:translate-y-2 pointer-events-none',
            'group-hover:md:max-h-[100px] group-hover:opacity-100 group-hover:pointer-events-auto group-hover:md:pt-2 mt-4 md:mt-0'
            )}
        >
            <LinknetLink
                variant="secondary-outline"
                size='md'
                href={href}
                className="lnCardSolutions__cta"
                aria-label={`${ctaLabel} - ${title}`}
            >
            {ctaLabel}
            </LinknetLink>
        </div>

      </div>

      
    </article>
  );
}

// ─── variant="child" ─────────────────────────────────────────────────────
function CardChild({ thumbnail, thumbnailAlt = '', category, categoryIcon, title, description, href = '#', tags = [], ctaLabel = 'Learn More', className }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className={cx(
        'lnCardSolutions lnCardSolutions--child lnCard lnCard--child relative flex flex-col w-full bg-white rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 ease-in-out',
        hovered ? 'shadow-lg' : 'shadow-sm',
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="lnCardSolutions__media lnCard__media relative w-full h-[200px] min-h-[200px] overflow-hidden">
        <img
          src={thumbnail}
          alt={thumbnailAlt || title}
          className={cx(
            'lnCardSolutions__thumbnail lnCard__thumbnail w-full h-full object-cover transition-transform duration-500 ease-in-out',
            hovered ? 'scale-105' : 'scale-100'
          )}
        />
        {category && <CardBadge icon={categoryIcon} label={category} />}
      </div>

      <div className="lnCardSolutions__body lnCard__body flex flex-col gap-3 p-4 h-full">
        <div className="lnCardSolutions__productInfo lnCard__productInfo">
            <h3 className="lnCardSolutions__title lnCard__title text-body-b4 font-bold text-black line-clamp-2">{title}</h3>
            <p className="lnCardSolutions__desc lnCard__desc text-body-b5 text-secondary line-clamp-2 mt-1.5">{description}</p>
        </div>

        {tags.length > 0 && (
          <div className="lnCardSolutions__tags lnCard__tags flex flex-col gap-2">
            <span className="lnCardSolutions__tagsLabel text-caption-c1 text-secondary">Suitable for:</span>
            <div className="lnCardSolutions__tagsList flex flex-wrap gap-1.5">
              {tags.map((tag) => <TagPill key={tag} label={tag} />)}
            </div>
          </div>
        )}

        
      </div>

      <div className="lnCardSolutions__footer lnCard__footer flex flex-col gap-3 items-start p-4 pt-2">
        <LinknetLink
          variant="secondary-plain"
          size='md'
          href={href}
          iconRight={<Icon name="chevron-right" style={{
            '--icon-size': '20px'
          }} className="lnCardSolutions__ctaIcon" />}
          className={cx(
            'lnCardSolutions__cta lnCard__cta',
            
          )}
          aria-label={`${ctaLabel} - ${title}`}
        >
          {ctaLabel}
        </LinknetLink>
      </div>
    </article>
  );
}

// ─── variant="child-lg" ─────────────────────────────────────────────────────
function CardChildLg({ thumbnail, thumbnailAlt = '', category, categoryIcon, title, description, href = '#', tags = [], ctaLabel = 'Learn More' }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className={cx(
        'lnCardSolutions lnCardSolutions--childLg lnCard lnCard--child-lg relative flex flex-col w-full bg-white rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 ease-in-out',
        hovered ? 'shadow-lg' : 'shadow-sm'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="lnCardSolutions__media lnCard__media relative w-full h-[200px] min-h-[200px] overflow-hidden">
        <img
          src={thumbnail}
          alt={thumbnailAlt || title}
          className={cx(
            'lnCardSolutions__thumbnail lnCard__thumbnail w-full h-full object-cover transition-transform duration-500 ease-in-out',
            hovered ? 'scale-105' : 'scale-100'
          )}
        />
        {category && <CardBadge icon={categoryIcon} label={category} />}
      </div>

      <div className="lnCardSolutions__body lnCard__body flex flex-col gap-3 p-4 h-full">
        <div className="lnCardSolutions__productInfo lnCard__productInfo">
            <h3 className="lnCardSolutions__title lnCard__title text-body-b4 font-bold text-black line-clamp-2">{title}</h3>
            <p className="lnCardSolutions__desc lnCard__desc text-body-b5 text-secondary line-clamp-2 mt-1.5">{description}</p>
        </div>

        {tags.length > 0 && (
          <div className="lnCardSolutions__tags lnCard__tags flex flex-col gap-2">
            <span className="lnCardSolutions__tagsLabel text-caption-c1 text-secondary">Suitable for:</span>
            <div className="lnCardSolutions__tagsList flex flex-wrap gap-1.5">
              {tags.map((tag) => <TagPill key={tag} label={tag} />)}
            </div>
          </div>
        )}

        
      </div>

      <div className="lnCardSolutions__footer lnCard__footer flex flex-col gap-3 items-start p-4 pt-2">
        <LinknetLink
          variant="secondary-plain"
          size='md'
          href={href}
          iconRight={<Icon name="chevron-right" style={{
            '--icon-size': '20px'
          }} className="lnCardSolutions__ctaIcon" />}
          className={cx(
            'lnCardSolutions__cta lnCard__cta',
            
          )}
          aria-label={`${ctaLabel} - ${title}`}
        >
          {ctaLabel}
        </LinknetLink>
      </div>
    </article>
  );
}

// ─── Public API ─────────────────────────────────────────────────────────────
/**
 * CardSolutions
 *
 * @param {'parent'|'child'|'child-lg'} variant
 * @param {string}   thumbnail      – e.g. "/assets/images/leased-line.jpg"
 * @param {string}   [thumbnailAlt] – alt text
 * @param {string}   [category]     – badge label
 * @param {string}   [categoryIcon] – e.g. "/assets/icons/monitor.svg"
 * @param {string}   title
 * @param {string}   description
 * @param {string}   [href]
 * @param {string[]} [tags]
 * @param {string}   [ctaLabel]
 */
export default function CardSolutions({ variant = 'parent', ...props }) {
  switch (variant) {
    case 'child': return <CardChild {...props} />;
    case 'child-lg': return <CardChildLg {...props} />;
    case 'parent':
    default:         return <CardParent {...props} />;
  }
}
