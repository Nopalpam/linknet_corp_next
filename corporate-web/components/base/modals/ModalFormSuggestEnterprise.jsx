'use client';

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import Button from '../Button';
import Icon from '../Icon';
import RadioCard from '../forms/RadioCard';
import CheckboxCard from '../forms/CheckboxCard';
import FormStepperModal, { getModalStepStatus } from '../forms/FormStepperModal';
import Intro from '../section/Intro';
import {
  ALL_INDUSTRY_VALUE,
  ALL_NEEDS_VALUE,
  ALL_SCALE_VALUE,
  BUSINESS_NEED_OPTIONS,
  BUSINESS_SCALE_OPTIONS,
  INDUSTRY_OPTIONS,
} from '@/data/constants/suggestEnterprise';
import { submitEnterpriseForm } from '@/lib/formsApi';

const ModalFormSuggestEnterpriseContext = createContext({
  openModal: () => {},
  closeModal: () => {},
});

const MODAL_ANIMATION = {
  duration: 0.45,
  enterEase: 'power3.out',
  exitEase: 'power3.in',
};

const STEP_ITEMS = [
  { step: 1, label: 'Industry' },
  { step: 2, label: 'Business Scale' },
  { step: 3, label: 'Needs' },
];

function resolveSubmissionContext(initialPayload = {}) {
  const url =
    initialPayload.context?.url ||
    (typeof window !== 'undefined' ? window.location.href : undefined) ||
    initialPayload.Page_Website__c;

  return {
    product: initialPayload.context?.product || initialPayload.Product,
    promo: initialPayload.context?.promo || initialPayload.Promo_Website__c,
    source: initialPayload.context?.source || initialPayload.Source_Website__c,
    url,
  };
}

function useModalAnimation(onAfterClose) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  const animateIn = useCallback(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;

    if (!overlay || !panel) return;

    gsap.set(panel, { y: '100%' });
    gsap.set(overlay, { autoAlpha: 0 });

    gsap.to(overlay, {
      autoAlpha: 1,
      duration: MODAL_ANIMATION.duration,
      ease: MODAL_ANIMATION.enterEase,
    });

    gsap.to(panel, {
      y: '0%',
      duration: MODAL_ANIMATION.duration,
      ease: MODAL_ANIMATION.enterEase,
    });
  }, []);

  const animateOut = useCallback(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;

    if (!overlay || !panel) return;

    gsap.to(panel, {
      y: '100%',
      duration: MODAL_ANIMATION.duration,
      ease: MODAL_ANIMATION.exitEase,
    });

    gsap.to(overlay, {
      autoAlpha: 0,
      duration: MODAL_ANIMATION.duration,
      ease: MODAL_ANIMATION.exitEase,
      onComplete: onAfterClose,
    });
  }, [onAfterClose]);

  useEffect(() => {
    const frameId = requestAnimationFrame(animateIn);
    return () => cancelAnimationFrame(frameId);
  }, [animateIn]);

  return {
    overlayRef,
    panelRef,
    animateOut,
  };
}

