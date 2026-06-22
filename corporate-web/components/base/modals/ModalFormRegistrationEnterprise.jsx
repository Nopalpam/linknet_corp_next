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
import gsap from 'gsap';
import FormStepper, { FormStep } from '../forms/FormStepper';
import Input from '../forms/Input';
import Select from '../forms/Select';
import SelectMultiple from '../forms/SelectMultiple';
import Textarea from '../forms/Textarea';
import Checkbox from '../forms/Checkbox';
import FieldReadOnly from '../forms/FieldReadOnly';
import Button from '../Button';
import { useFormModule } from '@/components/hooks/useFormModule';
import useIndonesiaLocationOptions from '@/components/hooks/useIndonesiaLocationOptions';
import { buildRedirectUrl, submitEnterpriseForm } from '@/lib/formsApi';

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ModalFormRegistrationEnterpriseContext = createContext({
  openModal: () => {},
  closeModal: () => {},
});

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MODAL_ANIMATION = {
  duration: 0.45,
  enterEase: 'power3.out',
  exitEase: 'power3.in',
};

const TOTAL_STEPS = 4;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9,}$/;

// ── Hardcoded fallbacks (used when API options are unavailable) ──────────────

const DEPARTMENT_OPTIONS = [
  'IT/ Network',
  'Management',
  'Supply Chain Management/ Procurement/ GA',
  'Other',
].map((option) => ({ label: option, value: option }));

const ROLE_OPTIONS = [
  'CEO',
  'CTO/Technical Director',
  'Engineering/Technical Officer',
  'IT Head/IT Manager/IT Staff',
  'Kepala Yayasan/Wakil',
  'Marketing Director/Manager',
  'Procurement/SCM',
  'Rektor/Kepala Sekolah/Wakil',
  'Sales Director/Manager',
  'Tim IT/Administrasi',
].map((option) => ({ label: option, value: option }));

const INDUSTRY_OPTIONS = [
  'Agriculture, Forestry, Fishing',
  'Entertainment, Media & Advertising',
  'Financial Service Institutions',
  'Food & Beverage',
  'General Services',
  'Government & Affairs',
  'Holding Company',
  'Hospitality Services',
  'IT & Telecommunication',
  'Manufacturing',
  'Mining and Oil & Gas',
  'Property & Construction',
  'Retail Trade',
  'Services',
  'Transportation & Public Utilities',
].map((option) => ({ label: option, value: option }));

const SOLUTION_OPTIONS = [
  'Cloud',
  'Corporate TV',
  'Data Center',
  'Data Communication',
  'Internet',
  'IOT',
  'Managed Service',
  'Penetration Test',
  'SD-WAN',
  'Voice',
  'VSAT',
].map((option) => ({ label: option, value: option }));

const TIMELINE_OPTIONS = ['Planned Project', 'Urgent/ Unplanned'].map((option) => ({
  label: option,
  value: option,
}));

const NEED_OPTIONS = [
  'Billing/ Subscription/ Contract',
  'Contact Sales Person',
  'Customer Care',
  'Sales/ Product',
].map((option) => ({ label: option, value: option }));

const PROCUREMENT_OPTIONS = ['Direct', 'Short listed', 'Tender'].map((option) => ({
  label: option,
  value: option,
}));

const BUSINESS_CHALLENGE_OPTIONS = [
  'Adjust the digital transformation',
  'Business Process Automation',
  'Changing and uncertain business environment',
  'Customer Engagement',
  'Data Security and Privacy',
].map((option) => ({ label: option, value: option }));

const STEP_META = [
  {
    step: 1,
    step_name: 'Need & Personal',
    step_title: 'Need & Personal Details',
    step_description:
      'Share your contact details so our team can tailor the consultation to the right stakeholder.',
    actionLabel: 'Next',
  },
  {
    step: 2,
    step_name: 'Company',
    step_title: 'Company Details',
    step_description:
      'Tell us where your company operates so we can match coverage and commercial readiness.',
    actionLabel: 'Next',
  },
  {
    step: 3,
    step_name: 'Business Needs',
    step_title: 'Business Needs',
    step_description:
      'Outline the solutions and business challenges you want our enterprise team to address.',
    actionLabel: 'Review',
  },
  {
    step: 4,
    step_name: 'Review',
    step_title: '',
    step_description: '',
    actionLabel: 'Confirm & Submit',
  },
];

