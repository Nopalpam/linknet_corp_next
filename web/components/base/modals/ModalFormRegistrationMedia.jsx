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
} from "react";
import { useParams, useRouter } from "next/navigation";
import gsap from "gsap";
import FormStepper, { FormStep } from "../forms/FormStepper";
import Input from "../forms/Input";
import Select from "../forms/Select";
import SelectMultiple from "../forms/SelectMultiple";
import Textarea from "../forms/Textarea";
import FieldReadOnly from "../forms/FieldReadOnly";
import Button from "../Button";
import { useFormSubmission } from '@/components/hooks/useFormSubmission';
import useIndonesiaLocationOptions from '@/components/hooks/useIndonesiaLocationOptions';

const ModalFormRegistrationMediaContext = createContext({
  openModal: () => {},
  closeModal: () => {},
});

const MODAL_ANIMATION = {
  duration: 0.45,
  enterEase: "power3.out",
  exitEase: "power3.in",
};

const TOTAL_STEPS = 4;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9,}$/;

const ROLE_OPTIONS = [
  "Owner",
  "Director",
  "Marketing Manager",
  "Brand Manager",
  "Partnership Lead",
  "Media Planner",
].map((option) => ({
  label: option,
  value: option,
}));

const SOLUTIONS_INTEREST_OPTIONS = [
  "OTT Solutions",
  "IPTV Services",
  "Hospitality Entertainment",
  "Media Advertising",
].map((option) => ({
  label: option,
  value: option,
}));

const PLATFORM_TYPE_OPTIONS = [
  "Content Only",
  "APK",
  "Library",
].map((option) => ({
  label: option,
  value: option,
}));

const STEP_META = [
  {
    step: 1,
    step_name: "Personal",
    step_title: "Personal Details",
    step_description: "Lengkapi data PIC untuk kebutuhan registrasi awal layanan media.",
    actionLabel: "Next",
  },
  {
    step: 2,
    step_name: "Company",
    step_title: "Company Details",
    step_description: "Masukkan data perusahaan dan alamat operasional secara lengkap.",
    actionLabel: "Next",
  },
  {
    step: 3,
    step_name: "Services",
    step_title: "Services & Message",
    step_description: "Pilih layanan yang diminati dan tinggalkan kebutuhan spesifik Anda.",
    actionLabel: "Review",
  },
  {
    step: 4,
    step_name: "Review",
    step_title: "",
    step_description: "",
    actionLabel: "Confirm & Submit",
  },
];

const FORM_ERROR_MESSAGES = {
  fullName: "Full Name is required.",
  companyEmail: "Company Email is required.",
  companyEmailFormat: "Company Email format is invalid.",
  phoneNumber: "Phone Number is required.",
  phoneNumberFormat: "Phone Number format is invalid.",
  yourRole: "Your Role / Title is required.",
  companyName: "Company Name is required.",
  brandName: "Brand Name is required.",
  province: "Province is required.",
  city: "City is required.",
  zipCode: "Ward / ZIP Code is required.",
  detailAddress: "Detail Address is required.",
  solutionsInterest: "Please select at least one solution.",
  platformType: "Platform Type is required.",
  message: "Message is required.",
};

const INITIAL_FORM = {
  fullName: "",
  companyEmail: "",
  phoneNumber: "",
  yourRole: "",
  companyName: "",
  brandName: "",
  province: "",
  city: "",
  zipCode: "",
  detailAddress: "",
  solutionsInterest: [],
  platformType: "",
  message: "",
};

function createInitialForm() {
  return {
    ...INITIAL_FORM,
  };
}

function StepSummary({
  items,
  className = "grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2",
}) {
  return (
    <div className={className}>
      {items.map(({ label, value, required = true, className: itemClassName }) => (
        <FieldReadOnly
          key={label}
          label={label}
          value={value}
          required={required}
          className={itemClassName || ""}
        />
      ))}
    </div>
  );
}

