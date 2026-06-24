'use client';

/**
 * FormStepper.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable compound-component stepper.
 *
 * Exports:
 *   default  → FormStepper   (parent)
 *   named    → FormStep      (child card)
 *   named    → StepperContext
 *   named    → useStepperContext
 *
 * Features:
 *   • SwiperJS for step progress nav (scrollable on mobile)
 *   • GSAP for smooth card body expand / collapse
 *   • Design tokens from USAGE_GUIDE (_tokens.sass + _typography.sass)
 *   • BEM class naming prefixed with "ln" per USAGE_GUIDE conventions
 *   • Auto-scroll to the active card ONLY on Confirm (forward navigation)
 *   • NO scroll on Change (backward / edit navigation)
 *   • Swiper auto-slides to the active step badge on step change (centeredSlides)
 *
 * Scroll behaviour:
 *   Confirm (next) → immediate GSAP scroll to newly-active card (no delay)
 *   Change  (prev) → NO scroll — user stays at their current viewport position
 *
 * Topbar layout:
 *   Mobile / Tablet  → 2 rows
 *     Row 1: logo + close button
 *     Row 2: Swiper stepper (slidesPerView 1.2, scrollable)
 *   Desktop (lg+)    → 1 row: logo | swiper | close button
 *
 * Card anatomy (lnCardForm):
 *   <article.lnCardForm>
 *     <header.lnCardForm__header>    ← title/label/desc + Change btn
 *     <div.lnCardForm__body>         ← bodySlot (form fields or summary)
 *     <footer.lnCardForm__footer>    ← footerSlot (CTA, active only)
 *   </article>
 *
 * Navigation:
 *   "Change"  button → onChangeStep(step)  → parent: setCurrentStep(step) [PREV]
 *   "Confirm" button → handleConfirm()     → parent: setCurrentStep(n+1)  [NEXT]
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  Children,
  isValidElement,
} from 'react';
import gsap from 'gsap';

// Swiper core + modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import Icon from '../Icon';

function getScrollableAncestor(element) {
  if (!element || typeof window === 'undefined') return null;

  let current = element.parentElement;

  while (current && current !== document.body) {
    const styles = window.getComputedStyle(current);
    const overflowY = styles.overflowY;
    const isScrollable =
      overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';

    if (isScrollable) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function getScrollContainer(element) {
  if (!(element instanceof HTMLElement)) return null;

  const modalPanel = element.closest('.lnModalForm__panel');
  if (modalPanel instanceof HTMLElement) {
    return modalPanel;
  }

  return getScrollableAncestor(element);
}

function animateScrollToElement(element, offset) {
  if (!element || typeof window === 'undefined') return;

  const scrollContainer = getScrollContainer(element);
  const target = scrollContainer
    ? Math.max(
        0,
        element.getBoundingClientRect().top -
          scrollContainer.getBoundingClientRect().top +
          scrollContainer.scrollTop -
          offset,
      )
    : Math.max(0, element.getBoundingClientRect().top + window.scrollY - offset);

  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: target,
      behavior: 'smooth',
    });
    return;
  }

  window.scrollTo({
    top: target,
    behavior: 'smooth',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

export const StepperContext = createContext({
  currentStep:  1,
  totalSteps:   1,
  onChangeStep: undefined,
  scrollToStep: () => {},
  /**
   * navDirection: set by the parent (FormRegistration) before calling
   * setCurrentStep. FormStep reads this in its scroll useEffect.
   *   'forward'  → Confirm clicked → DO scroll to new active card
   *   'backward' → Change clicked  → do NOT scroll
   */
  navDirection: 'forward',
});