const FORM_ERROR_MESSAGES = {
  FirstName: 'First Name is required.',
  LastName: 'Last Name is required.',
  Email: 'Company Email is required.',
  EmailFormat: 'Company Email format is invalid.',
  MobilePhone: 'Phone Number is required.',
  MobilePhoneFormat: 'Phone Number format is invalid.',
  Department__c: 'Your Department is required.',
  Job_Level__c: 'Your Role / Title is required.',
  Company: 'Company Name is required.',
  Business_Industry__c: 'Business Industry is required.',
  Province__c: 'Province is required.',
  City__c: 'City is required.',
  Kecamatan_Zipcode__c: 'Ward / ZIP Code is required.',
  Building_Name__c: 'Detail Address is required.',
  Solution__c: 'Please choose at least one solution.',
  Timeline__c: 'Timeline is required.',
  Choose_your_Needs__c: 'Choose Needs is required.',
  Procurement_Method__c: 'Procurement Method is required.',
  Specific_Needs__c: 'Specific Needs is required.',
  Business_Objective__c: 'Please select at least one business challenge.',
};

const INITIAL_MODAL_PAYLOAD = {
  Promo_Website__c: 'Enterprise Consultation',
  Page_Website__c: '/enterprise/form',
  Source_Website__c: 'Enterprise Website',
};

const INITIAL_FORM = {
  FirstName: '',
  LastName: '',
  Email: '',
  MobilePhone: '',
  Department__c: '',
  Job_Level__c: '',
  Company: '',
  Business_Industry__c: '',
  Province__c: '',
  City__c: '',
  Kecamatan_Zipcode__c: '',
  Building_Name__c: '',
  Solution__c: [],
  Timeline__c: '',
  Choose_your_Needs__c: '',
  Procurement_Method__c: '',
  Specific_Needs__c: '',
  Business_Objective__c: [],
  Web_to_Lead__c: true,
  Promo_Website__c: INITIAL_MODAL_PAYLOAD.Promo_Website__c,
  Page_Website__c: INITIAL_MODAL_PAYLOAD.Page_Website__c,
  Source_Website__c: INITIAL_MODAL_PAYLOAD.Source_Website__c,
  LeadSource: 'Website',
  I_am_an_existing_Link_Net_Customer__c: false,
};

