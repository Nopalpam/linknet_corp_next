'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import Icon from '../Icon';
import Button from '../Button';
import Linknetlink from '../Link';

function MetaLine({ year, category, rating }) {
  return (
    <div className="lnModalTVHighlight_meta flex flex-wrap items-center gap-x-2 gap-y-1 text-body-b5 font-regular text-white/95">
      {[year, category, rating].filter(Boolean).map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          {index > 0 && <span className="lnModalTVHighlight_metaDivider text-white/20">|</span>}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ModalTVHighlight({
  onClose,
  item
}) {
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);
  const modalBoxRef = useRef(null);

  const handleClose = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in'
    });

    gsap.to(modalBoxRef.current, {
      opacity: 0,
      y: 24,
      scale: 0.98,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => onClose?.()
    });
  }, [isClosing, onClose]);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: 'power2.out' }
    );

    gsap.fromTo(
      modalBoxRef.current,
      { opacity: 0, y: 40, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  if (!item) return null;

  const {
    title,
    year,
    category,
    rating,
    bgImageVertical,
    posterImage,
    synopsis,
    channelLogo,
    channelName,
    watchChannel = channelName,
    watchChannelCode,
    trailerUrl,
    details = []
  } = item;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="lnModalTVHighlight_overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm md:p-6"
      onClick={handleClose}
    >
      <div
        ref={modalBoxRef}
        className="lnModalTVHighlight_shell relative flex h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[24px] bg__lightGradient shadow-2xl md:h-[700px]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          className="lnModalTVHighlight_close fixed right-5 top-5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/45"
        >
          <Icon name="close" style={{ '--icon-size': '24px' }} />
        </button>

        <div className="lnModalTVHighlight_scroll min-h-0 flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
          <div className="lnModalTVHighlight_hero relative h-[420px] shrink-0 overflow-hidden md:h-[430px]">
            <img
              src={bgImageVertical || posterImage}
              alt={title}
              className="lnModalTVHighlight_backdrop h-full w-full object-cover"
            />
            <div className="lnModalTVHighlight_backdropOverlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

            <div className="lnModalTVHighlight_content absolute inset-x-0 bottom-0 z-10">
              <div className="lnModalTVHighlight_header flex items-end gap-4 px-6 pb-2 md:gap-5 md:px-8 md:pb-0">
                <div className="lnModalTVHighlight_poster h-[132px] w-[92px] shrink-0 overflow-hidden rounded-[10px] bg-white/15 shadow-lg md:h-[150px] md:w-[104px]">
                  <img
                    src={posterImage || bgImageVertical}
                    alt={`${title} poster`}
                    className="lnModalTVHighlight_posterImage h-full w-full object-cover"
                  />
                </div>

                <div className="lnModalTVHighlight_headingWrap min-w-0 flex-1">
                  <h2 className="lnModalTVHighlight_title max-w-[340px] text-headline-h4 font-bold text-white md:max-w-[360px]">
                    {title}
                  </h2>
                  <div className="lnModalTVHighlight_metaWrap mt-1 md:mt-2">
                    <MetaLine year={year} category={category} rating={rating} />
                  </div>
                </div>
              </div>

              <div className="lnModalTVHighlight_watchStrip mt-4 bg-black/18 px-4 py-4 backdrop-blur-md md:px-5">
                <div className="lnModalTVHighlight_watchRow flex flex-col gap-2 text-white md:flex-row md:items-center md:justify-between">
                  <div className="lnModalTVHighlight_watchInfo flex items-center gap-3">
                    <span className="lnModalTVHighlight_watchLabel text-body-b4 font-medium leading-none text-white">Watch on</span>
                    <div className="flex items-center gap-2">
                      {channelLogo ? (
                        <img
                          src={channelLogo}
                          alt={channelName || watchChannel}
                          className="lnModalTVHighlight_watchLogo max-h-[26px] w-auto object-contain"
                        />
                      ) : null}
                      <div className="lnModalTVHighlight_watchText flex flex-col">
                        <span className="lnModalTVHighlight_watchChannel text-body-b5 font-bold leading-none text-white">{watchChannel}</span>
                        {watchChannelCode && (
                          <span className="lnModalTVHighlight_watchCode text-body-b5 font-regular leading-none text-white/65">{watchChannelCode}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Linknetlink
                    href={trailerUrl || '#'}
                    variant="primary-reverse"
                    size="md"
                    target="_blank"
                    iconLeft={<Icon name="play" style={{ '--icon-size': '20px' }} />}
                    rel="noreferrer"
                    className="lnModalTVHighlight_trailer"
                  >
                    Watch Trailer
                  </Linknetlink>
                </div>
              </div>
            </div>
          </div>

          <div className="lnModalTVHighlight_body px-6 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
            <section className="lnModalTVHighlight_section">
              <h3 className="lnModalTVHighlight_sectionTitle text-headline-h6 font-bold text-black">Synopsis</h3>
              <p className="lnModalTVHighlight_synopsis mt-2 text-body-b4 font-regular text-black">
                {synopsis}
              </p>
            </section>

            <section className="lnModalTVHighlight_section mt-10">
              <h3 className="lnModalTVHighlight_sectionTitle text-headline-h6 font-bold text-black">Detail</h3>

              <div className="lnModalTVHighlight_detailCard mt-2 rounded-[16px] bg-white p-4 shadow-lg md:p-6">
                <div className="lnModalTVHighlight_detailGrid grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
                  {details.map((detail) => (
                    <div key={detail.label} className="lnModalTVHighlight_detailItem min-w-0">
                      <div className="lnModalTVHighlight_detailLabel text-caption-c1 font-regular text-secondary">
                        {detail.label}
                      </div>
                      <div className="lnModalTVHighlight_detailValue mt-1 text-body-b4 font-medium text-black">
                        {detail.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="lnModalTVHighlight_footer mt-10 flex justify-center">
              <Button
                type="button"
                size="md"
                variant="primary-reverse"
                onClick={handleClose}
                iconLeft={<Icon name="close" style={{ '--icon-size': '20px' }} />}
                className="lnModalTVHighlight_closeCta shadow-lg hover:!bg-light-2/90"
              >
                Close Popup
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
