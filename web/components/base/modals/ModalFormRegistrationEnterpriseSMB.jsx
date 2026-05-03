'use client';

/**
 * ModalFormRegistrationEnterpriseSMB.jsx
 * Fullscreen registration modal with GSAP slide-from-bottom animation.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useParams, useRouter } from "next/navigation";
import gsap from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import FormStepper, { FormStep } from "../forms/FormStepper";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import Checkbox from "../forms/Checkbox";
import { RadioCard, RadioCardDate } from "../forms/Radio";
import FieldReadOnly from "../forms/FieldReadOnly";
import Button from "../Button";
import CoverageCheckInput, {
  COVERAGE_MODE,
  resolveManualLabels,
} from "../forms/CoverageCheckInput";
import { submitEnterpriseForm } from '@/lib/formsApi';
import "swiper/css";

const ModalFormRegistrationEnterpriseSMBContext = createContext({
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
const PHONE_REGEX = /^[0-9+\-\s]{8,}$/;

const TIME_SLOTS = [
  { label: "09:00 - 12:00", value: "09:00 - 12:00", selected: true },
  { label: "15:00 - 18:00", value: "15:00 - 18:00" },
  { label: "12:00 - 15:00", value: "12:00 - 15:00", disabled: true },
];

const INSTALL_DATE_OPTIONS = [
  { value: "2026-03-28", dayLabel: "Sabtu", dateLabel: "28 Mar" },
  { value: "2026-03-29", dayLabel: "Minggu", dateLabel: "29 Mar" },
  { value: "2026-03-30", dayLabel: "Senin", dateLabel: "30 Mar" },
  { value: "2026-03-31", dayLabel: "Selasa", dateLabel: "31 Mar" },
  { value: "2026-04-01", dayLabel: "Rabu", dateLabel: "1 Apr" },
];

const INTERNET_SERVICE_OPTIONS = [
  "Broadband 30 Mbps - Rp 350.000/Bulan",
  "Broadband 50 Mbps - Rp 400.000/Bulan",
  "Broadband 100 Mbps - Rp 600.000/Bulan",
  "Broadband 200 Mbps - Rp 1.250.000/Bulan",
].map((option) => ({
  label: option,
  value: option,
}));

const SUBSCRIPTION_TERM_OPTIONS = ["12 Bulan", "24 Bulan", "36 Bulan"].map(
  (option) => ({
    label: option,
    value: option,
  })
);

const POSITION_OPTIONS = [
  "Owner",
  "Direktur",
  "Manager",
  "Supervisor",
  "Staff",
  "Lainnya",
].map((option) => ({
  label: option,
  value: option,
}));

const MANUAL_FIELD_MAP = {
  province: { formKey: "manualProvince", errorKey: "province" },
  city: { formKey: "manualCity", errorKey: "city" },
  zip: { formKey: "manualZip", errorKey: "zip" },
  detailAddress: {
    formKey: "manualDetailAddress",
    errorKey: "detailAddress",
  },
};
const MANUAL_FIELDS = Object.entries(MANUAL_FIELD_MAP);

const STEP_META = [
  {
    step: 1,
    name: "lokasi",
    step_name: "Layanan & Lokasi",
    step_title: "Layanan & Lokasi Pemasangan",
    step_description:
      "Pastikan alamat pemasangan sudah benar sebelum melanjutkan.",
    actionLabel: "Confirm & Next",
  },
  {
    step: 2,
    name: "personal_data",
    step_name: "Data Diri",
    step_title: "Data Diri",
    step_description: "Pastikan data yang Anda masukkan sudah benar.",
    actionLabel: "Confirm & Next",
  },
  {
    step: 3,
    name: "schedule",
    step_name: "Jadwal Instalasi",
    step_title: "Jadwal Instalasi",
    step_description:
      "Kami akan menghubungi Anda untuk konfirmasi jadwal setelah proses selesai.",
    actionLabel: "Review",
  },
  {
    step: 4,
    name: "submit",
    step_name: "Review",
    step_title: "",
    step_description: "",
    actionLabel: "Confirm & Submit",
  },
];

const INITIAL_FORM = {
  site_id: "",
  internetService: "",
  subscriptionTerm: "",
  address: "",
  addressDetail: "",
  manualProvince: "",
  manualCity: "",
  manualZip: "",
  manualDetailAddress: "",
  companyName: "",
  brandName: "",
  picName: "",
  jobTitle: "",
  companyEmail: "",
  phoneNumber: "",
  isBillingSameAsInstallation: false,
  billingAddress: "",
  installDate: "",
  installTimeSlot: "",
};

const INITIAL_MODAL_PAYLOAD = {
  internetService: "",
  site_id: "",
  address: "",
  context: undefined,
};

const FORM_ERROR_MESSAGES = {
  internetService: "Layanan internet wajib dipilih.",
  subscriptionTerm: "Jangka waktu berlangganan wajib dipilih.",
  companyName: "Nama perusahaan wajib diisi.",
  brandName: "Nama brand wajib diisi.",
  picName: "Nama PIC wajib diisi.",
  jobTitle: "Jabatan wajib dipilih.",
  companyEmail: "Email wajib diisi.",
  companyEmailFormat: "Format email tidak valid.",
  phoneNumber: "Nomor telepon wajib diisi.",
  phoneNumberFormat: "Format nomor telepon tidak valid.",
  billingAddress: "Alamat penagihan wajib diisi.",
  installDate: "Tanggal instalasi wajib dipilih.",
  installTimeSlot: "Slot waktu wajib dipilih.",
};

function createInitialForm(overrides = {}) {
  return { ...INITIAL_FORM, ...overrides };
}

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

function buildInstallationAddress(form, coverageMode) {
  if (coverageMode === COVERAGE_MODE.MANUAL) {
    const labels = resolveManualLabels({
      province: form.manualProvince,
      city: form.manualCity,
      zip: form.manualZip,
      detailAddress: form.manualDetailAddress,
    });

    return [
      labels.detailAddress,
      labels.zipLabel,
      labels.cityLabel,
      labels.provinceLabel,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return [form.address, form.addressDetail].filter(Boolean).join(", ");
}

function withSyncedBillingAddress(prevForm, patch, coverageMode) {
  const nextForm = { ...prevForm, ...patch };

  if (!nextForm.isBillingSameAsInstallation) {
    return patch;
  }

  return {
    ...patch,
    billingAddress: buildInstallationAddress(nextForm, coverageMode),
  };
}

function getStepSummaryItems(step, form, coverageMode) {
  const installationAddress = buildInstallationAddress(form, coverageMode);

  switch (step) {
    case 1:
      return [
        {
          label: "Layanan Internet",
          value: form.internetService,
        },
        {
          label: "Jangka Waktu Berlangganan",
          value: form.subscriptionTerm,
        },
        {
          label: "Alamat Pemasangan",
          value: installationAddress,
          className: "sm:col-span-2",
        },
      ];
    case 2:
      return [
        {
          label: "Nama Perusahaan",
          value: form.companyName,
        },
        {
          label: "Nama Brand",
          value: form.brandName,
        },
        {
          label: "Nama PIC",
          value: form.picName,
        },
        {
          label: "Jabatan",
          value: form.jobTitle,
        },
        {
          label: "Email",
          value: form.companyEmail,
        },
        {
          label: "No HP",
          value: form.phoneNumber,
        },
        {
          label: "Alamat Penagihan",
          value: form.billingAddress,
          className: "sm:col-span-2",
        },
      ];
    case 3:
      return [
        {
          label: "Tanggal Instalasi",
          value: form.installDate,
        },
        {
          label: "Slot Waktu",
          value: form.installTimeSlot,
        },
      ];
    default:
      return [];
  }
}

function StepSummary({ items, className = "grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2" }) {
  return (
    <div className={className}>
      {items.map(({ label, value, className: itemClassName }) => (
        <FieldReadOnly
          key={label}
          label={label}
          value={value}
          className={itemClassName || ""}
        />
      ))}
    </div>
  );
}

function omitKeys(object, keys) {
  let changed = false;
  const next = { ...object };

  keys.forEach((key) => {
    if (key in next) {
      delete next[key];
      changed = true;
    }
  });

  return changed ? next : object;
}

function validateLocationStep(form, coverageMode) {
  const errors = {};

  if (!form.internetService.trim()) {
    errors.internetService = FORM_ERROR_MESSAGES.internetService;
  }

  if (!form.subscriptionTerm.trim()) {
    errors.subscriptionTerm = FORM_ERROR_MESSAGES.subscriptionTerm;
  }

  if (coverageMode === COVERAGE_MODE.SEARCH && !form.address.trim()) {
    errors.address = "Alamat pemasangan wajib diisi.";
  }

  if (coverageMode === COVERAGE_MODE.MANUAL) {
    if (!form.manualProvince.trim()) {
      errors.province = "Province wajib dipilih.";
    }

    if (!form.manualCity.trim()) {
      errors.city = "City / Regency wajib dipilih.";
    }

    if (!form.manualZip.trim()) {
      errors.zip = "Ward / ZIP Code wajib dipilih.";
    }

    if (!form.manualDetailAddress.trim()) {
      errors.detailAddress = "Detail address wajib diisi.";
    }
  }

  return errors;
}

function validatePersonalStep(form) {
  const errors = {};

  if (!form.companyName.trim()) {
    errors.companyName = FORM_ERROR_MESSAGES.companyName;
  }

  if (!form.brandName.trim()) {
    errors.brandName = FORM_ERROR_MESSAGES.brandName;
  }

  if (!form.picName.trim()) {
    errors.picName = FORM_ERROR_MESSAGES.picName;
  }

  if (!form.jobTitle.trim()) {
    errors.jobTitle = FORM_ERROR_MESSAGES.jobTitle;
  }

  if (!form.companyEmail.trim()) {
    errors.companyEmail = FORM_ERROR_MESSAGES.companyEmail;
  } else if (!EMAIL_REGEX.test(form.companyEmail)) {
    errors.companyEmail = FORM_ERROR_MESSAGES.companyEmailFormat;
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = FORM_ERROR_MESSAGES.phoneNumber;
  } else if (!PHONE_REGEX.test(form.phoneNumber)) {
    errors.phoneNumber = FORM_ERROR_MESSAGES.phoneNumberFormat;
  }

  if (!form.billingAddress.trim()) {
    errors.billingAddress = FORM_ERROR_MESSAGES.billingAddress;
  }

  return errors;
}

function validateScheduleStep(form) {
  return [
    ["installDate", FORM_ERROR_MESSAGES.installDate],
    ["installTimeSlot", FORM_ERROR_MESSAGES.installTimeSlot],
  ].reduce((errors, [field, message]) => {
    if (!form[field]) {
      errors[field] = message;
    }

    return errors;
  }, {});
}

function validateStep(stepNumber, form, coverageMode) {
  switch (stepNumber) {
    case 1:
      return validateLocationStep(form, coverageMode);
    case 2:
      return validatePersonalStep(form);
    case 3:
      return validateScheduleStep(form);
    case 4:
      return {
        ...validateLocationStep(form, coverageMode),
        ...validatePersonalStep(form),
        ...validateScheduleStep(form),
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

function useRegistrationFormState(initialPayload = INITIAL_MODAL_PAYLOAD, onSubmitAsync) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(() =>
    createInitialForm({
      internetService: initialPayload.internetService || "",
      site_id: initialPayload.site_id || "",
      address: initialPayload.address || "",
    })
  );
  const [coverageMode, setCoverageMode] = useState(
    initialPayload.site_id ? COVERAGE_MODE.COVERED : COVERAGE_MODE.SEARCH
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [navDirection, setNavDirection] = useState("forward");
  const [billingAddressInputKey, setBillingAddressInputKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const onSubmitAsyncRef = useRef(onSubmitAsync);
  useEffect(() => { onSubmitAsyncRef.current = onSubmitAsync; }, [onSubmitAsync]);

  const clearErrors = useCallback((keys) => {
    setStepErrors((prev) => omitKeys(prev, keys));
  }, []);

  const updateForm = useCallback(
    (patch, nextCoverageMode = coverageMode) => {
      setForm((prev) => ({
        ...prev,
        ...withSyncedBillingAddress(prev, patch, nextCoverageMode),
      }));
    },
    [coverageMode]
  );

  const handleCoverageModeChange = useCallback((mode) => {
    setCoverageMode(mode);
    if (form.isBillingSameAsInstallation) {
      updateForm({}, mode);
      setBillingAddressInputKey((prev) => prev + 1);
    }
  }, [form.isBillingSameAsInstallation, updateForm]);

  const handleFieldChange = useCallback(
    (field) => (event) => {
      updateForm({ [field]: event.target.value });
      clearErrors([field]);
    },
    [clearErrors, updateForm]
  );

  const handleBillingSyncChange = useCallback(
    (event) => {
      const checked = event.target.checked;

      updateForm({
        isBillingSameAsInstallation: checked,
        billingAddress: checked ? undefined : "",
      });
      setBillingAddressInputKey((prev) => prev + 1);
      clearErrors(["billingAddress"]);
    },
    [clearErrors, updateForm]
  );

  const handleManualDataChange = useCallback(
    (manualData) => {
      const patch = MANUAL_FIELDS.reduce((result, [key, field]) => {
        result[field.formKey] = manualData[key];
        return result;
      }, {});

      updateForm(patch);
      if (form.isBillingSameAsInstallation) {
        setBillingAddressInputKey((prev) => prev + 1);
      }

      const resolvedErrorKeys = MANUAL_FIELDS
        .filter(([key]) => manualData[key])
        .map(([, field]) => field.errorKey);

      clearErrors(resolvedErrorKeys);
    },
    [clearErrors, form.isBillingSameAsInstallation, updateForm]
  );

  const handleAddressSelect = useCallback(
    ({ site_id, address }) => {
      updateForm({ site_id, address });
      if (form.isBillingSameAsInstallation) {
        setBillingAddressInputKey((prev) => prev + 1);
      }
      clearErrors(["address"]);
    },
    [clearErrors, form.isBillingSameAsInstallation, updateForm]
  );

  const handleAddressReset = useCallback(() => {
    updateForm({
      site_id: "",
      address: "",
      addressDetail: "",
      manualProvince: "",
      manualCity: "",
      manualZip: "",
      manualDetailAddress: "",
    });
    if (form.isBillingSameAsInstallation) {
      setBillingAddressInputKey((prev) => prev + 1);
    }
    setStepErrors({});
  }, [form.isBillingSameAsInstallation, updateForm]);

  const handleTimeSlot = useCallback(
    (slot) => {
      updateForm({ installTimeSlot: slot });
      clearErrors(["installTimeSlot"]);
    },
    [clearErrors, updateForm]
  );

  const handleConfirm = useCallback(async () => {
    const errors = validateStep(currentStep, form, coverageMode);

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      setStepErrors(errors);
      return;
    }

    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection("forward");

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((step) => step + 1);
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
  }, [coverageMode, currentStep, form]);

  const handleChangeStep = useCallback((step) => {
    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection("backward");
    setCurrentStep(step);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setForm(
      createInitialForm({
        internetService: initialPayload.internetService || "",
        site_id: initialPayload.site_id || "",
        address: initialPayload.address || "",
      })
    );
    setCoverageMode(initialPayload.site_id ? COVERAGE_MODE.COVERED : COVERAGE_MODE.SEARCH);
    setSubmitted(false);
    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection("forward");
  }, [initialPayload.address, initialPayload.internetService, initialPayload.site_id]);

  return {
    currentStep,
    form,
    coverageMode,
    submitted,
    submitAttempted,
    stepErrors,
    navDirection,
    billingAddressInputKey,
    handleCoverageModeChange,
    handleFieldChange,
    handleBillingSyncChange,
    handleManualDataChange,
    handleAddressSelect,
    handleAddressReset,
    handleTimeSlot,
    handleConfirm,
    handleChangeStep,
    handleReset,
    isSubmitting,
    submitError,
  };
}

export function useModalFormRegistrationEnterpriseSMB() {
  return useContext(ModalFormRegistrationEnterpriseSMBContext);
}

function Step1Body({
  form,
  onChange,
  onManualDataChange,
  onAddressSelect,
  onAddressReset,
  errors,
  submitAttempted,
  onCoverageModeChange,
}) {
  return (
    <div className="lnFormRegistration__fields space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="internetService"
          label="Layanan Internet"
          required
          data-error={FORM_ERROR_MESSAGES.internetService}
          placeholder="Pilih layanan internet"
          options={INTERNET_SERVICE_OPTIONS}
          value={form.internetService}
          onChange={onChange("internetService")}
          submitAttempted={submitAttempted}
        />
        <Select
          id="subscriptionTerm"
          label="Jangka Waktu Berlangganan"
          required
          data-error={FORM_ERROR_MESSAGES.subscriptionTerm}
          placeholder="Pilih jangka waktu"
          options={SUBSCRIPTION_TERM_OPTIONS}
          value={form.subscriptionTerm}
          onChange={onChange("subscriptionTerm")}
          submitAttempted={submitAttempted}
        />
      </div>
      <hr className="border-0 border-t border-dotted border-neutral-200" style={{ borderTopWidth: 1 }} />
      <CoverageCheckInput
        required
        site_id={form.site_id ?? ""}
        address={form.address ?? ""}
        addressDetail={form.addressDetail}
        onAddressDetailChange={onChange("addressDetail")}
        manualData={{
          province: form.manualProvince,
          city: form.manualCity,
          zip: form.manualZip,
          detailAddress: form.manualDetailAddress,
        }}
        onManualDataChange={onManualDataChange}
        onModeChange={onCoverageModeChange}
        onAddressSelect={onAddressSelect}
        onAddressReset={onAddressReset}
        errors={errors}
        submitAttempted={submitAttempted}
      />
    </div>
  );
}

function Step1Summary({ form, coverageMode }) {
  return <StepSummary items={getStepSummaryItems(1, form, coverageMode)} />;
}

function Step2Body({
  form,
  billingAddressInputKey,
  onChange,
  onBillingSyncChange,
  submitAttempted,
}) {
  return (
    <div className="lnFormRegistration__fields space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="companyName"
          label="Nama Perusahaan"
          required
          data-error={FORM_ERROR_MESSAGES.companyName}
          value={form.companyName}
          onChange={onChange("companyName")}
          submitAttempted={submitAttempted}
        />
        <Input
          id="brandName"
          label="Nama Brand"
          required
          data-error={FORM_ERROR_MESSAGES.brandName}
          value={form.brandName}
          onChange={onChange("brandName")}
          submitAttempted={submitAttempted}
        />
        <Input
          id="picName"
          label="Nama PIC"
          required
          data-error={FORM_ERROR_MESSAGES.picName}
          value={form.picName}
          onChange={onChange("picName")}
          submitAttempted={submitAttempted}
        />
        <Select
          id="jobTitle"
          label="Jabatan"
          required
          data-error={FORM_ERROR_MESSAGES.jobTitle}
          placeholder="Pilih jabatan"
          options={POSITION_OPTIONS}
          value={form.jobTitle}
          onChange={onChange("jobTitle")}
          submitAttempted={submitAttempted}
        />
        <Input
          id="companyEmail"
          label="Email"
          type="email"
          required
          data-error={FORM_ERROR_MESSAGES.companyEmail}
          data-error-email={FORM_ERROR_MESSAGES.companyEmailFormat}
          value={form.companyEmail}
          onChange={onChange("companyEmail")}
          submitAttempted={submitAttempted}
        />
        <Input
          id="phoneNumber"
          label="No HP"
          type="tel"
          required
          data-error={FORM_ERROR_MESSAGES.phoneNumber}
          data-error-phone={FORM_ERROR_MESSAGES.phoneNumberFormat}
          value={form.phoneNumber}
          onChange={onChange("phoneNumber")}
          submitAttempted={submitAttempted}
        />
      </div>

      <Checkbox
        id="isBillingSameAsInstallation"
        label="Alamat Penagihan sama dengan Alamat Pemasangan"
        checked={form.isBillingSameAsInstallation}
        onChange={onBillingSyncChange}
        className="!bg-white !px-2 !pb-1"
      />

      <Textarea
        id="billingAddress"
        key={`billingAddress-${billingAddressInputKey}`}
        label="Alamat Penagihan"
        required
        data-error={FORM_ERROR_MESSAGES.billingAddress}
        rows={4}
        value={form.billingAddress}
        onChange={onChange("billingAddress")}
        submitAttempted={submitAttempted}
        disabled={form.isBillingSameAsInstallation}
      />
    </div>
  );
}

function Step2Summary({ form }) {
  return <StepSummary items={getStepSummaryItems(2, form)} />;
}

function TimeSlotPicker({ value, onChange, submitAttempted }) {
  const groupError = submitAttempted && !value ? FORM_ERROR_MESSAGES.installTimeSlot : "";

  return (
    <div className="lnTimeSlotPicker">
      <p className="lnTimeSlotPicker__label mb-2 text-body-b5 text-secondary">
        Pilih Waktu Pemasangan
      </p>
      <Swiper
        slidesPerView="auto"
        spaceBetween={12}
        className="lnTimeSlotPicker__grid !overflow-visible"
      >
        {TIME_SLOTS.map((slot) => {
          const isSelected = value === slot.value;

          return (
            <SwiperSlide key={slot.value} className="!w-auto !h-auto">
              <RadioCard
                id={`install-time-slot-${slot.value.replace(/[^a-zA-Z0-9]+/g, "-")}`}
                name="install-time-slot"
                value={slot.value}
                label={slot.label}
                checked={isSelected}
                onChange={(event) => {
                  if (!slot.disabled) onChange(event.target.value);
                }}
                data-error={FORM_ERROR_MESSAGES.installTimeSlot}
                error={groupError}
                disabled={slot.disabled}
                className="w-auto"
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

function InstallDatePicker({ value, onChange, submitAttempted }) {
  const groupError = submitAttempted && !value ? FORM_ERROR_MESSAGES.installDate : "";

  return (
    <div className="lnInstallDatePicker">
      <Swiper
        slidesPerView="auto"
        spaceBetween={12}
        className="lnInstallDatePicker__grid !overflow-visible"
      >
        {INSTALL_DATE_OPTIONS.map((option) => (
          <SwiperSlide key={option.value} className="!w-auto !h-auto">
            <RadioCardDate
              id={`install-date-${option.value}`}
              name="install-date"
              value={option.value}
              dayLabel={option.dayLabel}
              dateLabel={option.dateLabel}
              checked={value === option.value}
              onChange={onChange}
              data-error={FORM_ERROR_MESSAGES.installDate}
              error={groupError}
              className="h-full w-auto"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function Step3Body({ form, onChange, onTimeSlot, submitAttempted }) {
  return (
    <div className="lnFormRegistration__fields space-y-6">
      <InstallDatePicker
        value={form.installDate}
        onChange={onChange("installDate")}
        submitAttempted={submitAttempted}
      />
      <TimeSlotPicker
        value={form.installTimeSlot}
        onChange={onTimeSlot}
        submitAttempted={submitAttempted}
      />
    </div>
  );
}

function Step3Summary({ form }) {
  return <StepSummary items={getStepSummaryItems(3, form)} />;
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

function RegistrationFormContent({ onClose, initialPayload }) {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'id';

  const handleActualSubmit = useCallback(
    async (form) => submitEnterpriseForm('smb_enterprise', {
      locale,
      fields: form,
      context: resolveSubmissionContext(initialPayload),
      groups: [],
      files: [],
    }),
    [initialPayload, locale],
  );

  const {
    currentStep,
    form,
    coverageMode,
    submitted,
    submitAttempted,
    stepErrors,
    navDirection,
    billingAddressInputKey,
    handleCoverageModeChange,
    handleFieldChange,
    handleBillingSyncChange,
    handleManualDataChange,
    handleAddressSelect,
    handleAddressReset,
    handleTimeSlot,
    handleConfirm,
    handleChangeStep,
    isSubmitting,
    submitError,
  } = useRegistrationFormState(initialPayload, handleActualSubmit);

  const handleSubmitSuccess = useCallback(() => {
    const locale = params?.locale || "id";
    const firstName = encodeURIComponent(form.picName.trim());

    onClose();
    router.push(`/${locale}/enterprise/form/success?name=${firstName}`);
  }, [form.picName, onClose, params?.locale, router]);

  useEffect(() => {
    if (!submitted) return;

    handleSubmitSuccess();
  }, [handleSubmitSuccess, submitted]);

  const renderStepBody = (stepStatus, step) => {
    if (stepStatus !== "active") {
      switch (step) {
        case 1:
          return <Step1Summary form={form} coverageMode={coverageMode} />;
        case 2:
          return <Step2Summary form={form} />;
        case 3:
          return <Step3Summary form={form} />;
        case 4:
          return null;
        default:
          return null;
      }
    }

    switch (step) {
      case 1:
        return (
          <Step1Body
            form={form}
            onChange={handleFieldChange}
            onManualDataChange={handleManualDataChange}
            onAddressSelect={handleAddressSelect}
            onAddressReset={handleAddressReset}
            errors={stepErrors}
            submitAttempted={submitAttempted}
            onCoverageModeChange={handleCoverageModeChange}
          />
        );
      case 2:
        return (
          <Step2Body
            form={form}
            billingAddressInputKey={billingAddressInputKey}
            onChange={handleFieldChange}
            onBillingSyncChange={handleBillingSyncChange}
            submitAttempted={submitAttempted}
          />
        );
      case 3:
        return (
          <Step3Body
            form={form}
            onChange={handleFieldChange}
            onTimeSlot={handleTimeSlot}
            submitAttempted={submitAttempted}
          />
        );
      case 4:
        return <Step4Body />;
      default:
        return null;
    }
  };

  return (
    <FormStepper
      currentStep={currentStep}
      onClose={onClose}
      onChangeStep={handleChangeStep}
      navDirection={navDirection}
      title="Quick and reliable support for all inquiries"
      subtitle="Please fill in the form below to register your company for Linknet Fiber service. Our team will review your submission and contact you within 3-5 business days."
      className="lnFormRegistration"
    >
      {STEP_META.map((stepMeta) => {
        const stepStatus = getStepStatus(stepMeta.step, currentStep);

        return (
          <FormStep
            key={stepMeta.step}
            {...stepMeta}
            status={stepStatus}
            bodySlot={renderStepBody(stepStatus, stepMeta.step)}
            footerSlot={
              <Button
                variant="warning"
                onClick={handleConfirm}
                className={stepMeta.step === 4 ? 'w-full' : ''}
              >
                {stepMeta.actionLabel}
              </Button>
            }
          />
        );
      })}
    </FormStepper>
  );
}

function ModalFormRegistrationEnterpriseSMB({ onAfterClose, initialPayload }) {
  const { overlayRef, panelRef, animateOut } = useModalAnimation(onAfterClose);

  useBodyScrollLock();
  useEscapeKey(animateOut);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Form registrasi"
      className="lnModalFormRegistration fixed inset-0 z-100 bg-black/40"
      suppressHydrationWarning
    >
      <div
        ref={panelRef}
        className="lnModalFormRegistration__panel lnModalForm__panel absolute inset-0 overflow-y-auto bg-white will-change-transform"
        suppressHydrationWarning
      >
        <RegistrationFormContent onClose={animateOut} initialPayload={initialPayload} />
      </div>
    </div>
  );
}

export default function ModalFormRegistrationEnterpriseSMBProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState(INITIAL_MODAL_PAYLOAD);
  const hasMounted = useHasMounted();

  const openModal = useCallback((payload = {}) => {
    setModalPayload({
      internetService: payload.internetService || "",
      site_id: payload.site_id || "",
      address: payload.address || "",
      Product: payload.Product,
      Promo_Website__c: payload.Promo_Website__c,
      Page_Website__c: payload.Page_Website__c,
      Source_Website__c: payload.Source_Website__c,
      context: payload.context,
    });
    setIsOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalPayload(INITIAL_MODAL_PAYLOAD);
  }, []);

  return (
    <ModalFormRegistrationEnterpriseSMBContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasMounted && isOpen && (
        <ModalFormRegistrationEnterpriseSMB
          onAfterClose={closeModal}
          initialPayload={modalPayload}
        />
      )}
    </ModalFormRegistrationEnterpriseSMBContext.Provider>
  );
}
