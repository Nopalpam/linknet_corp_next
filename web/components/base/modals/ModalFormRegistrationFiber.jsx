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
import InputDate from "../forms/InputDate";
import InputFile from "../forms/InputFile";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import Checkbox from "../forms/Checkbox";
import FieldReadOnly from "../forms/FieldReadOnly";
import Button from "../Button";
import { useFormSubmission } from '@/components/hooks/useFormSubmission';
import useIndonesiaLocationOptions from '@/components/hooks/useIndonesiaLocationOptions';

const ModalFormRegistrationFiberContext = createContext({
  openModal: () => {},
  closeModal: () => {},
});

const MODAL_ANIMATION = {
  duration: 0.45,
  enterEase: "power3.out",
  exitEase: "power3.in",
};

const TOTAL_STEPS = 5;

const ROLE_OPTIONS = [
  "Owner",
  "Director",
  "Head of Operation",
  "Business Development",
  "Network Engineer",
  "Procurement",
].map((option) => ({
  label: option,
  value: option,
}));

const STEP_META = [
  {
    step: 1,
    step_name: "Personal",
    step_title: "Personal Details",
    step_description: "Lengkapi data PIC perusahaan untuk kebutuhan registrasi awal.",
    actionLabel: "Next",
  },
  {
    step: 2,
    step_name: "Corporate",
    step_title: "Corporate Profile & Legal",
    step_description: "Masukkan profil perusahaan serta data legalitas yang masih aktif.",
    actionLabel: "Next",
  },
  {
    step: 3,
    step_name: "Infrastructure",
    step_title: "Infrastructure Details & Requirements",
    step_description: "Isi kebutuhan infrastruktur dan preferensi pemanfaatan layanan fiber.",
    actionLabel: "Next",
  },
  {
    step: 4,
    step_name: "Documents",
    step_title: "Upload Documents",
    step_description: "Dokumen pada tahap ini opsional dan dapat dilengkapi jika sudah tersedia.",
    actionLabel: "Review",
  },
  {
    step: 5,
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
  directorName: "Name of Incharge Director is required.",
  province: "Province is required.",
  city: "City is required.",
  zipCode: "Ward / ZIP Code is required.",
  detailAddress: "Detail Address is required.",
  companyEstablishmentDate: "Company Establishment Date is required.",
  companyOperatingSince: "Company Operating since is required.",
  nibCompanyNumber: "NIB Company is required.",
  npwpCompanyNumber: "No NPWP Company is required.",
  sppkpCompanyNumber: "Company SPPKP Number is required.",
  licensePermitNumber: "License Permit Number is required.",
  apjiiMembershipNumber: "APJII Membership Number is required.",
  apjiiMembershipActiveDate: "APJII Membership Active Date is required.",
  employeeCount: "Number of employees is required.",
  homepassedCount: "Number of Existing Homepassed is required.",
  customerCount: "Number of Existing Customers is required.",
  coverageArea: "Coverage Area is required.",
  ispInfrastructureCoverage: "ISP Infrastructure Coverage is required.",
  productTypeCount: "Types of products is required.",
  companySignatureFile: "Upload Signature with Company Stamp is required.",
  utilizationConfirmed: "Please confirm utilization of Linknet Fiber Network Infrastructure.",
  wholesaleProductConfirmed: "Please confirm Linknet Fiber Wholesale Product.",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9,}$/;

const OPTIONAL_FILE_FIELDS = [
  "npwpCompanyFile",
  "nibCompanyFile",
  "apjiiCertificateFile",
  "linknetProductStatementFile",
  "previousYearFinancialReportFile",
  "companyDeedFile",
  "deedAmendmentFile",
  "corporateTaxReportFile",
];

const INITIAL_FORM = {
  fullName: "",
  companyEmail: "",
  phoneNumber: "",
  yourRole: "",
  companyName: "",
  directorName: "",
  province: "",
  city: "",
  zipCode: "",
  detailAddress: "",
  companyEstablishmentDate: "",
  companyOperatingSince: "",
  nibCompanyNumber: "",
  npwpCompanyNumber: "",
  sppkpCompanyNumber: "",
  licensePermitNumber: "",
  apjiiMembershipNumber: "",
  apjiiMembershipActiveDate: "",
  employeeCount: "",
  homepassedCount: "",
  customerCount: "",
  coverageArea: "",
  ispInfrastructureCoverage: "",
  productTypeCount: "",
  companySignatureFile: null,
  utilizationConfirmed: false,
  wholesaleProductConfirmed: false,
  npwpCompanyFile: null,
  nibCompanyFile: null,
  apjiiCertificateFile: null,
  linknetProductStatementFile: null,
  previousYearFinancialReportFile: null,
  companyDeedFile: null,
  deedAmendmentFile: null,
  corporateTaxReportFile: null,
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

function buildFileValue(file) {
  return file?.name || "";
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
        { label: "Name of Incharge Director", value: form.directorName },
        { label: "Province", value: form.province },
        { label: "City", value: form.city },
        { label: "Ward / ZIP Code", value: form.zipCode },
        {
          label: "Detail Address",
          value: form.detailAddress,
          className: "md:col-span-2",
        },
        { label: "Company Establishment Date", value: form.companyEstablishmentDate },
        { label: "Company Operating since", value: form.companyOperatingSince },
        { label: "NIB Company", value: form.nibCompanyNumber },
        { label: "No NPWP Company", value: form.npwpCompanyNumber },
        { label: "Company SPPKP Number", value: form.sppkpCompanyNumber },
        { label: "License Permit Number", value: form.licensePermitNumber },
        { label: "APJII Membership Number", value: form.apjiiMembershipNumber },
        { label: "APJII Membership Active Date", value: form.apjiiMembershipActiveDate },
      ];
    case 3:
      return [
        { label: "Number of Employee", value: form.employeeCount },
        { label: "Number of ex homepassed", value: form.homepassedCount },
        { label: "Number of ex customers", value: form.customerCount },
        { label: "Type of Product", value: form.productTypeCount },
        {
          label: "Coverage Area",
          value: form.coverageArea,
          className: "md:col-span-2",
        },
        {
          label: "ISP Infrastructure Coverage",
          value: form.ispInfrastructureCoverage,
          className: "md:col-span-2",
        },
        {
          label: "Upload Signature with Company Stamp",
          value: buildFileValue(form.companySignatureFile),
          className: "md:col-span-2",
        },
        {
          label: "Utilization of Linknet Fiber Network Infrastructure",
          value: form.utilizationConfirmed ? "Confirmed" : "",
          className: "md:col-span-2",
        },
        {
          label: "Linknet Fiber Wholesale Product",
          value: form.wholesaleProductConfirmed ? "Confirmed" : "",
          className: "md:col-span-2",
        },
      ];
    case 4:
      return [
        { label: "NPWP Company", value: buildFileValue(form.npwpCompanyFile), required: false },
        { label: "NIB Company", value: buildFileValue(form.nibCompanyFile), required: false },
        {
          label: "APJII Participation Certificate",
          value: buildFileValue(form.apjiiCertificateFile),
          required: false,
        },
        {
          label: "Written statement of the Linknet product to be selected",
          value: buildFileValue(form.linknetProductStatementFile),
          required: false,
        },
        {
          label: "Previous Year Financial Report (Company)",
          value: buildFileValue(form.previousYearFinancialReportFile),
          required: false,
        },
        {
          label: "Company Deed of Establishment and Company Decree",
          value: buildFileValue(form.companyDeedFile),
          required: false,
        },
        {
          label: "Deed of Amendment and Company Decree",
          value: buildFileValue(form.deedAmendmentFile),
          required: false,
        },
        {
          label: "Corporate Tax Report",
          value: buildFileValue(form.corporateTaxReportFile),
          required: false,
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
    ["directorName", FORM_ERROR_MESSAGES.directorName],
    ["province", FORM_ERROR_MESSAGES.province],
    ["city", FORM_ERROR_MESSAGES.city],
    ["zipCode", FORM_ERROR_MESSAGES.zipCode],
    ["detailAddress", FORM_ERROR_MESSAGES.detailAddress],
    ["companyEstablishmentDate", FORM_ERROR_MESSAGES.companyEstablishmentDate],
    ["companyOperatingSince", FORM_ERROR_MESSAGES.companyOperatingSince],
    ["nibCompanyNumber", FORM_ERROR_MESSAGES.nibCompanyNumber],
    ["npwpCompanyNumber", FORM_ERROR_MESSAGES.npwpCompanyNumber],
    ["sppkpCompanyNumber", FORM_ERROR_MESSAGES.sppkpCompanyNumber],
    ["licensePermitNumber", FORM_ERROR_MESSAGES.licensePermitNumber],
    ["apjiiMembershipNumber", FORM_ERROR_MESSAGES.apjiiMembershipNumber],
    ["apjiiMembershipActiveDate", FORM_ERROR_MESSAGES.apjiiMembershipActiveDate],
  ].reduce((result, [field, message]) => {
    if (!String(form[field] || "").trim()) {
      result[field] = message;
    }

    return result;
  }, {});
}

function validateStep3(form) {
  const errors = [
    ["employeeCount", FORM_ERROR_MESSAGES.employeeCount],
    ["homepassedCount", FORM_ERROR_MESSAGES.homepassedCount],
    ["customerCount", FORM_ERROR_MESSAGES.customerCount],
    ["coverageArea", FORM_ERROR_MESSAGES.coverageArea],
    ["ispInfrastructureCoverage", FORM_ERROR_MESSAGES.ispInfrastructureCoverage],
    ["productTypeCount", FORM_ERROR_MESSAGES.productTypeCount],
  ].reduce((result, [field, message]) => {
    if (!String(form[field] || "").trim()) {
      result[field] = message;
    }

    return result;
  }, {});

  if (!form.companySignatureFile) {
    errors.companySignatureFile = FORM_ERROR_MESSAGES.companySignatureFile;
  }

  if (!form.utilizationConfirmed) {
    errors.utilizationConfirmed = FORM_ERROR_MESSAGES.utilizationConfirmed;
  }

  if (!form.wholesaleProductConfirmed) {
    errors.wholesaleProductConfirmed = FORM_ERROR_MESSAGES.wholesaleProductConfirmed;
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
      return {};
    case 5:
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

function useRegistrationFiberFormState(onSubmitAsync) {
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

  const handleFileChange = useCallback(
    (field) => (event) => {
      const file = event.target.files?.[0] || null;
      updateForm({ [field]: file });
      clearError(field);
    },
    [clearError, updateForm]
  );

  const handleFileRemove = useCallback(
    (field) => () => {
      updateForm({ [field]: null });
      clearError(field);
    },
    [clearError, updateForm]
  );

  const handleCheckboxChange = useCallback(
    (field) => (event) => {
      updateForm({ [field]: event.target.checked });
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

  const handleBack = useCallback(() => {
    if (currentStep === 1) return;

    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection("backward");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, [currentStep]);

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
    handleFileChange,
    handleFileRemove,
    handleCheckboxChange,
    handleConfirm,
    handleBack,
    handleChangeStep,
    handleReset,
  };
}

export function useModalFormRegistrationFiber() {
  return useContext(ModalFormRegistrationFiberContext);
}

function Step1Body({ form, onChange, submitAttempted }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        id="fiber-full-name"
        label="Full Name"
        required
        value={form.fullName}
        onChange={onChange("fullName")}
        data-error={FORM_ERROR_MESSAGES.fullName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="fiber-company-email"
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
        id="fiber-phone-number"
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
        id="fiber-role-title"
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
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-body-b4 font-semibold text-black">Corporate Profile</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="fiber-company-name"
            label="Company Name"
            required
            value={form.companyName}
            onChange={onChange("companyName")}
            data-error={FORM_ERROR_MESSAGES.companyName}
            submitAttempted={submitAttempted}
          />
          <Input
            id="fiber-director-name"
            label="Name of Incharge Director"
            required
            value={form.directorName}
            onChange={onChange("directorName")}
            data-error={FORM_ERROR_MESSAGES.directorName}
            submitAttempted={submitAttempted}
          />
          <Select
            id="fiber-province"
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
            id="fiber-city"
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
            id="fiber-zip-code"
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
            id="fiber-detail-address"
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
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-body-b4 font-semibold text-black">Company Legality</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputDate
            id="fiber-company-establishment-date"
            label="Company Establishment Date"
            required
            value={form.companyEstablishmentDate}
            onChange={onChange("companyEstablishmentDate")}
            data-error={FORM_ERROR_MESSAGES.companyEstablishmentDate}
            submitAttempted={submitAttempted}
          />
          <InputDate
            id="fiber-company-operating-since"
            label="Company Operating since"
            required
            value={form.companyOperatingSince}
            onChange={onChange("companyOperatingSince")}
            data-error={FORM_ERROR_MESSAGES.companyOperatingSince}
            submitAttempted={submitAttempted}
          />
          <Input
            id="fiber-nib-company-number"
            label="NIB Company"
            type="number"
            required
            value={form.nibCompanyNumber}
            onChange={onChange("nibCompanyNumber")}
            data-error={FORM_ERROR_MESSAGES.nibCompanyNumber}
            submitAttempted={submitAttempted}
          />
          <Input
            id="fiber-npwp-company-number"
            label="No NPWP Company"
            type="number"
            required
            value={form.npwpCompanyNumber}
            onChange={onChange("npwpCompanyNumber")}
            data-error={FORM_ERROR_MESSAGES.npwpCompanyNumber}
            submitAttempted={submitAttempted}
          />
          <Input
            id="fiber-sppkp-company-number"
            label="Company SPPKP Number"
            type="number"
            required
            value={form.sppkpCompanyNumber}
            onChange={onChange("sppkpCompanyNumber")}
            data-error={FORM_ERROR_MESSAGES.sppkpCompanyNumber}
            submitAttempted={submitAttempted}
          />
          <Input
            id="fiber-license-permit-number"
            label="License Permit Number"
            type="number"
            required
            value={form.licensePermitNumber}
            onChange={onChange("licensePermitNumber")}
            data-error={FORM_ERROR_MESSAGES.licensePermitNumber}
            submitAttempted={submitAttempted}
          />
          <Input
            id="fiber-apjii-membership-number"
            label="APJII Membership Number"
            type="number"
            required
            value={form.apjiiMembershipNumber}
            onChange={onChange("apjiiMembershipNumber")}
            data-error={FORM_ERROR_MESSAGES.apjiiMembershipNumber}
            submitAttempted={submitAttempted}
          />
          <InputDate
            id="fiber-apjii-membership-active-date"
            label="APJII Membership Active Date"
            required
            value={form.apjiiMembershipActiveDate}
            onChange={onChange("apjiiMembershipActiveDate")}
            data-error={FORM_ERROR_MESSAGES.apjiiMembershipActiveDate}
            submitAttempted={submitAttempted}
          />
        </div>
      </section>
    </div>
  );
}

function Step3Body({
  form,
  onChange,
  onFileChange,
  onFileRemove,
  onCheckboxChange,
  errors,
  submitAttempted,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        id="fiber-employee-count"
        label="Number of employees"
        type="number"
        required
        value={form.employeeCount}
        onChange={onChange("employeeCount")}
        data-error={FORM_ERROR_MESSAGES.employeeCount}
        submitAttempted={submitAttempted}
      />
      <Input
        id="fiber-homepassed-count"
        label="Number of Existing Homepassed"
        type="number"
        required
        value={form.homepassedCount}
        onChange={onChange("homepassedCount")}
        data-error={FORM_ERROR_MESSAGES.homepassedCount}
        submitAttempted={submitAttempted}
      />
      <Input
        id="fiber-customer-count"
        label="Number of Existing Customers"
        type="number"
        required
        value={form.customerCount}
        onChange={onChange("customerCount")}
        data-error={FORM_ERROR_MESSAGES.customerCount}
        submitAttempted={submitAttempted}
      />
      <Input
        id="fiber-product-type-count"
        label="Types of products"
        type="number"
        required
        value={form.productTypeCount}
        onChange={onChange("productTypeCount")}
        data-error={FORM_ERROR_MESSAGES.productTypeCount}
        submitAttempted={submitAttempted}
      />
      <Textarea
        id="fiber-coverage-area"
        label="Coverage Area"
        required
        rows={4}
        className="md:col-span-2"
        helpText="Separate with comma (,)"
        value={form.coverageArea}
        onChange={onChange("coverageArea")}
        data-error={FORM_ERROR_MESSAGES.coverageArea}
        submitAttempted={submitAttempted}
      />
      <Textarea
        id="fiber-isp-infrastructure-coverage"
        label="ISP Infrastructure Coverage"
        required
        rows={4}
        className="md:col-span-2"
        helpText="Describe your current infrastructure coverage area."
        value={form.ispInfrastructureCoverage}
        onChange={onChange("ispInfrastructureCoverage")}
        data-error={FORM_ERROR_MESSAGES.ispInfrastructureCoverage}
        submitAttempted={submitAttempted}
      />
      <InputFile
        id="fiber-company-signature-file"
        label="Upload Signature with Company Stamp"
        required
        className="md:col-span-2"
        value={form.companySignatureFile}
        onChange={onFileChange("companySignatureFile")}
        onRemove={onFileRemove("companySignatureFile")}
        error={errors.companySignatureFile}
        data-error={FORM_ERROR_MESSAGES.companySignatureFile}
        submitAttempted={submitAttempted}
      />
      <hr className="border-0 border-t border-dotted border-neutral-200 md:col-span-2" style={{ borderTopWidth: 1 }} />
      <div className="md:col-span-2">
        <Checkbox
          variant="descriptive"
          id="fiber-utilization-confirmed"
          title="Utilization of Linknet Fiber Network Infrastructure"
          subtitle="Minimum 40.000 House Hold for Existing Foot Print Linknet Fiber, 80.000 House Hold for Areas outside Existing Foot Print"
          checked={form.utilizationConfirmed}
          onChange={onCheckboxChange("utilizationConfirmed")}
          label="Utilization of Linknet Fiber Network Infrastructure"
          required
          className="w-full"
          error={errors.utilizationConfirmed}
        />
      </div>
      <div className="md:col-span-2">
        <Checkbox
          variant="descriptive"
          id="fiber-wholesale-product-confirmed"
          title="Linknet Fiber Wholesale Product"
          subtitle="IP Transit, CDN, Data Center Service, Localized Content, Leased Capacity"
          checked={form.wholesaleProductConfirmed}
          onChange={onCheckboxChange("wholesaleProductConfirmed")}
          label="Linknet Fiber Wholesale Product"
          required
          className="w-full"
          error={errors.wholesaleProductConfirmed}
        />
      </div>
    </div>
  );
}

function Step4Body({ form, onFileChange, onFileRemove }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <InputFile
        id="fiber-npwp-company-file"
        label="NPWP Company"
        value={form.npwpCompanyFile}
        onChange={onFileChange("npwpCompanyFile")}
        onRemove={onFileRemove("npwpCompanyFile")}
      />
      <InputFile
        id="fiber-nib-company-file"
        label="NIB Company"
        value={form.nibCompanyFile}
        onChange={onFileChange("nibCompanyFile")}
        onRemove={onFileRemove("nibCompanyFile")}
      />
      <InputFile
        id="fiber-apjii-certificate-file"
        label="APJII Participation Certificate"
        value={form.apjiiCertificateFile}
        onChange={onFileChange("apjiiCertificateFile")}
        onRemove={onFileRemove("apjiiCertificateFile")}
      />
      <InputFile
        id="fiber-linknet-product-statement-file"
        label="Written statement of the Linknet product to be selected"
        value={form.linknetProductStatementFile}
        onChange={onFileChange("linknetProductStatementFile")}
        onRemove={onFileRemove("linknetProductStatementFile")}
      />
      <InputFile
        id="fiber-previous-year-financial-report-file"
        label="Previous Year Financial Report (Company)"
        value={form.previousYearFinancialReportFile}
        onChange={onFileChange("previousYearFinancialReportFile")}
        onRemove={onFileRemove("previousYearFinancialReportFile")}
      />
      <InputFile
        id="fiber-company-deed-file"
        label="Company Deed of Establishment and Company Decree"
        value={form.companyDeedFile}
        onChange={onFileChange("companyDeedFile")}
        onRemove={onFileRemove("companyDeedFile")}
      />
      <InputFile
        id="fiber-deed-amendment-file"
        label="Deed of Amendment and Company Decree"
        value={form.deedAmendmentFile}
        onChange={onFileChange("deedAmendmentFile")}
        onRemove={onFileRemove("deedAmendmentFile")}
      />
      <InputFile
        id="fiber-corporate-tax-report-file"
        label="Corporate Tax Report"
        value={form.corporateTaxReportFile}
        onChange={onFileChange("corporateTaxReportFile")}
        onRemove={onFileRemove("corporateTaxReportFile")}
      />
    </div>
  );
}

function Step5Body() {
  return (
    <div className="space-y-4">
      <div className="mb-1 text-center text-body-b5 leading-relaxed text-black">
        By submitting this form, you agree to our&nbsp;<a href="/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a>&nbsp;and&nbsp;
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.
      </div>
    </div>
  );
}

function RegistrationFiberFormContent({ onClose }) {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'id';

  const { submit } = useFormSubmission('fiber', 'fiber-registration');

  const handleActualSubmit = useCallback(
    async (form) => {
      const fileFields = [...OPTIONAL_FILE_FIELDS, 'companySignatureFile'];
      const files = fileFields
        .filter((key) => form[key])
        .map((key) => ({ fieldPath: key, originalName: form[key]?.name }));
      return submit({
        locale,
        sourcePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
        values: Object.fromEntries(
          Object.entries(form).filter(([k]) => !fileFields.includes(k)),
        ),
        groups: [],
        files,
      });
    },
    [locale, submit],
  );

  const {
    currentStep,
    form,
    submitted,
    submitAttempted,
    stepErrors,
    navDirection,
    handleFieldChange,
    handleFileChange,
    handleFileRemove,
    handleCheckboxChange,
    handleConfirm,
    handleBack,
    handleChangeStep,
    isSubmitting,
    submitError,
  } = useRegistrationFiberFormState(handleActualSubmit);

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
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
            onCheckboxChange={handleCheckboxChange}
            errors={stepErrors}
            submitAttempted={submitAttempted}
          />
        );
      case 4:
        return (
          <Step4Body
            form={form}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
          />
        );
      case 5:
        return <Step5Body />;
      default:
        return null;
    }
  }, [
    form,
    handleFieldChange,
    handleFileChange,
    handleFileRemove,
    handleCheckboxChange,
    stepErrors,
    submitAttempted,
  ]);

  const footerSlot = useMemo(() => (
    <div className={`flex w-full ${currentStep === 5 ? "" : "justify-end"}`}>
      <Button
        type="button"
        variant="warning"
        onClick={handleConfirm}
        className={currentStep === 5 ? "w-full" : ""}
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
      className="lnFormRegistrationFiber"
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

function ModalFormRegistrationFiber({ onAfterClose }) {
  const { overlayRef, panelRef, animateOut } = useModalAnimation(onAfterClose);

  useBodyScrollLock();
  useEscapeKey(animateOut);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Fiber registration form"
      className="fixed inset-0 z-100 bg-black/40"
      suppressHydrationWarning
    >
      <div
        ref={panelRef}
        className="lnModalForm__panel absolute inset-0 overflow-y-auto bg-white will-change-transform"
        suppressHydrationWarning
      >
        <RegistrationFiberFormContent onClose={animateOut} />
      </div>
    </div>
  );
}

export default function ModalFormRegistrationFiberProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasMounted = useHasMounted();

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <ModalFormRegistrationFiberContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasMounted && isOpen ? (
        <ModalFormRegistrationFiber onAfterClose={closeModal} />
      ) : null}
    </ModalFormRegistrationFiberContext.Provider>
  );
}