function buildSolutionsLabel(values) {
  return values.length > 0 ? values.join(", ") : "";
}

function buildCompanyAddress(form) {
  return [
    form.detailAddress,
    form.zipCode,
    form.city,
    form.province,
  ]
    .filter(Boolean)
    .join(", ");
}

function getStepSummaryItems(step, form) {
  switch (step) {
    case 1:
      return [
        { label: "Full Name", value: form.fullName },
        { label: "Company Email", value: form.companyEmail },
        { label: "Phone Number", value: form.phoneNumber },
        { label: "Your Role / Title", value: form.yourRole },
      ];
    case 2:
      return [
        { label: "Company Name", value: form.companyName },
        { label: "Brand Name", value: form.brandName },
        { label: "Province", value: form.province },
        { label: "City", value: form.city },
        { label: "Ward / ZIP Code", value: form.zipCode },
        {
          label: "Detail Address",
          value: buildCompanyAddress(form),
          className: "md:col-span-2",
        },
      ];
    case 3:
      return [
        {
          label: "Solutions Interest",
          value: buildSolutionsLabel(form.solutionsInterest),
          className: "md:col-span-2",
        },
        {
          label: "Platform Type",
          value: form.platformType,
          className: "md:col-span-2",
        },
        {
          label: "Message",
          value: form.message,
          className: "md:col-span-2",
        },
      ];
    default:
      return [];
  }
}

function validateStep1(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = FORM_ERROR_MESSAGES.fullName;
  }

  if (!form.companyEmail.trim()) {
    errors.companyEmail = FORM_ERROR_MESSAGES.companyEmail;
  } else if (!EMAIL_REGEX.test(form.companyEmail)) {
    errors.companyEmail = FORM_ERROR_MESSAGES.companyEmailFormat;
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = FORM_ERROR_MESSAGES.phoneNumber;
  } else if (!PHONE_REGEX.test(String(form.phoneNumber).replace(/\D+/g, ""))) {
    errors.phoneNumber = FORM_ERROR_MESSAGES.phoneNumberFormat;
  }

  if (!form.yourRole.trim()) {
    errors.yourRole = FORM_ERROR_MESSAGES.yourRole;
  }

  return errors;
}

function validateStep2(form) {
  return [
    ["companyName", FORM_ERROR_MESSAGES.companyName],
    ["brandName", FORM_ERROR_MESSAGES.brandName],
    ["province", FORM_ERROR_MESSAGES.province],
    ["city", FORM_ERROR_MESSAGES.city],
    ["zipCode", FORM_ERROR_MESSAGES.zipCode],
    ["detailAddress", FORM_ERROR_MESSAGES.detailAddress],
  ].reduce((result, [field, message]) => {
    if (!String(form[field] || "").trim()) {
      result[field] = message;
    }

    return result;
  }, {});
}

function validateStep3(form) {
  const errors = {};

  if (!Array.isArray(form.solutionsInterest) || form.solutionsInterest.length === 0) {
    errors.solutionsInterest = FORM_ERROR_MESSAGES.solutionsInterest;
  }

  if (!form.platformType.trim()) {
    errors.platformType = FORM_ERROR_MESSAGES.platformType;
  }

  if (!form.message.trim()) {
    errors.message = FORM_ERROR_MESSAGES.message;
  }

  return errors;
}

function validateStep(step, form) {
  switch (step) {
    case 1:
      return validateStep1(form);
    case 2:
      return validateStep2(form);
    case 3:
      return validateStep3(form);
    case 4:
      return {
        ...validateStep1(form),
        ...validateStep2(form),
        ...validateStep3(form),
      };
    default:
      return {};
  }
}

function getStepStatus(stepNumber, currentStep) {
  if (stepNumber < currentStep) return "finish";
  if (stepNumber === currentStep) return "active";
  return "disabled";
}

