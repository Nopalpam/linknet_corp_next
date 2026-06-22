'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function CardTVChannel({
  image,
  imageAlt,
  channelName,
  channelNumber,
  className = ''
}) {
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      y: -4,
      boxShadow: '0 14px 34px rgba(47, 47, 47, 0.12)',
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: '',
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  return (
    <article
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cx(
        'lnCardTVChannel lnGsapTvChannelCard flex w-full items-center gap-4 min-h-[80px] md:min-h-[90px] rounded-[16px] bg-white px-[16px] py-[12px] md:px-[20px] md:py-[12px] shadow-md will-change-transform md:gap-4',
        className
      )}
    >
      {image && (
        <div className="lnCardTVChannel__media flex h-auto w-[56px] shrink-0 items-center justify-center">
          <Image
            src={image}
            alt={imageAlt || channelName || 'TV channel logo'}
            width={56}
            height={56}
            className="lnCardTVChannel__image h-auto w-[56px] object-contain"
            sizes="56px"
          />
        </div>
      )}

      <div className="lnCardTVChannel__content flex min-w-0 flex-1 flex-col">
        {channelName && (
          <h3 className="lnCardTVChannel__title text-body-b4 font-medium text-black line-clamp-1">
            {channelName}
          </h3>
        )}

        {channelNumber && (
          <p className="lnCardTVChannel__number mt-1 text-caption-c1 font-regular text-secondary">
            {channelNumber}
          </p>
        )}
      </div>
    </article>
  );
}