function createInitialForm(overrides = {}) {
  return {
    ...INITIAL_FORM,
    ...(overrides.Promo_Website__c ? { Promo_Website__c: overrides.Promo_Website__c } : {}),
    ...(overrides.Page_Website__c ? { Page_Website__c: overrides.Page_Website__c } : {}),
    ...(overrides.Source_Website__c ? { Source_Website__c: overrides.Source_Website__c } : {}),
  };
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

// ─────────────────────────────────────────────────────────────────────────────
// Helper: step summary items
// ─────────────────────────────────────────────────────────────────────────────

function getStepSummaryItems(step, form) {
  switch (step) {
    case 1:
      return [
        { label: 'First Name', value: form.FirstName },
        { label: 'Last Name', value: form.LastName },
        { label: 'Company Email', value: form.Email },
        { label: 'Phone Number', value: form.MobilePhone },
        { label: 'Your Department', value: form.Department__c },
        { label: 'Your Role / Title', value: form.Job_Level__c },
      ];
    case 2:
      return [
        { label: 'Company Name', value: form.Company },
        { label: 'Business Industry', value: form.Business_Industry__c },
        { label: 'Province', value: form.Province__c },
        { label: 'City', value: form.City__c },
        { label: 'Ward / ZIP Code', value: form.Kecamatan_Zipcode__c },
        { label: 'Detail Address', value: form.Building_Name__c, className: 'md:col-span-2' },
      ];
    case 3:
      return [
        { label: 'Solutions', value: form.Solution__c.join(', '), className: 'md:col-span-2' },
        { label: 'Timeline', value: form.Timeline__c },
        { label: 'Choose Needs', value: form.Choose_your_Needs__c },
        { label: 'Procurement Method', value: form.Procurement_Method__c },
        { label: 'Specific Needs', value: form.Specific_Needs__c, className: 'md:col-span-2' },
        {
          label: 'Business Challenge',
          value: form.Business_Objective__c.join(', '),
          className: 'md:col-span-2',
        },
      ];
    default:
      return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateStep1(form) {
  const errors = {};

  if (!form.FirstName.trim()) errors.FirstName = FORM_ERROR_MESSAGES.FirstName;
  if (!form.LastName.trim()) errors.LastName = FORM_ERROR_MESSAGES.LastName;

  if (!form.Email.trim()) {
    errors.Email = FORM_ERROR_MESSAGES.Email;
  } else if (!EMAIL_REGEX.test(form.Email)) {
    errors.Email = FORM_ERROR_MESSAGES.EmailFormat;
  }

  if (!form.MobilePhone.trim()) {
    errors.MobilePhone = FORM_ERROR_MESSAGES.MobilePhone;
  } else if (!PHONE_REGEX.test(String(form.MobilePhone).replace(/\D+/g, ''))) {
    errors.MobilePhone = FORM_ERROR_MESSAGES.MobilePhoneFormat;
  }

  if (!form.Department__c.trim()) errors.Department__c = FORM_ERROR_MESSAGES.Department__c;
  if (!form.Job_Level__c.trim()) errors.Job_Level__c = FORM_ERROR_MESSAGES.Job_Level__c;

  return errors;
}

function validateStep2(form) {
  return [
    ['Company', FORM_ERROR_MESSAGES.Company],
    ['Business_Industry__c', FORM_ERROR_MESSAGES.Business_Industry__c],
    ['Province__c', FORM_ERROR_MESSAGES.Province__c],
    ['City__c', FORM_ERROR_MESSAGES.City__c],
    ['Kecamatan_Zipcode__c', FORM_ERROR_MESSAGES.Kecamatan_Zipcode__c],
    ['Building_Name__c', FORM_ERROR_MESSAGES.Building_Name__c],
  ].reduce((result, [field, message]) => {
    if (!String(form[field] || '').trim()) result[field] = message;
    return result;
  }, {});
}

function validateStep3(form) {
  const errors = [
    ['Timeline__c', FORM_ERROR_MESSAGES.Timeline__c],
    ['Choose_your_Needs__c', FORM_ERROR_MESSAGES.Choose_your_Needs__c],
    ['Procurement_Method__c', FORM_ERROR_MESSAGES.Procurement_Method__c],
    ['Specific_Needs__c', FORM_ERROR_MESSAGES.Specific_Needs__c],
  ].reduce((result, [field, message]) => {
    if (!String(form[field] || '').trim()) result[field] = message;
    return result;
  }, {});

  if (!Array.isArray(form.Solution__c) || form.Solution__c.length === 0) {
    errors.Solution__c = FORM_ERROR_MESSAGES.Solution__c;
  }
  if (!Array.isArray(form.Business_Objective__c) || form.Business_Objective__c.length === 0) {
    errors.Business_Objective__c = FORM_ERROR_MESSAGES.Business_Objective__c;
  }

  return errors;
}

function validateStep(step, form) {
  switch (step) {
    case 1: return validateStep1(form);
    case 2: return validateStep2(form);
    case 3: return validateStep3(form);
    case 4: return { ...validateStep1(form), ...validateStep2(form), ...validateStep3(form) };
    default: return {};
  }
}

function getStepStatus(stepNumber, currentStep) {
  if (stepNumber < currentStep) return 'finish';
  if (stepNumber === currentStep) return 'active';
  return 'disabled';
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal utility hooks
// ─────────────────────────────────────────────────────────────────────────────

function useBodyScrollLock() {
  useEffect(() => {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';

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

  return { overlayRef, panelRef, animateOut };
}

function useEscapeKey(handler) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handler();
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

// ─────────────────────────────────────────────────────────────────────────────
// Form state hook (integrated with API submission)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} initialPayload - Promo/Page/Source_Website__c overrides
 * @param {(form: object) => Promise<object>} onSubmitAsync - Called on final step confirm
 */
function useRegistrationFormState(initialPayload = INITIAL_MODAL_PAYLOAD, onSubmitAsync) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(() => createInitialForm(initialPayload));
  const [submitted, setSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [navDirection, setNavDirection] = useState('forward');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Keep onSubmitAsync stable without adding it to useCallback deps
  const onSubmitAsyncRef = useRef(onSubmitAsync);
  useEffect(() => {
    onSubmitAsyncRef.current = onSubmitAsync;
  }, [onSubmitAsync]);

  const clearError = useCallback((field) => {
    setStepErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const updateForm = useCallback((patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleFieldChange = useCallback(
    (field) => (event) => {
      const nextValue = event.target.value;

      if (field === 'Province__c') {
        updateForm({ Province__c: nextValue, City__c: '', Kecamatan_Zipcode__c: '' });
        clearError('Province__c');
        clearError('City__c');
        clearError('Kecamatan_Zipcode__c');
        return;
      }

      if (field === 'City__c') {
        updateForm({ City__c: nextValue, Kecamatan_Zipcode__c: '' });
        clearError('City__c');
        clearError('Kecamatan_Zipcode__c');
        return;
      }

      updateForm({ [field]: nextValue });
      clearError(field);
    },
    [clearError, updateForm],
  );

  const handleMultiSelectChange = useCallback(
    (field) => (event) => {
      updateForm({ [field]: event.target.value });
      clearError(field);
    },
    [clearError, updateForm],
  );

  const handleCheckboxGroupChange = useCallback(
    (field, value) => (event) => {
      setForm((prev) => {
        const current = Array.isArray(prev[field]) ? prev[field] : [];
        const next = event.target.checked
          ? [...current, value]
          : current.filter((item) => item !== value);
        return { ...prev, [field]: next };
      });
      clearError(field);
    },
    [clearError],
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
    setNavDirection('forward');

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Final step — call the API
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmitAsyncRef.current(form);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, form]);

  const handleChangeStep = useCallback(
    (step) => {
      setSubmitAttempted(false);
      setStepErrors({});
      setNavDirection(step < currentStep ? 'backward' : 'forward');
      setCurrentStep(step);
    },
    [currentStep],
  );

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setForm(createInitialForm(initialPayload));
    setSubmitted(false);
    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection('forward');
    setIsSubmitting(false);
    setSubmitError(null);
  }, [initialPayload]);

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
    handleCheckboxGroupChange,
    handleConfirm,
    handleChangeStep,
    handleReset,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public hook for consumers
// ─────────────────────────────────────────────────────────────────────────────

export function useModalFormRegistrationEnterprise() {
  return useContext(ModalFormRegistrationEnterpriseContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step summary display
// ─────────────────────────────────────────────────────────────────────────────

function StepSummary({ items, className = 'grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2' }) {
  return (
    <div className={className}>
      {items.map(({ label, value, className: itemClassName, required = true }) => (
        <FieldReadOnly
          key={label}
          label={label}
          value={value}
          required={required}
          className={itemClassName || ''}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step body components
// ─────────────────────────────────────────────────────────────────────────────

function Step1Body({ form, onChange, submitAttempted, departmentOptions, roleOptions }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        id="lnForm_FirstName"
        name="FirstName"
        label="First Name"
        required
        value={form.FirstName}
        onChange={onChange('FirstName')}
        data-error={FORM_ERROR_MESSAGES.FirstName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="lnForm_LastName"
        name="LastName"
        label="Last Name"
        required
        value={form.LastName}
        onChange={onChange('LastName')}
        data-error={FORM_ERROR_MESSAGES.LastName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="lnForm_Email"
        name="Email"
        label="Company Email"
        type="email"
        required
        value={form.Email}
        onChange={onChange('Email')}
        data-error={FORM_ERROR_MESSAGES.Email}
        data-error-email={FORM_ERROR_MESSAGES.EmailFormat}
        submitAttempted={submitAttempted}
      />
      <Input
        id="lnForm_MobilePhone"
        name="MobilePhone"
        label="Phone Number"
        type="tel"
        inputMode="numeric"
        required
        value={form.MobilePhone}
        onChange={onChange('MobilePhone')}
        data-error={FORM_ERROR_MESSAGES.MobilePhone}
        data-error-phone={FORM_ERROR_MESSAGES.MobilePhoneFormat}
        submitAttempted={submitAttempted}
      />
      <Select
        id="lnForm_Department__c"
        name="Department__c"
        label="Your Department"
        required
        placeholder="Select department"
        options={departmentOptions}
        value={form.Department__c}
        onChange={onChange('Department__c')}
        data-error={FORM_ERROR_MESSAGES.Department__c}
        submitAttempted={submitAttempted}
      />
      <Select
        id="lnForm_Job_Level__c"
        name="Job_Level__c"
        label="Your Role / Title"
        required
        placeholder="Select role / title"
        options={roleOptions}
        value={form.Job_Level__c}
        onChange={onChange('Job_Level__c')}
        data-error={FORM_ERROR_MESSAGES.Job_Level__c}
        submitAttempted={submitAttempted}
      />
    </div>
  );
}

function Step2Body({ form, onChange, submitAttempted, industryOptions }) {
  const {
    cityOptions,
    normalizedCity,
    normalizedProvince,
    provinceOptions,
  } = useIndonesiaLocationOptions({
    city: form.City__c,
    finalLevel: 'none',
    province: form.Province__c,
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        id="lnForm_Company"
        name="Company"
        label="Company Name"
        required
        value={form.Company}
        onChange={onChange('Company')}
        data-error={FORM_ERROR_MESSAGES.Company}
        submitAttempted={submitAttempted}
      />
      <Select
        id="lnForm_Business_Industry__c"
        name="Business_Industry__c"
        label="Business Industry"
        required
        placeholder="Select business industry"
        options={industryOptions}
        value={form.Business_Industry__c}
        onChange={onChange('Business_Industry__c')}
        data-error={FORM_ERROR_MESSAGES.Business_Industry__c}
        submitAttempted={submitAttempted}
      />
      <Select
        id="lnForm_Province__c"
        name="Province__c"
        label="Province"
        required
        placeholder="Select province"
        options={provinceOptions}
        value={normalizedProvince}
        onChange={onChange('Province__c')}
        data-error={FORM_ERROR_MESSAGES.Province__c}
        submitAttempted={submitAttempted}
      />
      <Select
        id="lnForm_City__c"
        name="City__c"
        label="City"
        required
        placeholder="Select city"
        options={cityOptions}
        value={normalizedCity}
        onChange={onChange('City__c')}
        data-error={FORM_ERROR_MESSAGES.City__c}
        submitAttempted={submitAttempted}
        disabled={!normalizedProvince}
      />
      <Input
        id="lnForm_Kecamatan_Zipcode__c"
        name="Kecamatan_Zipcode__c"
        label="Ward/ZIP Code"
        required
        type="text"
        placeholder="Enter ward / ZIP code"
        value={form.Kecamatan_Zipcode__c}
        onChange={onChange('Kecamatan_Zipcode__c')}
        data-error={FORM_ERROR_MESSAGES.Kecamatan_Zipcode__c}
        submitAttempted={submitAttempted}
        disabled={!normalizedCity}
      />
      <div className="hidden md:block" />
      <Textarea
        id="lnForm_Building_Name__c"
        name="Building_Name__c"
        label="Detail Address"
        required
        rows={4}
        className="md:col-span-2"
        value={form.Building_Name__c}
        onChange={onChange('Building_Name__c')}
        data-error={FORM_ERROR_MESSAGES.Building_Name__c}
        submitAttempted={submitAttempted}
      />
    </div>
  );
}

function BusinessChallengeGroup({ values, onChange, error, submitAttempted, options }) {
  const isInvalid = !!error && submitAttempted;

  return (
    <div className="space-y-3 md:col-span-2">
      <p className="text-body-b4 font-semibold leading-relaxed text-black">
        What is the key business challenge that you hope to solve with this solution?
        <span className="ml-0.5 text-danger">*</span>
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {options.map((opt) => (
          <Checkbox
            key={opt.value}
            id={`lnForm_Business_Objective__c_${opt.value.replace(/[^a-zA-Z0-9]+/g, '-')}`}
            name="Business_Objective__c"
            label={opt.label}
            value={opt.value}
            checked={values.includes(opt.value)}
            onChange={onChange(opt.value)}
            className=""
          />
        ))}
      </div>
      {isInvalid && (
        <small className="block text-body-b5 text-red-500">{error}</small>
      )}
    </div>
  );
}

function Step3Body({
  form,
  onChange,
  onMultiSelectChange,
  onBusinessObjectiveChange,
  stepErrors,
  submitAttempted,
  solutionOptions,
  timelineOptions,
  needOptions,
  procurementOptions,
  businessChallengeOptions,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SelectMultiple
          id="lnForm_Solution__c"
          name="Solution__c"
          label="Solutions"
          required
          className="md:col-span-2"
          placeholder="Select one or more solutions"
          options={solutionOptions}
          value={form.Solution__c}
          onChange={onMultiSelectChange('Solution__c')}
          error={stepErrors.Solution__c}
          data-error={FORM_ERROR_MESSAGES.Solution__c}
          submitAttempted={submitAttempted}
        />
      </div>

      <hr
        className="border-0 border-t border-dotted border-neutral-200"
        style={{ borderTopWidth: 1 }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          id="lnForm_Timeline__c"
          name="Timeline__c"
          label="Timeline"
          required
          placeholder="Select timeline"
          options={timelineOptions}
          value={form.Timeline__c}
          onChange={onChange('Timeline__c')}
          data-error={FORM_ERROR_MESSAGES.Timeline__c}
          submitAttempted={submitAttempted}
        />
        <Select
          id="lnForm_Choose_your_Needs__c"
          name="Choose_your_Needs__c"
          label="Choose Needs"
          required
          placeholder="Select your need"
          options={needOptions}
          value={form.Choose_your_Needs__c}
          onChange={onChange('Choose_your_Needs__c')}
          data-error={FORM_ERROR_MESSAGES.Choose_your_Needs__c}
          submitAttempted={submitAttempted}
        />
        <Select
          id="lnForm_Procurement_Method__c"
          name="Procurement_Method__c"
          label="Procurement Method"
          required
          placeholder="Select procurement method"
          options={procurementOptions}
          value={form.Procurement_Method__c}
          onChange={onChange('Procurement_Method__c')}
          data-error={FORM_ERROR_MESSAGES.Procurement_Method__c}
          submitAttempted={submitAttempted}
        />
        <div className="hidden md:block" />
        <Textarea
          id="lnForm_Specific_Needs__c"
          name="Specific_Needs__c"
          label="Specific Needs"
          required
          rows={4}
          className="md:col-span-2"
          value={form.Specific_Needs__c}
          onChange={onChange('Specific_Needs__c')}
          data-error={FORM_ERROR_MESSAGES.Specific_Needs__c}
          submitAttempted={submitAttempted}
        />
      </div>

      <hr
        className="border-0 border-t border-dotted border-neutral-200"
        style={{ borderTopWidth: 1 }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BusinessChallengeGroup
          values={form.Business_Objective__c}
          onChange={onBusinessObjectiveChange}
          error={stepErrors.Business_Objective__c}
          submitAttempted={submitAttempted}
          options={businessChallengeOptions}
        />
      </div>
    </div>
  );
}

function Step4Body({ form, submitError }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[20px] mb-1 text-center text-body-b5 leading-relaxed text-black">
        By submitting this form, you agree to our&nbsp;
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline">
          Terms of Service
        </a>
        &nbsp;and&nbsp;
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
          Privacy Policy
        </a>
        .
      </div>
      {submitError && (
        <p className="text-center text-body-b5 text-red-500" role="alert">
          {submitError}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main form content (API integration lives here)
// ─────────────────────────────────────────────────────────────────────────────

function RegistrationFormContent({ onClose, initialPayload }) {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'id';

  // Fetch form definition (dynamic options)
  const { fieldOptions } = useFormModule('enterprise', 'enterprise-consultation');

  const [submitResult, setSubmitResult] = useState(null);

  // Merge API options with hardcoded fallbacks
  const resolvedOptions = useMemo(
    () => ({
      Department__c:
        fieldOptions.Department__c?.length ? fieldOptions.Department__c : DEPARTMENT_OPTIONS,
      Job_Level__c:
        fieldOptions.Job_Level__c?.length ? fieldOptions.Job_Level__c : ROLE_OPTIONS,
      Business_Industry__c:
        fieldOptions.Business_Industry__c?.length
          ? fieldOptions.Business_Industry__c
          : INDUSTRY_OPTIONS,
      Solution__c:
        fieldOptions.Solution__c?.length ? fieldOptions.Solution__c : SOLUTION_OPTIONS,
      Timeline__c:
        fieldOptions.Timeline__c?.length ? fieldOptions.Timeline__c : TIMELINE_OPTIONS,
      Choose_your_Needs__c:
        fieldOptions.Choose_your_Needs__c?.length
          ? fieldOptions.Choose_your_Needs__c
          : NEED_OPTIONS,
      Procurement_Method__c:
        fieldOptions.Procurement_Method__c?.length
          ? fieldOptions.Procurement_Method__c
          : PROCUREMENT_OPTIONS,
      Business_Objective__c:
        fieldOptions.Business_Objective__c?.length
          ? fieldOptions.Business_Objective__c
          : BUSINESS_CHALLENGE_OPTIONS,
    }),
    [fieldOptions],
  );

  // Wrap submit in form-compatible callback
  const handleActualSubmit = useCallback(
    async (form) => {
      const result = await submitEnterpriseForm('enterprise_consultation', {
        locale,
        fields: form,
        context: resolveSubmissionContext(initialPayload),
        groups: [],
        files: [],
      });

      setSubmitResult(result);
      return result;
    },
    [initialPayload, locale],
  );

  const {
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
    handleCheckboxGroupChange,
    handleConfirm,
    handleChangeStep,
    handleReset,
  } = useRegistrationFormState(initialPayload, handleActualSubmit);

  // Redirect after successful submission
  useEffect(() => {
    if (!submitted) return;

    const response = submitResult?.response;
    const redirectUrl =
      buildRedirectUrl(response) ||
      `/${locale}/enterprise/form/success?name=${encodeURIComponent(
        (form.FirstName || '').trim() || 'there',
      )}`;

    onClose();
    handleReset();
    router.push(redirectUrl);
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderStepBody = (stepStatus, step) => {
    if (stepStatus !== 'active') {
      switch (step) {
        case 1:
        case 2:
        case 3:
          return <StepSummary items={getStepSummaryItems(step, form)} />;
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
            submitAttempted={submitAttempted}
            departmentOptions={resolvedOptions.Department__c}
            roleOptions={resolvedOptions.Job_Level__c}
          />
        );
      case 2:
        return (
          <Step2Body
            form={form}
            onChange={handleFieldChange}
            submitAttempted={submitAttempted}
            industryOptions={resolvedOptions.Business_Industry__c}
          />
        );
      case 3:
        return (
          <Step3Body
            form={form}
            onChange={handleFieldChange}
            onMultiSelectChange={handleMultiSelectChange}
            onBusinessObjectiveChange={(value) =>
              handleCheckboxGroupChange('Business_Objective__c', value)
            }
            stepErrors={stepErrors}
            submitAttempted={submitAttempted}
            solutionOptions={resolvedOptions.Solution__c}
            timelineOptions={resolvedOptions.Timeline__c}
            needOptions={resolvedOptions.Choose_your_Needs__c}
            procurementOptions={resolvedOptions.Procurement_Method__c}
            businessChallengeOptions={resolvedOptions.Business_Objective__c}
          />
        );
      case 4:
        return <Step4Body form={form} submitError={submitError} />;
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
      title="Schedule a Consultation with our Expert Team"
      subtitle="Complete the enterprise consultation form below. Every field is required so our team can review your needs properly and follow up with the right recommendation."
      className="lnFormRegistration lnFormRegistrationEnterprise"
    >
      {STEP_META.map((stepMeta) => {
        const stepStatus = getStepStatus(stepMeta.step, currentStep);
        const isLastStep = stepMeta.step === TOTAL_STEPS;

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
                disabled={isLastStep && isSubmitting}
                className={isLastStep ? 'w-full' : ''}
              >
                {isLastStep && isSubmitting ? 'Submitting...' : stepMeta.actionLabel}
              </Button>
            }
          />
        );
      })}
    </FormStepper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal wrapper
// ─────────────────────────────────────────────────────────────────────────────

function ModalFormRegistrationEnterprise({ onAfterClose, initialPayload }) {
  const { overlayRef, panelRef, animateOut } = useModalAnimation(onAfterClose);

  useBodyScrollLock();
  useEscapeKey(animateOut);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Enterprise consultation registration form"
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

// ─────────────────────────────────────────────────────────────────────────────
// Provider (default export)
// ─────────────────────────────────────────────────────────────────────────────

export default function ModalFormRegistrationEnterpriseProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState(INITIAL_MODAL_PAYLOAD);
  const hasMounted = useHasMounted();

  const openModal = useCallback((payload = {}) => {
    setModalPayload({
      Product: payload.Product,
      Promo_Website__c: payload.Promo_Website__c || INITIAL_MODAL_PAYLOAD.Promo_Website__c,
      Page_Website__c: payload.Page_Website__c || INITIAL_MODAL_PAYLOAD.Page_Website__c,
      Source_Website__c: payload.Source_Website__c || INITIAL_MODAL_PAYLOAD.Source_Website__c,
      context: payload.context,
    });
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalPayload(INITIAL_MODAL_PAYLOAD);
  }, []);

  return (
    <ModalFormRegistrationEnterpriseContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasMounted && isOpen && (
        <ModalFormRegistrationEnterprise
          onAfterClose={closeModal}
          initialPayload={modalPayload}
        />
      )}
    </ModalFormRegistrationEnterpriseContext.Provider>
  );
}
