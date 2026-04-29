'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../Button';
import Input from '../forms/Input';
import RadioCard from '../forms/RadioCard';
import Modal from '../Modal';
import FormStepperModal from '../forms/FormStepperModal';
import { submitFormModule } from '@/lib/formsApi';

const ModalFormSubscribeInternetFiberContext = createContext({
  openModal: () => {},
  closeModal: () => {},
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9,}$/;

function normalizeProviderName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function extractProviderNames(source) {
  if (Array.isArray(source)) {
    return source.flatMap(extractProviderNames);
  }

  if (source && typeof source === 'object') {
    return [source.name, source.label, source.value, source.provider, source.providers]
      .flatMap(extractProviderNames);
  }

  if (typeof source !== 'string') {
    return [];
  }

  return source
    .split(',')
    .map(normalizeProviderName)
    .filter(Boolean);
}

function createProviderOptions(source) {
  return Array.from(new Set(extractProviderNames(source))).map((option) => ({
    label: option,
    value: option,
  }));
}

const STEP_ITEMS = [
  {
    id: 'provider',
    label: 'Available Provider',
    actionLabel: 'Continue',
    title: '',
    subtitle: 'Pilih provider internet fiber yang saat ini tersedia atau paling sesuai untuk Anda.',
  },
  {
    id: 'profile',
    label: 'Profile',
    actionLabel: 'Submit',
    title: '',
    subtitle: 'Lengkapi data diri agar tim kami dapat menghubungi Anda.',
  },
];

const FORM_ERROR_MESSAGES = {
  provider: 'Available Provider is required.',
  providerUnavailable: 'Provider data is unavailable for the selected address.',
  name: 'Nama is required.',
  phoneNumber: 'Phone Number is required.',
  phoneNumberFormat: 'Phone Number format is invalid.',
  email: 'Email is required.',
  emailFormat: 'Email format is invalid.',
};

const INITIAL_MODAL_PAYLOAD = {
  Promo_Website__c: 'Example',
  Page_Website__c: 'Example',
  SiteID: '',
  Source_Website__c: 'Example',
  providerOptions: [],
};

function createInitialForm(payload = INITIAL_MODAL_PAYLOAD) {
  const providerOptions = Array.isArray(payload.providerOptions) ? payload.providerOptions : [];
  const defaultProvider = providerOptions.length === 1 ? providerOptions[0].value : '';

  return {
    provider: defaultProvider,
    name: '',
    phoneNumber: '',
    email: '',
    address: payload.address || '',
    Promo_Website__c: payload.Promo_Website__c || INITIAL_MODAL_PAYLOAD.Promo_Website__c,
    Page_Website__c: payload.Page_Website__c || INITIAL_MODAL_PAYLOAD.Page_Website__c,
    SiteID: payload.SiteID || payload.site_id || INITIAL_MODAL_PAYLOAD.SiteID,
    Source_Website__c: payload.Source_Website__c || INITIAL_MODAL_PAYLOAD.Source_Website__c,
    Web_to_Lead__c: true,
    LeadSource: 'Website',
  };
}

function buildSubmissionPayload(form) {
  return {
    Available_Provider__c: form.provider,
    FirstName: form.name,
    MobilePhone: form.phoneNumber,
    Email: form.email,
    Address__c: form.address,
    Promo_Website__c: form.Promo_Website__c,
    Page_Website__c: form.Page_Website__c,
    SiteID: form.SiteID,
    Source_Website__c: form.Source_Website__c,
    Web_to_Lead__c: form.Web_to_Lead__c,
    LeadSource: form.LeadSource,
  };
}

function validateStep(stepId, form, providerOptions = []) {
  const errors = {};

  if (stepId === 'provider') {
    if (providerOptions.length === 0) {
      errors.provider = FORM_ERROR_MESSAGES.providerUnavailable;
      return errors;
    }

    if (!String(form.provider || '').trim()) {
      errors.provider = FORM_ERROR_MESSAGES.provider;
    }

    return errors;
  }

  if (!String(form.name || '').trim()) {
    errors.name = FORM_ERROR_MESSAGES.name;
  }

  if (!String(form.phoneNumber || '').trim()) {
    errors.phoneNumber = FORM_ERROR_MESSAGES.phoneNumber;
  } else if (!PHONE_REGEX.test(String(form.phoneNumber).replace(/\D+/g, ''))) {
    errors.phoneNumber = FORM_ERROR_MESSAGES.phoneNumberFormat;
  }

  if (!String(form.email || '').trim()) {
    errors.email = FORM_ERROR_MESSAGES.email;
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = FORM_ERROR_MESSAGES.emailFormat;
  }

  return errors;
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function StepHeader({ title, subtitle }) {
  return (
    <div className="space-y-2">
      <h3 className="text-headline-h5 font-bold text-black">{title}</h3>
      <p className="text-body-b5 text-secondary">{subtitle}</p>
    </div>
  );
}

function StepAvailableProvider({ options, value, onChange, submitAttempted }) {
  const showRequiredError = submitAttempted && options.length > 0 && !String(value || '').trim();

  return (
    <div className="space-y-6">
      <StepHeader
        title={STEP_ITEMS[0].title}
        subtitle={STEP_ITEMS[0].subtitle}
      />

      {options.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {options.map((option) => (
            <RadioCard
              key={option.value}
              name="available-provider"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              text={option.label}
              className="!h-[80px] !w-full"
            />
          ))}
        </div>
      ) : (
        <p className="text-body-b5 text-secondary">{FORM_ERROR_MESSAGES.providerUnavailable}</p>
      )}

      {showRequiredError ? (
        <p className="text-body-b5 text-red-500">{FORM_ERROR_MESSAGES.provider}</p>
      ) : null}
    </div>
  );
}

function StepProfile({ form, onChange, submitAttempted }) {
  return (
    <div className="space-y-6">
      <StepHeader
        title={STEP_ITEMS[1].title}
        subtitle={STEP_ITEMS[1].subtitle}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="subscribe-internet-fiber-name"
          name="FirstName"
          label="Nama"
          required
          className="md:col-span-2"
          value={form.name}
          onChange={onChange('name')}
          data-error={FORM_ERROR_MESSAGES.name}
          submitAttempted={submitAttempted}
        />
        <Input
          id="subscribe-internet-fiber-phone"
          name="MobilePhone"
          label="Phone Number"
          type="tel"
          inputMode="numeric"
          required
          value={form.phoneNumber}
          onChange={onChange('phoneNumber')}
          data-error={FORM_ERROR_MESSAGES.phoneNumber}
          data-error-phone={FORM_ERROR_MESSAGES.phoneNumberFormat}
          submitAttempted={submitAttempted}
        />
        <Input
          id="subscribe-internet-fiber-email"
          name="Email"
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={onChange('email')}
          data-error={FORM_ERROR_MESSAGES.email}
          data-error-email={FORM_ERROR_MESSAGES.emailFormat}
          submitAttempted={submitAttempted}
        />
      </div>
    </div>
  );
}

function HiddenFields({ form }) {
  const payload = buildSubmissionPayload(form);

  return (
    <div className="hidden" aria-hidden="true">
      <input type="hidden" name="Promo_Website__c" value={payload.Promo_Website__c} readOnly />
      <input type="hidden" name="Page_Website__c" value={payload.Page_Website__c} readOnly />
      <input type="hidden" name="SiteID" value={payload.SiteID} readOnly />
      <input type="hidden" name="Source_Website__c" value={payload.Source_Website__c} readOnly />
      <input type="hidden" name="Web_to_Lead__c" value={String(payload.Web_to_Lead__c)} readOnly />
      <input type="hidden" name="LeadSource" value={payload.LeadSource} readOnly />
      <input type="hidden" name="Available_Provider__c" value={payload.Available_Provider__c} readOnly />
      <input type="hidden" name="FirstName" value={payload.FirstName} readOnly />
      <input type="hidden" name="MobilePhone" value={payload.MobilePhone} readOnly />
      <input type="hidden" name="Email" value={payload.Email} readOnly />
      <input type="hidden" name="Address__c" value={payload.Address__c} readOnly />
    </div>
  );
}

function ModalFormSubscribeInternetFiber({ initialPayload, isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(() => createInitialForm(initialPayload));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const contentWrapperRef = useRef(null);
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'id';
  const activeStep = STEP_ITEMS[currentStep - 1];
  const providerOptions = useMemo(
    () => (Array.isArray(initialPayload.providerOptions) ? initialPayload.providerOptions : []),
    [initialPayload.providerOptions],
  );

  useEffect(() => {
    const wrapperElement = contentWrapperRef.current;

    if (!wrapperElement) {
      return;
    }

    const scrollContainer = wrapperElement.closest('.custom-scrollbar');

    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const steps = useMemo(
    () =>
      STEP_ITEMS.map((step, index) => ({
        step: index + 1,
        label: step.label,
      })),
    [],
  );

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setForm(createInitialForm(initialPayload));
    setSubmitAttempted(false);
  }, [initialPayload]);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleFieldChange = useCallback(
    (field) => (event) => {
      const nextValue = event?.target?.value ?? '';

      setForm((prev) => ({
        ...prev,
        [field]: nextValue,
      }));
    },
    [],
  );

  const handleProviderChange = useCallback((provider) => {
    setForm((prev) => ({
      ...prev,
      provider,
    }));
  }, []);

  const handleSubmitSuccess = useCallback(() => {
    const locale = params?.locale || 'id';
    const firstName = encodeURIComponent(form.name.trim() || 'there');

    handleReset();
    onClose();
    router.push(`/${locale}/enterprise/form/success?name=${firstName}&needs=Subscribe%20Internet%20Fiber`);
  }, [form.name, handleReset, onClose, params?.locale, router]);

  const handleContinue = useCallback(async () => {
    const errors = validateStep(activeStep?.id, form, providerOptions);

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      return;
    }

    setSubmitAttempted(false);

    if (currentStep < STEP_ITEMS.length) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitFormModule('fiber', 'fiber-inquiry', {
        locale,
        sourcePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
        values: buildSubmissionPayload(form),
        groups: [],
        files: [],
      });

      if (!result?.persisted) {
        throw new Error('Form submission was not persisted.');
      }

      handleSubmitSuccess();
    } catch (err) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeStep?.id, currentStep, form, handleSubmitSuccess, locale, providerOptions]);

  const handlePrevious = useCallback(() => {
    setSubmitAttempted(false);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  const bodyContent = useMemo(() => {
    if (activeStep?.id === 'provider') {
      return (
        <StepAvailableProvider
          options={providerOptions}
          value={form.provider}
          onChange={handleProviderChange}
          submitAttempted={submitAttempted}
        />
      );
    }

    return (
      <StepProfile
        form={form}
        onChange={handleFieldChange}
        submitAttempted={submitAttempted}
      />
    );
  }, [activeStep?.id, form, handleFieldChange, handleProviderChange, providerOptions, submitAttempted]);

  const headerContent = (
    <div className="mt-10 space-y-4">
      <div className="space-y-2">
        <h2 className="text-headline-h4 font-bold leading-tight text-black">
          Let's Subscribe Internet Fiber From Linknet Partners
        </h2>
      </div>
      <FormStepperModal
        className="!items-start lnModalFormSwiperLeft"
        align="start"
        steps={steps}
        currentStep={currentStep}
      />
    </div>
  );

  const footerContent = (
    <div className="flex w-full items-center justify-between gap-3">
      {currentStep === 1 ? (
        <div />
      ) : (
        <Button type="button" variant="secondary" outline onClick={handlePrevious}>
          Previously
        </Button>
      )}

      <Button
        type="button"
        variant="warning"
        onClick={handleContinue}
        disabled={isSubmitting}
      >
        {activeStep?.actionLabel}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={headerContent}
      footer={footerContent}
      mobilePosition="center"
      desktopPosition="center"
      maxWidth="max-w-[820px]"
    >
      <div ref={contentWrapperRef} className="pb-2 pt-1">
        <HiddenFields form={form} />
        {bodyContent}
        {submitError ? (
          <p className="mt-4 text-body-b5 text-red-500">{submitError}</p>
        ) : null}
      </div>
    </Modal>
  );
}

export function useModalFormSubscribeInternetFiber() {
  return useContext(ModalFormSubscribeInternetFiberContext);
}

export default function ModalFormSubscribeInternetFiberProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [modalPayload, setModalPayload] = useState(INITIAL_MODAL_PAYLOAD);
  const hasMounted = useHasMounted();

  const openModal = useCallback((payload = {}) => {
    // Prefer response.data[0].providers (Axios-like responses) as primary source.
    const raw = payload.raw;
    const dataFirstProviders = raw && raw.data && Array.isArray(raw.data) ? raw.data[0]?.providers : undefined;

    let providerSource = (Array.isArray(payload.providerOptions) && payload.providerOptions.length > 0)
      ? payload.providerOptions
      : (dataFirstProviders
          ?? payload.providers
          ?? payload.raw?.providers
          ?? (Array.isArray(raw) ? raw[0]?.providers : undefined)
          ?? INITIAL_MODAL_PAYLOAD.providerOptions);

    // If providers came as a JSON stringified array/object, try to parse it.
    if (typeof providerSource === 'string') {
      const t = providerSource.trim();
      if ((t.startsWith('[') || t.startsWith('{'))) {
        try {
          const parsed = JSON.parse(t);
          providerSource = parsed;
        } catch (err) {
          // ignore parse error and keep original string
        }
      }
    }

    // Build provider options robustly; if extraction fails, coerce a fallback from the raw value.
    let builtOptions = createProviderOptions(providerSource);

    if ((!Array.isArray(builtOptions) || builtOptions.length === 0) && providerSource) {
      // Attempt simple coercion: split strings by comma, flatten arrays, or stringify objects.
      let fallbackList = [];

      if (typeof providerSource === 'string') {
        let s = providerSource.trim();
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
          s = s.slice(1, -1).trim();
        }
        fallbackList = s.split(',').map((p) => p.trim()).filter(Boolean);
      } else if (Array.isArray(providerSource)) {
        fallbackList = providerSource.flatMap((p) => (typeof p === 'string' ? p.split(',') : [p]))
          .map((p) => String(p).trim())
          .filter(Boolean);
      } else {
        // Object or other shape — try to stringify and split if it contains commas
        try {
          const s = JSON.stringify(providerSource);
          fallbackList = s.replace(/[\[\]"]+/g, '').split(',').map((p) => p.trim()).filter(Boolean);
        } catch (err) {
          fallbackList = [String(providerSource).trim()].filter(Boolean);
        }
      }

      if (fallbackList.length > 0) {
        builtOptions = Array.from(new Set(fallbackList)).map((option) => ({ label: option, value: option }));
      }
    }

    if (!Array.isArray(builtOptions) || builtOptions.length === 0) {
      builtOptions = [{ label: 'LMI', value: 'LMI' }];
    }

    setModalPayload({
      Promo_Website__c: payload.Promo_Website__c || INITIAL_MODAL_PAYLOAD.Promo_Website__c,
      Page_Website__c: payload.Page_Website__c || INITIAL_MODAL_PAYLOAD.Page_Website__c,
      SiteID: payload.SiteID || payload.site_id || INITIAL_MODAL_PAYLOAD.SiteID,
      Source_Website__c: payload.Source_Website__c || INITIAL_MODAL_PAYLOAD.Source_Website__c,
      address: payload.address || '',
      providerOptions: builtOptions,
    });
    setSessionKey((prev) => prev + 1);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalPayload(INITIAL_MODAL_PAYLOAD);
  }, []);

  return (
    <ModalFormSubscribeInternetFiberContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasMounted ? (
        <ModalFormSubscribeInternetFiber
          key={sessionKey}
          initialPayload={modalPayload}
          isOpen={isOpen}
          onClose={closeModal}
        />
      ) : null}
    </ModalFormSubscribeInternetFiberContext.Provider>
  );
}