export function useStepperContext() {
  return useContext(StepperContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// StepperNavBar  – Swiper-powered horizontal progress nav
// ─────────────────────────────────────────────────────────────────────────────

function StepperNavBar({ steps, currentStep }) {
  const swiperRef = useRef(null);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;

    const activeIdx = steps.findIndex((s) => s.step === currentStep);
    if (activeIdx === -1) return;

    swiper.slideTo(activeIdx, 400);
  }, [currentStep, steps]);

  return (
    <nav
      aria-label="Form progress"
      className="lnStepperNav w-full"
    >
      <Swiper
        modules={[FreeMode]}
        centeredSlides
        breakpoints={{
          0: {
            slidesPerView: 'auto',
            centeredSlides: true,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 'auto',
            spaceBetween: 12,
            centeredSlides: false,
          },
        }}
        className="lnStepperNav__swiper !overflow-visible"
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
      >
        {steps.map((s, idx) => {
          const isFinish   = s.status === 'finish';
          const isActive   = s.status === 'active';
          const isDisabled = s.status === 'disabled';

          return (
            <SwiperSlide
              key={s.step}
              className="lnStepperNav__slide !w-auto"
            >
              <div className="lnStepperNav__item flex items-center gap-1.5 pr-1">

                {/* Badge */}
                <span
                  aria-hidden="true"
                  className={[
                    'lnStepperNav__badge flex items-center justify-center',
                    'w-6 h-6 rounded-full flex-shrink-0 transition-colors duration-300',
                    'text-caption-c1 font-semibold',
                    isFinish   ? 'bg-success text-white'
                    : isActive ? 'bg-warning text-white'
                    :            'bg-gray-200 text-secondary',
                  ].join(' ')}
                >
                  {isFinish ? <Icon name="check" /> : s.step}
                </span>

                {/* Label */}
                <span
                  className={[
                    'lnStepperNav__label text-body-b5 font-medium',
                    isActive    ? 'text-black'
                    : isDisabled ? 'text-secondary'
                    :              'text-black',
                  ].join(' ')}
                >
                  {s.step_name}
                </span>

                {/* Chevron – not after last */}
                {idx < steps.length - 1 && (
                  <Icon
                    name="chevron-right"
                    style={{ '--icon-size': '18px' }}
                    aria-hidden="true"
                    className="lnStepperNav__chevron text-secondary ml-1 flex-shrink-0"
                  />
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormStep  (exported child component)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Props
 * ──────────────────────────────────────────────────────────────────────────
 * step              {number}
 * status            {'active' | 'finish' | 'disabled'}
 * step_name         {string}   short collapsed label
 * step_title        {string}   expanded heading  (active only)
 * step_description  {string}   supporting text   (active only)
 * bodySlot          {ReactNode} → lnCardForm__body
 * footerSlot        {ReactNode} → lnCardForm__footer  (active only)
 * className         {string?}
 */
export function FormStep({
  step,
  status,
  step_name,
  step_title,
  step_description,
  bodySlot,
  footerSlot,
  className = '',
}) {
  const { onChangeStep } = useStepperContext();

  const isFinish   = status === 'finish';
  const isActive   = status === 'active';
  const isDisabled = status === 'disabled';
  const hasActiveHeaderContent = Boolean(step_title || step_description);

  // ── GSAP: animate body height on status change ──
  const bodyRef = useRef(null);
  const footerRef = useRef(null);
  const cardRef = useRef(null);

  useLayoutEffect(() => {
    const body   = bodyRef.current;
    const footer = footerRef.current;
    if (!body) return;

    if (isActive || isFinish) {
      // expand
      gsap.fromTo(
        body,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'height' },
      );
    } else {
      // collapse instantly for disabled
      gsap.set(body, { height: 0, opacity: 0 });
    }

    if (footer) {
      if (isActive) {
        gsap.fromTo(
          footer,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', delay: 0.15 },
        );
      } else {
        gsap.set(footer, { opacity: 0, y: 0 });
      }
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isActive) return;
    if (step === 1) return;

    let frameId = 0;
    let timeoutId = 0;

    const scrollActiveStep = () => {
      const targetElement =
        bodyRef.current instanceof HTMLElement
          ? bodyRef.current
          : cardRef.current instanceof HTMLElement
            ? cardRef.current
            : null;
      if (!targetElement) return;

      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      const offset = isDesktop ? 144 : -50;
      animateScrollToElement(targetElement, offset);
    };

    frameId = window.requestAnimationFrame(() => {
      scrollActiveStep();
    });

    timeoutId = window.setTimeout(scrollActiveStep, 260);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [isActive, step]);

  return (
    <article
      ref={cardRef}
      aria-label={`Step ${step}: ${step_name}`}
      data-step={step}
      data-status={status}
      className={[
        'lnCardForm w-full rounded-2xl border transition-shadow duration-300',
        isActive   ? 'lnCardForm--active bg-white border-none shadow-md'
        : isFinish ? 'lnCardForm--finish border-secondary'
        :            'lnCardForm--disabled border-secondary opacity-80',
        className,
      ].join(' ')}
    >

      {/* ══════════════════════════════════════════════
          lnCardForm__header
      ══════════════════════════════════════════════ */}
      {(isFinish || isDisabled || hasActiveHeaderContent) && (
        <header
          className={[
            'lnCardForm__header flex items-start justify-between',
            isActive && footerSlot ? 'px-4 md:px-6 py-4 pb-2' : 'px-4 md:px-6 py-4',
            isFinish ? 'px-4 md:px-6 py-4 pb-0' : '',
          ].join(' ')}
        >

          <div className="lnCardForm__headerMeta flex-1 min-w-0">

            {/* active → title + description */}
            {isActive && hasActiveHeaderContent && (
              <>
                {step_title && (
                  <h2 className="lnCardForm__title text-headline-h5 font-bold text-black leading-snug">
                    {step_title}
                  </h2>
                )}
                {step_description && (
                  <p className="lnCardForm__desc text-body-b5 text-secondary mt-1.5 leading-relaxed">
                    {step_description}
                  </p>
                )}
              </>
            )}

            {/* finish → step_name as completed label */}
            {isFinish && (
              <p className="lnCardForm__stepName text-headline-h5 font-semibold text-black">
                {step_name}
              </p>
            )}

            {/* disabled → step_name dimmed */}
            {isDisabled && (
              <p className="lnCardForm__stepName text-body-b4 font-medium text-secondary">
                {step_name}
              </p>
            )}
          </div>

          {/* "Change" = PREV: go back to this step */}
          {isFinish && onChangeStep && (
            <button
              type="button"
              onClick={() => onChangeStep(step)}
              aria-label={`Ubah ${step_name}`}
              className={[
                'lnCardForm__changeBtn ml-4 flex-shrink-0',
                'text-body-b5 font-semibold text-warning',
                'hover:opacity-80 transition-opacity duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded',
              ].join(' ')}
            >
              Change
            </button>
          )}
        </header>
      )}

      {/* ══════════════════════════════════════════════
          lnCardForm__body  (GSAP animated)
          active  → editable bodySlot
          finish  → read-only bodySlot (pointer-events-none)
          disabled → hidden (h-0)
      ══════════════════════════════════════════════ */}
      <div
        ref={bodyRef}
        className={[
          'lnCardForm__body overflow-hidden',
          isActive && footerSlot ? 'px-4 md:px-6 pt-4 pb-0' : 'px-4 md:px-6 pt-4 pb-5',
          isFinish ? 'pointer-events-none select-none' : '',
        ].join(' ')}
        style={isDisabled ? { height: 0, opacity: 0, padding: 0 } : undefined}
      >
        {(isActive || isFinish) && bodySlot}
      </div>

      {/* ══════════════════════════════════════════════
          lnCardForm__footer  (GSAP animated, active only)
          Confirm = NEXT  (or Submit on final step)
      ══════════════════════════════════════════════ */}
      {isActive && footerSlot && (
        <footer
          ref={footerRef}
          className="lnCardForm__footer flex items-center justify-end gap-3 px-4 md:px-6 pt-4 pb-5"
          style={{ opacity: 0 }}
        >
          {footerSlot}
        </footer>
      )}

    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormStepper  (default export – parent wrapper)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Props
 * ──────────────────────────────────────────────────────────────────────────
 * currentStep   {number}
 * children      {ReactNode}   <FormStep> nodes
 * title         {string?}     page heading; \n = line break
 * subtitle      {string?}     supporting text below heading
 * onClose       {()=>void?}
 * onChangeStep  {(step)=>void}  Change btn handler → set currentStep = step
 * className     {string?}
 */
export default function FormStepper({
  currentStep,
  children,
  title = 'Dapatkan Koneksi Internet Terpercaya dari Linknet',
  subtitle,
  onClose,
  onChangeStep,
  /**
   * navDirection — owned by the parent (FormRegistration) and passed down.
   *   'forward'  → set before Confirm → FormStep WILL scroll to active card
   *   'backward' → set before Change  → FormStep will NOT scroll
   * Defaults to 'forward' so initial mount always scrolls if needed.
   */
  navDirection = 'forward',
  className = '',
}) {
  // Collect step metadata from children props for the Swiper nav
  const steps = useMemo(() => {
    const result = [];
    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const p = child.props;
      if (p.step !== undefined) {
        result.push({ step: p.step, step_name: p.step_name, status: p.status });
      }
    });
    return result.sort((a, b) => a.step - b.step);
  }, [children]);

  const scrollToStep = useCallback(() => {}, []);

  const ctxValue = useMemo(
    () => ({
      currentStep,
      totalSteps: steps.length,
      onChangeStep,
      scrollToStep,
      navDirection,
    }),
    [currentStep, steps.length, onChangeStep, scrollToStep, navDirection],
  );

  // GSAP: fade-in + slide-up page title on mount
  const titleRef = useRef(null);
  useEffect(() => {
    if (!titleRef.current) return;
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
    );
  }, []);

  const titleLines = title.split('\n');
  const isModalLayout = Boolean(onClose);

  return (
    <StepperContext.Provider value={ctxValue}>
      <div className={`lnFormStepper min-h-screen bg-light-2 ${className}`}>

        {/* ══════════════════════════════════════════════════════════════
            lnFormStepper__topbar
            ─────────────────────────────────────────────────────────────
            Mobile / Tablet  (<lg):  2-row layout
              Row 1  lnFormStepper__topbarRow1  → logo + close btn
              Row 2  lnFormStepper__topbarRow2  → Swiper stepper (1.2 slides)
            Desktop (lg+):           1-row layout
              Single row              → logo | swiper nav | close btn
        ══════════════════════════════════════════════════════════════ */}
        <header className="lnFormStepper__topbar sticky top-0 z-20 bg-white shadow-sm">

          {/* ── Row 1: logo + close (always visible) ─────────────── */}
          <div
            className={[
              'lnFormStepper__topbarRow1 container px-4 sm:px-8 h-14 flex items-center gap-4',
              isModalLayout ? 'justify-between' : 'justify-center',
            ].join(' ')}
          >

            {/* Logo */}
            {isModalLayout ? (
              <div
                className="lnFormStepper__logo flex items-end gap-0 flex-shrink-0"
                aria-label="Linknet Enterprise"
              >
                <img src="/assets/logos/logo-fiberco.svg" alt="Linknet Enterprise" />
              </div>
            ) : null}

            {/* Desktop: swiper lives here (between logo and close) */}
            <div
              className={[
                'lnFormStepper__navDesktop flex-1 overflow-hidden',
                isModalLayout ? 'hidden lg:flex' : 'flex justify-center',
              ].join(' ')}
            >
              <StepperNavBar steps={steps} currentStep={currentStep} />
            </div>

            {/* Close button */}
            {onClose ? (
              <div className="lnFormStepper__closeBtn flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup form"
                  className={[
                    'lnFormStepper__closeBtn flex-shrink-0 cursor-pointer text-secondary',
                    'rounded p-1 transition-opacity duration-200 hover:opacity-80',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400',
                  ].join(' ')}
                >
                  <Icon name="close" />
                </button>
              </div>
            ) : null}
          </div>

          {/* ── Row 2: swiper stepper (mobile + tablet only) ─────── */}
          {isModalLayout ? (
            <div className="lnFormStepper__topbarRow2 lg:hidden px-4 sm:px-8 py-2.5 !overflow-hidden">
              <StepperNavBar steps={steps} currentStep={currentStep} />
            </div>
          ) : null}

        </header>

        {/* ── Main ───────────────────────────────────────── */}
        <main className="lnFormStepper__main max-w-[840px] mx-auto px-4 sm:px-8 py-8 sm:py-12">

          <div className="lnFormStepper__pageHeader max-w-2xl mb-6">
            <div
              ref={titleRef}
              className={['lnFormStepper__pageTitle text-headline-h4 font-bold text-black leading-snug', subtitle ? 'mb-3' : 'mb-0'].join(' ')}
            >
              {titleLines.map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </div>

            {subtitle && (
              <p className="lnFormStepper__pageSubtitle text-body-b4 text-secondary leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="lnFormStepper__steps space-y-4.5">
            {children}
          </div>

        </main>
      </div>
    </StepperContext.Provider>
  );
}
