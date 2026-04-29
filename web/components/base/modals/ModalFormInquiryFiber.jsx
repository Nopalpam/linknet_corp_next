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
import Textarea from "../forms/Textarea";
import FieldReadOnly from "../forms/FieldReadOnly";
import Button from "../Button";
import { useFormSubmission } from '@/components/hooks/useFormSubmission';
import useIndonesiaLocationOptions from '@/components/hooks/useIndonesiaLocationOptions';

const ModalFormInquiryFiberContext = createContext({
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

const NEED_OPTIONS = [
  "Sales Inquiry",
  "Support",
  "Partnership",
].map((option) => ({
  label: option,
  value: option,
}));

const ROLE_OPTIONS = [
  "Owner",
  "Director",
  "Manager",
  "Supervisor",
  "Procurement",
  "IT Lead",
  "Network Engineer",
  "Business Development",
  "Other",
].map((option) => ({
  label: option,
  value: option,
}));

const SERVICE_OPTIONS = [
  "Dedicated Internet",
  "Metro Ethernet",
  "IP Transit",
  "Data Center Connectivity",
  "Managed Service",
  "Fiber Backbone Partnership",
].map((option) => ({
  label: option,
  value: option,
}));

const STEP_META = [
  {
    step: 1,
    step_name: "Needs & Personal Details",
    step_title: "Needs & Personal Details",
    step_description: "Lengkapi kebutuhan inquiry dan data PIC utama perusahaan.",
    actionLabel: "Next",
  },
  {
    step: 2,
    step_name: "Company",
    step_title: "Company Details",
    step_description: "Masukkan detail perusahaan dan alamat korespondensi.",
    actionLabel: "Next",
  },
  {
    step: 3,
    step_name: "Services",
    step_title: "Services & Message",
    step_description: "Jelaskan kebutuhan layanan agar tim kami bisa menindaklanjuti lebih cepat.",
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
  needs: "Needs is required.",
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
  services: "Services is required.",
  message: "Message is required.",
};

const INITIAL_FORM = {
  needs: "",
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
  services: "",
  message: "",
};

function createInitialForm() {
  return {
    ...INITIAL_FORM,
  };
}

function isServiceStepWithoutService(needs) {
  return needs === "Support" || needs === "Partnership";
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

function getStepSummaryItems(step, form) {
  switch (step) {
    case 1:
      return [
        { label: "Needs", value: form.needs },
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
          value: form.detailAddress,
          className: "md:col-span-2",
        },
      ];
    case 3:
      return [
        ...(isServiceStepWithoutService(form.needs)
          ? []
          : [{ label: "Services", value: form.services }]),
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

  if (!form.needs.trim()) {
    errors.needs = FORM_ERROR_MESSAGES.needs;
  }

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

  if (!isServiceStepWithoutService(form.needs) && !form.services.trim()) {
    errors.services = FORM_ERROR_MESSAGES.services;
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

function useInquiryFiberFormState(onSubmitAsync) {
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

      if (field === "needs") {
        updateForm({
          needs: nextValue,
          services: nextValue === "Support" || nextValue === "Partnership" ? "" : form.services,
        });
        clearError("needs");
        clearError("services");
        return;
      }

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
    [clearError, form.services, updateForm]
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

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setForm(createInitialForm());
    setSubmitted(false);
    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection("forward");
  }, []);

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
    handleConfirm,
    handleChangeStep,
    handleReset,
  };
}

export function useModalFormInquiryFiber() {
  return useContext(ModalFormInquiryFiberContext);
}

function Step1Body({ form, onChange, submitAttempted }) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Select
            id="inquiry-fiber-needs"
            label="Needs"
            required
            placeholder="Select needs"
            options={NEED_OPTIONS}
            value={form.needs}
            onChange={onChange("needs")}
            data-error={FORM_ERROR_MESSAGES.needs}
            submitAttempted={submitAttempted}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-body-b4 font-semibold text-black">Personal Details</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="inquiry-fiber-full-name"
            label="Full Name"
            required
            value={form.fullName}
            onChange={onChange("fullName")}
            data-error={FORM_ERROR_MESSAGES.fullName}
            submitAttempted={submitAttempted}
          />
          <Input
            id="inquiry-fiber-company-email"
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
            id="inquiry-fiber-phone-number"
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
            id="inquiry-fiber-role-title"
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
      </section>
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
        id="inquiry-fiber-company-name"
        label="Company Name"
        required
        value={form.companyName}
        onChange={onChange("companyName")}
        data-error={FORM_ERROR_MESSAGES.companyName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="inquiry-fiber-brand-name"
        label="Brand Name"
        required
        value={form.brandName}
        onChange={onChange("brandName")}
        data-error={FORM_ERROR_MESSAGES.brandName}
        submitAttempted={submitAttempted}
      />
      <Select
        id="inquiry-fiber-province"
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
        id="inquiry-fiber-city"
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
        id="inquiry-fiber-zip-code"
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
        id="inquiry-fiber-detail-address"
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

function Step3Body({ form, onChange, submitAttempted }) {
  const hideServices = isServiceStepWithoutService(form.needs);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {!hideServices ? (
        <Select
          id="inquiry-fiber-services"
          label="Services"
          required
          placeholder="Select service"
          options={SERVICE_OPTIONS}
          value={form.services}
          onChange={onChange("services")}
          data-error={FORM_ERROR_MESSAGES.services}
          submitAttempted={submitAttempted}
        />
      ) : null}
      {!hideServices ? <div className="hidden md:block" /> : null}
      <Textarea
        id="inquiry-fiber-message"
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
      <div className="rounded-[20px] bg-[#FFF9EC] px-5 py-4 text-center text-body-b5 leading-relaxed text-secondary">
        Your inquiry is ready. Click <span className="font-semibold text-black">Confirm &amp; Submit</span> to continue to the success page.
      </div>
    </div>
  );
}

function InquiryFiberFormContent({ onClose }) {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'id';

  const { submit } = useFormSubmission('fiber', 'fiber-inquiry');

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
    handleConfirm,
    handleChangeStep,
  } = useInquiryFiberFormState(handleActualSubmit);

  const handleSubmitSuccess = useCallback(() => {
    const locale = params?.locale || "id";
    const firstName = encodeURIComponent(form.fullName.trim());
    const needs = encodeURIComponent(form.needs.trim());

    onClose();
    router.push(`/${locale}/enterprise/form/success?name=${firstName}&needs=${needs}`);
  }, [form.fullName, form.needs, onClose, params?.locale, router]);

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
            submitAttempted={submitAttempted}
          />
        );
      case 4:
        return <Step4Body />;
      default:
        return null;
    }
  }, [form, handleFieldChange, submitAttempted]);

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
      className="lnFormInquiryFiber"
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

function ModalFormInquiryFiber({ onAfterClose }) {
  const { overlayRef, panelRef, animateOut } = useModalAnimation(onAfterClose);

  useBodyScrollLock();
  useEscapeKey(animateOut);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Fiber inquiry form"
      className="fixed inset-0 z-100 bg-black/40"
      suppressHydrationWarning
    >
      <div
        ref={panelRef}
        className="lnModalForm__panel absolute inset-0 overflow-y-auto bg-white will-change-transform"
        suppressHydrationWarning
      >
        <InquiryFiberFormContent onClose={animateOut} />
      </div>
    </div>
  );
}

export default function ModalFormInquiryFiberProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasMounted = useHasMounted();

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <ModalFormInquiryFiberContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasMounted && isOpen ? (
        <ModalFormInquiryFiber onAfterClose={closeModal} />
      ) : null}
    </ModalFormInquiryFiberContext.Provider>
  );
}