function useEscapeKey(handler) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handler]);
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function SuggestEnterpriseContent({ onClose, initialPayload = {} }) {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'id';

  const [currentStep, setCurrentStep] = useState(1);
  const [industrySearch, setIndustrySearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(ALL_INDUSTRY_VALUE);
  const [selectedScale, setSelectedScale] = useState(ALL_SCALE_VALUE);
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deferredIndustrySearch = useDeferredValue(industrySearch);

  const filteredIndustryOptions = useMemo(() => {
    const query = deferredIndustrySearch.trim().toLowerCase();
    if (!query) return INDUSTRY_OPTIONS;

    return INDUSTRY_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [deferredIndustrySearch]);

  const steps = useMemo(
    () =>
      STEP_ITEMS.map((item) => ({
        ...item,
        status: getModalStepStatus(item.step, currentStep),
      })),
    [currentStep]
  );

  const handleIndustrySelect = useCallback((value) => {
    setSelectedIndustry(value);
  }, []);

  const handleScaleSelect = useCallback((value) => {
    setSelectedScale(value);
  }, []);

  const handleNeedToggle = useCallback((value) => {
    if (value === ALL_NEEDS_VALUE) {
      setSelectedNeeds([]);
      return;
    }

    setSelectedNeeds((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }

      return [...prev, value];
    });
  }, []);

  const goToStep = useCallback((step) => {
    startTransition(() => {
      setCurrentStep(step);
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep >= STEP_ITEMS.length) return;
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep <= 1) return;
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const handleSubmit = useCallback(async () => {
    const query = new URLSearchParams();

    if (selectedIndustry && selectedIndustry !== ALL_INDUSTRY_VALUE) {
      query.set('industry', selectedIndustry);
    }

    if (selectedScale && selectedScale !== ALL_SCALE_VALUE) {
      query.set('scale', selectedScale);
    }

    selectedNeeds.forEach((need) => {
      query.append('needs', need);
    });

    setIsSubmitting(true);

    try {
      await submitEnterpriseForm('suggest_enterprise', {
        locale,
        fields: {
          selectedIndustry,
          selectedScale,
          selectedNeeds,
        },
        context: resolveSubmissionContext(initialPayload),
        groups: [],
        files: [],
      });
    } catch (error) {
      console.error('[ModalFormSuggestEnterprise] Failed to store solution finder submission:', error);
    } finally {
      setIsSubmitting(false);
    }

    const queryString = query.toString();
    router.push(`/${locale}/solutions${queryString ? `?${queryString}` : ''}`);
    onClose();
  }, [initialPayload, locale, onClose, router, selectedIndustry, selectedNeeds, selectedScale]);

  const renderIndustryStep = () => (
    <div className="flex flex-col gap-8">
      <Intro
        align="center"
        title="What is your line of business?"
        description="Choose your category to see recommendations optimized for your growth."
        className="!w-full !gap-0"
        titleClassName="!mt-0 w-full"
        descriptionClassName="!mt-4"
      />

      <div className="mx-auto w-full max-w-[520px]">
        <label className="flex h-[60px] w-full items-center gap-4 rounded-[16px] border border-neutral bg-white px-5">
          <input
            type="text"
            value={industrySearch}
            onChange={(event) => setIndustrySearch(event.target.value)}
            placeholder="Search Industry"
            className="w-full border-none bg-transparent text-body-b5 font-regular text-black placeholder:text-secondary focus:outline-none"
          />
          <span className="shrink-0 text-black">
            <Icon name="search" className='text-secondary' style={{ '--icon-size': '24px' }} />
          </span>
        </label>
      </div>

      {filteredIndustryOptions.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {filteredIndustryOptions.map((option) => (
            <RadioCard
              key={option.value}
              name="enterprise-industry"
              value={option.value}
              checked={selectedIndustry === option.value}
              onChange={() => handleIndustrySelect(option.value)}
              image={option.image}
              text={option.label}
              className="!w-full"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-neutral bg-white px-6 py-12 text-center">
          <p className="text-body-b4 font-medium text-black">No industry found</p>
          <p className="mt-2 text-body-b5 text-secondary">
            Try another keyword to browse the recommendations.
          </p>
        </div>
      )}
    </div>
  );

  const renderScaleStep = () => (
    <div className="flex flex-col gap-8">
      <Intro
        align="center"
        title="Select Your Business Scale"
        description="Choose the option that describes your business size so we can optimize your plan."
        className="w-full !gap-0"
        titleClassName="!mt-0"
        descriptionClassName="!mt-4 max-w-[760px]"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {BUSINESS_SCALE_OPTIONS.map((option) => (
          <RadioCard
            key={option.value}
            name="enterprise-business-scale"
            value={option.value}
            checked={selectedScale === option.value}
            onChange={() => handleScaleSelect(option.value)}
            image={option.image}
            text={option.label}
            className="!w-full"
          />
        ))}
      </div>
    </div>
  );

  const renderNeedsStep = () => (
    <div className="flex flex-col gap-8">
      <Intro
        align="center"
        title="What are your business needs?"
        description="You can select more than 1 needs"
        className="!w-full !gap-0"
        titleClassName="!mt-0"
        descriptionClassName="!mt-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <CheckboxCard
          value={ALL_NEEDS_VALUE}
          checked={selectedNeeds.length === 0}
          onChange={() => handleNeedToggle(ALL_NEEDS_VALUE)}
          text="All Needs"
          className="!h-auto md:!h-[92px] !w-full !items-center"
        />

        {BUSINESS_NEED_OPTIONS.map((option) => (
          <CheckboxCard
            key={option.value}
            value={option.value}
            checked={selectedNeeds.includes(option.value)}
            onChange={() => handleNeedToggle(option.value)}
            text={option.label}
            className="!h-auto md:!h-[92px] !w-full !items-center"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-full w-full flex-col bg-white rounded-[20px] overflow-hidden">
      <header className="lnModalSuggestEnterprise__header sticky top-0 z-20 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/icons/lamp-colors.svg"
              alt="Solution Finder"
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close solution finder modal"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-black transition-colors duration-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <Icon name="close" style={{ '--icon-size': '24px' }} />
          </button>
        </div>

        <div className="px-4 pb-2.5 md:hidden">
          <div className="flex min-w-0 items-center justify-center [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <FormStepperModal
              steps={steps}
              currentStep={currentStep}
              className="min-w-max"
            />
          </div>
        </div>

        <div className="hidden h-14 items-center gap-4 px-4 sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 items-center gap-2 justify-self-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/icons/lamp-colors.svg"
              alt="Solution Finder"
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
          </div>

          <div className="flex min-w-0 items-center justify-center overflow-hidden justify-self-center">
            <FormStepperModal
              steps={steps}
              currentStep={currentStep}
              className="min-w-max"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close solution finder modal"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center justify-self-end rounded-full text-black transition-colors duration-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <Icon name="close" style={{ '--icon-size': '24px' }} />
          </button>
        </div>
      </header>

      <div className="lnModalSuggestEnterprise__body flex-1 overflow-y-auto px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex w-full max-w-[1460px] flex-col">
          {currentStep === 1 && renderIndustryStep()}
          {currentStep === 2 && renderScaleStep()}
          {currentStep === 3 && renderNeedsStep()}
        </div>
      </div>

      <footer className="lnModalSuggestEnterprise__footer sticky bottom-0 z-20 border-t border-neutral bg-white px-4 py-2 pb-4 md:px-8 md:py-2 md:pb-4">
        <div className="mx-auto flex items-center justify-between gap-4">
          <div>
            {currentStep > 1 ? (
              <Button
                variant="secondary"
                outline
                size="lg"
                onClick={handlePrevious}
                className="!rounded-full !px-8"
              >
                <Icon name="chevron-left" style={{ '--icon-size': '24px' }} />
              </Button>
            ) : null}
          </div>

          <Button
            variant="warning"
            size="lg"
            onClick={currentStep === STEP_ITEMS.length ? handleSubmit : handleNext}
            disabled={isSubmitting}
            className="!rounded-full !px-8 md:!px-12"
          >
            {currentStep === STEP_ITEMS.length ? (isSubmitting ? 'Saving...' : 'Find Solutions') : 'Next'}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function ModalFormSuggestEnterprise({ onAfterClose, initialPayload }) {
  const { overlayRef, panelRef, animateOut } = useModalAnimation(onAfterClose);

  useEscapeKey(animateOut);

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Solution Finder"
      className="fixed inset-0 z-[var(--z-modal)] bg-black/40"
      suppressHydrationWarning
    >
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={animateOut}
      />

      <div
        ref={panelRef}
        className="lnModalForm__panel absolute left-1/2 top-1/2 flex w-[850px] max-w-[calc(100vw-24px)] max-h-[90vh] md:max-h-[650px] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-transparent will-change-transform"
        suppressHydrationWarning
      >
        <SuggestEnterpriseContent onClose={animateOut} initialPayload={initialPayload} />
      </div>
    </div>,
    document.body
  );
}

export function useModalFormSuggestEnterprise() {
  return useContext(ModalFormSuggestEnterpriseContext);
}

export default function ModalFormSuggestEnterpriseProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState({});
  const hasMounted = useHasMounted();

  const openModal = useCallback((payload = {}) => {
    setModalPayload(payload);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalPayload({});
  }, []);

  return (
    <ModalFormSuggestEnterpriseContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasMounted && isOpen ? (
        <ModalFormSuggestEnterprise onAfterClose={closeModal} initialPayload={modalPayload} />
      ) : null}
    </ModalFormSuggestEnterpriseContext.Provider>
  );
}