function useBodyScrollLock() {
  useEffect(() => {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);
}

function useModalAnimation(onAfterClose) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  const animateIn = useCallback(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;

    if (!overlay || !panel) return;

    gsap.set(panel, { y: "100%" });
    gsap.set(overlay, { autoAlpha: 0 });

    gsap.to(overlay, {
      autoAlpha: 1,
      duration: MODAL_ANIMATION.duration,
      ease: MODAL_ANIMATION.enterEase,
    });
    gsap.to(panel, {
      y: "0%",
      duration: MODAL_ANIMATION.duration,
      ease: MODAL_ANIMATION.enterEase,
    });
  }, []);

  const animateOut = useCallback(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;

    if (!overlay || !panel) return;

    gsap.to(panel, {
      y: "100%",
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
      if (event.key === "Escape") {
        handler();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handler]);
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function useRegistrationMediaFormState(onSubmitAsync) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(createInitialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [navDirection, setNavDirection] = useState("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const onSubmitAsyncRef = useRef(onSubmitAsync);
  useEffect(() => { onSubmitAsyncRef.current = onSubmitAsync; }, [onSubmitAsync]);

  const clearError = useCallback((field) => {
    setStepErrors((prev) => {
      if (!(field in prev)) return prev;

      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const updateForm = useCallback((patch) => {
    setForm((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  const handleFieldChange = useCallback(
    (field) => (event) => {
      const nextValue = event.target.value;

      if (field === "province") {
        updateForm({ province: nextValue, city: "", zipCode: "" });
        clearError("province");
        clearError("city");
        clearError("zipCode");
        return;
      }

      if (field === "city") {
        updateForm({ city: nextValue, zipCode: "" });
        clearError("city");
        clearError("zipCode");
        return;
      }

      updateForm({ [field]: nextValue });
      clearError(field);
    },
    [clearError, updateForm]
  );

  const handleMultiSelectChange = useCallback(
    (field) => (event) => {
      updateForm({ [field]: event.target.value });
      clearError(field);
    },
    [clearError, updateForm]
  );

  const handleConfirm = useCallback(async () => {
    const errors = validateStep(currentStep, form);

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      setStepErrors(errors);
      return;
    }

    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection("forward");

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (onSubmitAsyncRef.current) {
        await onSubmitAsyncRef.current(form);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, form]);

  const handleChangeStep = useCallback((step) => {
    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection(step < currentStep ? "backward" : "forward");
    setCurrentStep(step);
  }, [currentStep]);

  return {
    currentStep,
    form,
    submitted,
    submitAttempted,
    stepErrors,
    navDirection,
    isSubmitting,
    submitError,
    handleFieldChange,
    handleMultiSelectChange,
    handleConfirm,
    handleChangeStep,
  };
}

export function useModalFormRegistrationMedia() {
  return useContext(ModalFormRegistrationMediaContext);
}

function Step1Body({ form, onChange, submitAttempted }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        id="media-full-name"
        label="Full Name"
        required
        value={form.fullName}
        onChange={onChange("fullName")}
        data-error={FORM_ERROR_MESSAGES.fullName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="media-company-email"
        label="Company Email"
        type="email"
        required
        value={form.companyEmail}
        onChange={onChange("companyEmail")}
        data-error={FORM_ERROR_MESSAGES.companyEmail}
        data-error-email={FORM_ERROR_MESSAGES.companyEmailFormat}
        submitAttempted={submitAttempted}
      />
      <Input
        id="media-phone-number"
        label="Phone Number"
        type="tel"
        required
        value={form.phoneNumber}
        onChange={onChange("phoneNumber")}
        data-error={FORM_ERROR_MESSAGES.phoneNumber}
        data-error-phone={FORM_ERROR_MESSAGES.phoneNumberFormat}
        submitAttempted={submitAttempted}
      />
      <Select
        id="media-role-title"
        label="Your Role / Title"
        required
        placeholder="Select role / title"
        options={ROLE_OPTIONS}
        value={form.yourRole}
        onChange={onChange("yourRole")}
        data-error={FORM_ERROR_MESSAGES.yourRole}
        submitAttempted={submitAttempted}
      />
    </div>
  );
}

function Step2Body({ form, onChange, submitAttempted }) {
  const {
    cityOptions,
    finalOptions: zipOptions,
    normalizedCity,
    normalizedProvince,
    provinceOptions,
  } = useIndonesiaLocationOptions({
    city: form.city,
    finalLevel: 'zip',
    province: form.province,
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        id="media-company-name"
        label="Company Name"
        required
        value={form.companyName}
        onChange={onChange("companyName")}
        data-error={FORM_ERROR_MESSAGES.companyName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="media-brand-name"
        label="Brand Name"
        required
        value={form.brandName}
        onChange={onChange("brandName")}
        data-error={FORM_ERROR_MESSAGES.brandName}
        submitAttempted={submitAttempted}
      />
      <Select
        id="media-province"
        label="Province"
        required
        placeholder="Select province"
        options={provinceOptions}
        value={normalizedProvince}
        onChange={onChange("province")}
        data-error={FORM_ERROR_MESSAGES.province}
        submitAttempted={submitAttempted}
      />
      <Select
        id="media-city"
        label="City"
        required
        placeholder="Select city"
        options={cityOptions}
        value={normalizedCity}
        onChange={onChange("city")}
        data-error={FORM_ERROR_MESSAGES.city}
        submitAttempted={submitAttempted}
        disabled={!normalizedProvince}
      />
      <Select
        id="media-zip-code"
        label="Ward/ZIP Code"
        required
        placeholder="Select ward / ZIP code"
        options={zipOptions}
        value={form.zipCode}
        onChange={onChange("zipCode")}
        data-error={FORM_ERROR_MESSAGES.zipCode}
        submitAttempted={submitAttempted}
        disabled={!normalizedCity}
      />
      <div className="hidden md:block" />
      <Textarea
        id="media-detail-address"
        label="Detail Address"
        required
        rows={4}
        className="md:col-span-2"
        value={form.detailAddress}
        onChange={onChange("detailAddress")}
        data-error={FORM_ERROR_MESSAGES.detailAddress}
        submitAttempted={submitAttempted}
      />
    </div>
  );
}

function Step3Body({ form, onChange, onMultiChange, submitAttempted }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <SelectMultiple
        id="media-solutions-interest"
        label="Solutions Interest"
        required
        className="md:col-span-2"
        placeholder="Select one or more solutions"
        options={SOLUTIONS_INTEREST_OPTIONS}
        value={form.solutionsInterest}
        onChange={onMultiChange("solutionsInterest")}
        data-error={FORM_ERROR_MESSAGES.solutionsInterest}
        submitAttempted={submitAttempted}
      />
      <Select
        id="media-platform-type"
        label="Platform Type"
        required
        className="md:col-span-2"
        placeholder="Select platform type"
        options={PLATFORM_TYPE_OPTIONS}
        value={form.platformType}
        onChange={onChange("platformType")}
        data-error={FORM_ERROR_MESSAGES.platformType}
        submitAttempted={submitAttempted}
      />
      <Textarea
        id="media-message"
        label="Message"
        required
        rows={5}
        className="md:col-span-2"
        value={form.message}
        onChange={onChange("message")}
        data-error={FORM_ERROR_MESSAGES.message}
        submitAttempted={submitAttempted}
      />
    </div>
  );
}

function Step4Body() {
  return (
    <div className="space-y-4">
      <div className="mb-1 text-center text-body-b5 leading-relaxed text-black">
        By submitting this form, you agree to our&nbsp;<a href="/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a>&nbsp;and&nbsp;
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.
      </div>
    </div>
  );
}

function RegistrationMediaFormContent({ onClose }) {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'id';

  const { submit } = useFormSubmission('media', 'media-registration');

  const handleActualSubmit = useCallback(
    async (form) => submit({
      locale,
      sourcePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
      values: form,
      groups: [],
      files: [],
    }),
    [locale, submit],
  );

  const {
    currentStep,
    form,
    submitted,
    submitAttempted,
    navDirection,
    handleFieldChange,
    handleMultiSelectChange,
    handleConfirm,
    handleChangeStep,
  } = useRegistrationMediaFormState(handleActualSubmit);

  const handleSubmitSuccess = useCallback(() => {
    const locale = params?.locale || "id";
    const firstName = encodeURIComponent(form.fullName.trim());

    onClose();
    router.push(`/${locale}/enterprise/form/success?name=${firstName}`);
  }, [form.fullName, onClose, params?.locale, router]);

  useEffect(() => {
    if (!submitted) return;

    handleSubmitSuccess();
  }, [handleSubmitSuccess, submitted]);

  const renderStepBody = useCallback((stepStatus, step) => {
    if (stepStatus !== "active") {
      return <StepSummary items={getStepSummaryItems(step, form)} />;
    }

    switch (step) {
      case 1:
        return (
          <Step1Body
            form={form}
            onChange={handleFieldChange}
            submitAttempted={submitAttempted}
          />
        );
      case 2:
        return (
          <Step2Body
            form={form}
            onChange={handleFieldChange}
            submitAttempted={submitAttempted}
          />
        );
      case 3:
        return (
          <Step3Body
            form={form}
            onChange={handleFieldChange}
            onMultiChange={handleMultiSelectChange}
            submitAttempted={submitAttempted}
          />
        );
      case 4:
        return <Step4Body />;
      default:
        return null;
    }
  }, [form, handleFieldChange, handleMultiSelectChange, submitAttempted]);

  const footerSlot = useMemo(() => (
    <div className={`flex w-full ${currentStep === 4 ? '' : 'justify-end'}`}>
      <Button
        type="button"
        variant="warning"
        onClick={handleConfirm}
        className={currentStep === 4 ? 'w-full' : ''}
      >
        {STEP_META[currentStep - 1]?.actionLabel}
      </Button>
    </div>
  ), [currentStep, handleConfirm]);

  return (
    <FormStepper
      currentStep={currentStep}
      onClose={onClose}
      onChangeStep={handleChangeStep}
      navDirection={navDirection}
      title="Quick and reliable support for all inquiries"
      subtitle="Please fill in the form below to register your company for Linknet Fiber service. Our team will review your submission and contact you within 3-5 business days."
      className="lnFormRegistrationMedia"
    >
      {STEP_META.map((stepMeta) => {
        const stepStatus = getStepStatus(stepMeta.step, currentStep);

        return (
          <FormStep
            key={stepMeta.step}
            {...stepMeta}
            status={stepStatus}
            bodySlot={renderStepBody(stepStatus, stepMeta.step)}
            footerSlot={footerSlot}
          />
        );
      })}
    </FormStepper>
  );
}

function ModalFormRegistrationMedia({ onAfterClose }) {
  const { overlayRef, panelRef, animateOut } = useModalAnimation(onAfterClose);

  useBodyScrollLock();
  useEscapeKey(animateOut);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Media registration form"
      className="fixed inset-0 z-100 bg-black/40"
      suppressHydrationWarning
    >
      <div
        ref={panelRef}
        className="lnModalForm__panel absolute inset-0 overflow-y-auto bg-white will-change-transform"
        suppressHydrationWarning
      >
        <RegistrationMediaFormContent onClose={animateOut} />
      </div>
    </div>
  );
}

export default function ModalFormRegistrationMediaProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasMounted = useHasMounted();

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <ModalFormRegistrationMediaContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasMounted && isOpen ? (
        <ModalFormRegistrationMedia onAfterClose={closeModal} />
      ) : null}
    </ModalFormRegistrationMediaContext.Provider>
  );
}
