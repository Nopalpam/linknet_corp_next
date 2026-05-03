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
import gsap from 'gsap';
import { useParams, useRouter } from 'next/navigation';
import Button from '../Button';
import Icon from '../Icon';
import Input from '../forms/Input';
import Modal from '../Modal';
import Select from '../forms/Select';
import Textarea from '../forms/Textarea';
import FormStepperModal from '../forms/FormStepperModal';
import useIndonesiaLocationOptions from '@/components/hooks/useIndonesiaLocationOptions';
import { submitEnterpriseForm } from '@/lib/formsApi';
import { createEventRegistration } from '@/lib/eventsApi';

const ModalFormEventRegisterContext = createContext({
  openModal: () => {},
  closeModal: () => {},
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9,}$/;
const MAX_PARTICIPANTS = 5;

const PARTICIPANT_OPTIONS = Array.from({ length: MAX_PARTICIPANTS }, (_, index) => {
  const peopleCount = index + 1;

  return {
    label: `${peopleCount} People`,
    value: String(peopleCount),
  };
});

const DEPARTMENT_OPTIONS = [
  'IT/ Network',
  'Management',
  'Supply Chain Management/ Procurement/ GA',
  'Other',
].map((option) => ({
  label: option,
  value: option,
}));

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
].map((option) => ({
  label: option,
  value: option,
}));

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
].map((option) => ({
  label: option,
  value: option,
}));

const FORM_ERROR_MESSAGES = {
  participantCount: 'Jumlah Peserta is required.',
  firstName: 'First Name is required.',
  lastName: 'Last Name is required.',
  companyEmail: 'Company Email is required.',
  companyEmailFormat: 'Company Email format is invalid.',
  phoneNumber: 'Phone Number is required.',
  phoneNumberFormat: 'Phone Number format is invalid.',
  department: 'Your Department is required.',
  roleTitle: 'Your Role / Title is required.',
  companyName: 'Company Name is required.',
  businessIndustry: 'Business Industry is required.',
  province: 'Province is required.',
  city: 'City is required.',
  wardZipCode: 'Ward / ZIP Code is required.',
  detailAddress: 'Detail Address is required.',
};

const INITIAL_MODAL_PAYLOAD = {
  Promo_Website__c: 'Event Registration',
  Page_Website__c: '/event',
  Source_Website__c: 'Event Website',
  eventName: '',
  maxParticipants: MAX_PARTICIPANTS,
  businessUnit: 'enterprise',
};

function normalizeMaxParticipants(value) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return MAX_PARTICIPANTS;
  }

  return Math.min(MAX_PARTICIPANTS, Math.max(1, Math.floor(parsedValue)));
}

function getStepMeta(maxParticipants) {
  const steps = [
    {
      id: 'company',
      label: 'Company',
      actionLabel: 'Continue',
    },
    {
      id: 'participant',
      label: 'Participant',
      actionLabel: 'Register',
    },
  ];

  return steps.map((step, index) => ({
    ...step,
    step: index + 1,
  }));
}

function createParticipant() {
  return {
    firstName: '',
    lastName: '',
    companyEmail: '',
    phoneNumber: '',
    department: '',
    roleTitle: '',
  };
}

function createParticipants() {
  return Array.from({ length: MAX_PARTICIPANTS }, () => createParticipant());
}

function createInitialForm(payload = INITIAL_MODAL_PAYLOAD) {
  const maxParticipants = normalizeMaxParticipants(payload.maxParticipants);

  return {
    participantCount: maxParticipants === 1 ? '1' : '',
    participants: createParticipants(),
    companyName: '',
    businessIndustry: '',
    province: '',
    city: '',
    wardZipCode: '',
    detailAddress: '',
    eventName: payload.eventName || '',
    maxParticipants,
    Web_to_Lead__c: true,
    Promo_Website__c: payload.Promo_Website__c || INITIAL_MODAL_PAYLOAD.Promo_Website__c,
    Page_Website__c: payload.Page_Website__c || INITIAL_MODAL_PAYLOAD.Page_Website__c,
    Source_Website__c: payload.Source_Website__c || INITIAL_MODAL_PAYLOAD.Source_Website__c,
    eventSlug: payload.eventSlug || '',
    LeadSource: 'Website',
    I_am_an_existing_Link_Net_Customer__c: false,
  };
}

function getSelectedParticipants(form) {
  const participantCount = Math.min(
    normalizeMaxParticipants(form.maxParticipants),
    Math.max(1, Number(form.participantCount) || 1),
  );

  return form.participants.slice(0, participantCount);
}

function buildSubmissionPayload(form) {
  const participants = getSelectedParticipants(form);
  const primaryParticipant = participants[0] || createParticipant();

  return {
    FirstName: primaryParticipant.firstName,
    LastName: primaryParticipant.lastName,
    Department__c: primaryParticipant.department,
    Email: primaryParticipant.companyEmail,
    MobilePhone: primaryParticipant.phoneNumber,
    Job_Level__c: primaryParticipant.roleTitle,
    Company: form.companyName,
    Business_Industry__c: form.businessIndustry,
    Province__c: form.province,
    City__c: form.city,
    Kecamatan_Zipcode__c: form.wardZipCode,
    Building_Name__c: form.detailAddress,
    Event_Name__c: form.eventName,
    Participant_Count__c: participants.length,
    Participants__c: participants.map((participant, index) => ({
      order: index + 1,
      FirstName: participant.firstName,
      LastName: participant.lastName,
      Department__c: participant.department,
      Email: participant.companyEmail,
      MobilePhone: participant.phoneNumber,
      Job_Level__c: participant.roleTitle,
    })),
    Web_to_Lead__c: form.Web_to_Lead__c,
    Promo_Website__c: form.Promo_Website__c,
    Page_Website__c: form.Page_Website__c,
    Source_Website__c: form.Source_Website__c,
    LeadSource: form.LeadSource,
    I_am_an_existing_Link_Net_Customer__c: form.I_am_an_existing_Link_Net_Customer__c,
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

function buildEventRegistrationPayload(form) {
  const participants = getSelectedParticipants(form);
  const primaryParticipant = participants[0] || createParticipant();

  return {
    company_name: form.companyName,
    company_email: primaryParticipant.companyEmail,
    company_phone: primaryParticipant.phoneNumber,
    company_address: [form.detailAddress, form.city, form.province, form.wardZipCode].filter(Boolean).join(', '),
    pic_name: [primaryParticipant.firstName, primaryParticipant.lastName].filter(Boolean).join(' '),
    pic_email: primaryParticipant.companyEmail,
    pic_phone: primaryParticipant.phoneNumber,
    notes: `Department: ${primaryParticipant.department || '-'}; Role: ${primaryParticipant.roleTitle || '-'}; Industry: ${form.businessIndustry || '-'}`,
    participants: participants.map((participant) => ({
      name: [participant.firstName, participant.lastName].filter(Boolean).join(' '),
      email: participant.companyEmail,
      phone: participant.phoneNumber,
      job_title: participant.roleTitle,
    })),
  };
}

function validateParticipantCountStep(form) {
  if (normalizeMaxParticipants(form.maxParticipants) <= 1) {
    return {};
  }

  if (String(form.participantCount || '').trim()) {
    return {};
  }

  return {
    participantCount: FORM_ERROR_MESSAGES.participantCount,
  };
}

function validateProfileStep(form) {
  const errors = {};

  getSelectedParticipants(form).forEach((participant, index) => {
    if (!participant.firstName.trim()) {
      errors[`participants.${index}.firstName`] = FORM_ERROR_MESSAGES.firstName;
    }

    if (!participant.lastName.trim()) {
      errors[`participants.${index}.lastName`] = FORM_ERROR_MESSAGES.lastName;
    }

    if (!participant.companyEmail.trim()) {
      errors[`participants.${index}.companyEmail`] = FORM_ERROR_MESSAGES.companyEmail;
    } else if (!EMAIL_REGEX.test(participant.companyEmail)) {
      errors[`participants.${index}.companyEmail`] = FORM_ERROR_MESSAGES.companyEmailFormat;
    }

    if (!participant.phoneNumber.trim()) {
      errors[`participants.${index}.phoneNumber`] = FORM_ERROR_MESSAGES.phoneNumber;
    } else if (!PHONE_REGEX.test(String(participant.phoneNumber).replace(/\D+/g, ''))) {
      errors[`participants.${index}.phoneNumber`] = FORM_ERROR_MESSAGES.phoneNumberFormat;
    }

    if (!participant.department.trim()) {
      errors[`participants.${index}.department`] = FORM_ERROR_MESSAGES.department;
    }

    if (!participant.roleTitle.trim()) {
      errors[`participants.${index}.roleTitle`] = FORM_ERROR_MESSAGES.roleTitle;
    }
  });

  return errors;
}

function validateCompanyStep(form) {
  const errors = {};

  if (normalizeMaxParticipants(form.maxParticipants) > 1 && !String(form.participantCount || '').trim()) {
    errors.participantCount = FORM_ERROR_MESSAGES.participantCount;
  }

  return [
    ['companyName', FORM_ERROR_MESSAGES.companyName],
    ['businessIndustry', FORM_ERROR_MESSAGES.businessIndustry],
    ['province', FORM_ERROR_MESSAGES.province],
    ['city', FORM_ERROR_MESSAGES.city],
    ['wardZipCode', FORM_ERROR_MESSAGES.wardZipCode],
    ['detailAddress', FORM_ERROR_MESSAGES.detailAddress],
  ].reduce((result, [field, message]) => {
    if (!String(form[field] || '').trim()) {
      result[field] = message;
    }

    return result;
  }, errors);
}

function validateStep(stepId, form) {
  switch (stepId) {
    case 'company':
      return validateCompanyStep(form);
    case 'participant':
      return validateProfileStep(form);
    default:
      return {};
  }
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function StepParticipantCount({ participantCount, maxParticipants, onChange, submitAttempted }) {
  const showError = submitAttempted && !String(participantCount || '').trim();
  const participantOptions = PARTICIPANT_OPTIONS.slice(0, normalizeMaxParticipants(maxParticipants));

  return (
    <div className="space-y-4">

      <Select
        id="event-register-participant-count"
        name="participantCount"
        label="Number of Participants"
        required
        placeholder="Select participant count"
        options={participantOptions}
        value={participantCount}
        onChange={onChange}
        data-error={FORM_ERROR_MESSAGES.participantCount}
        submitAttempted={submitAttempted || showError}
      />
    </div>
  );
}

function StepCompanyCombined({ form, onChange, onParticipantCountChange, submitAttempted }) {
  const {
    cityOptions,
    normalizedCity,
    normalizedProvince,
    provinceOptions,
  } = useIndonesiaLocationOptions({
    city: form.city,
    finalLevel: 'none',
    province: form.province,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="event-register-company-name"
          name="Company"
          label="Company Name"
          required
          value={form.companyName}
          onChange={onChange('companyName')}
          data-error={FORM_ERROR_MESSAGES.companyName}
          submitAttempted={submitAttempted}
        />
        <Select
          id="event-register-business-industry"
          name="Business_Industry__c"
          label="Business Industry"
          required
          placeholder="Select business industry"
          options={INDUSTRY_OPTIONS}
          value={form.businessIndustry}
          onChange={onChange('businessIndustry')}
          data-error={FORM_ERROR_MESSAGES.businessIndustry}
          submitAttempted={submitAttempted}
        />
        <Select
          id="event-register-province"
          name="Province__c"
          label="Province"
          required
          placeholder="Select province"
          options={provinceOptions}
          value={normalizedProvince}
          onChange={onChange('province')}
          data-error={FORM_ERROR_MESSAGES.province}
          submitAttempted={submitAttempted}
        />
        <Select
          id="event-register-city"
          name="City__c"
          label="City"
          required
          placeholder="Select city"
          options={cityOptions}
          value={normalizedCity}
          onChange={onChange('city')}
          data-error={FORM_ERROR_MESSAGES.city}
          submitAttempted={submitAttempted}
          disabled={!normalizedProvince}
        />
        <Input
          id="event-register-ward-zip-code"
          name="Kecamatan_Zipcode__c"
          label="Ward/ZIP Code"
          required
          type="text"
          placeholder="Enter ward / ZIP code"
          value={form.wardZipCode}
          onChange={onChange('wardZipCode')}
          data-error={FORM_ERROR_MESSAGES.wardZipCode}
          submitAttempted={submitAttempted}
          disabled={!normalizedCity}
        />
        <div className="hidden md:block" />
        <Textarea
          id="event-register-detail-address"
          name="Building_Name__c"
          label="Detail Address"
          required
          rows={4}
          className="md:col-span-2"
          value={form.detailAddress}
          onChange={onChange('detailAddress')}
          data-error={FORM_ERROR_MESSAGES.detailAddress}
          submitAttempted={submitAttempted}
        />
      </div>

      {normalizeMaxParticipants(form.maxParticipants) > 1 ? (
        <>
          <hr className="border-t border-[var(--stroke-default,#D9D9D9)]" />
          <StepParticipantCount
            participantCount={form.participantCount}
            maxParticipants={form.maxParticipants}
            onChange={onParticipantCountChange}
            submitAttempted={submitAttempted}
          />
        </>
      ) : null}
    </div>
  );
}

function ParticipantFields({
  participant,
  participantIndex,
  onChange,
  submitAttempted,
  isOpen,
  onToggle,
  className = '',
}) {
  const idPrefix = `event-register-person-${participantIndex + 1}`;
  const displayFirstName = participant.firstName.trim();
  const title = displayFirstName ? `${participantIndex + 1}. ${displayFirstName}` : `People ${participantIndex + 1}`;
  const contentRef = useRef(null);
  const contentInnerRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    const contentElement = contentRef.current;
    const contentInnerElement = contentInnerRef.current;
    const iconElement = iconRef.current;

    if (!contentElement || !contentInnerElement || !iconElement) {
      return undefined;
    }

    gsap.killTweensOf([contentElement, contentInnerElement, iconElement]);

    const currentHeight = contentElement.offsetHeight;
    const targetHeight = contentElement.scrollHeight;
    const animation = gsap.timeline({ defaults: { overwrite: 'auto' } });

    if (isOpen) {
      animation
        .set(contentElement, {
          height: currentHeight === 0 ? 0 : currentHeight,
          opacity: 1,
        })
        .set(contentInnerElement, {
          y: currentHeight === 0 ? -12 : 0,
          opacity: currentHeight === 0 ? 0 : 1,
        })
        .to(iconElement, {
          rotate: 180,
          duration: 0.32,
          ease: 'power2.out',
        }, 0)
        .to(contentElement, {
          height: targetHeight,
          duration: 0.42,
          ease: 'power2.out',
        }, 0)
        .to(contentInnerElement, {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        }, 0.08)
        .add(() => {
          gsap.set(contentElement, { height: 'auto' });
        });
    } else {
      animation
        .set(contentElement, {
          height: currentHeight || targetHeight,
          opacity: 1,
        })
        .to(iconElement, {
          rotate: 0,
          duration: 0.28,
          ease: 'power2.out',
        }, 0)
        .to(contentInnerElement, {
          y: -10,
          opacity: 0,
          duration: 0.18,
          ease: 'power2.in',
        }, 0)
        .to(contentElement, {
          height: 0,
          opacity: 0,
          duration: 0.32,
          ease: 'power2.inOut',
        }, 0.08);
    }

    return () => {
      animation.kill();
    };
  }, [isOpen]);

  return (
    <section className="rounded-[16px] border border-(--stroke-default) bg-white p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h3 className="text-body-b4 font-bold text-black">{title}</h3>
        <span ref={iconRef} className="inline-flex">
          <Icon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            className="text-secondary"
            style={{ '--icon-size': '20px' }}
          />
        </span>
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div
          ref={contentInnerRef}
          className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <Input
            id={`${idPrefix}-first-name`}
            name={`participants.${participantIndex}.FirstName`}
            label="First Name"
            required
            value={participant.firstName}
            onChange={onChange(participantIndex, 'firstName')}
            data-error={FORM_ERROR_MESSAGES.firstName}
            submitAttempted={submitAttempted}
          />
          <Input
            id={`${idPrefix}-last-name`}
            name={`participants.${participantIndex}.LastName`}
            label="Last Name"
            required
            value={participant.lastName}
            onChange={onChange(participantIndex, 'lastName')}
            data-error={FORM_ERROR_MESSAGES.lastName}
            submitAttempted={submitAttempted}
          />
          <Input
            id={`${idPrefix}-company-email`}
            name={`participants.${participantIndex}.Email`}
            label="Company Email"
            type="email"
            required
            value={participant.companyEmail}
            onChange={onChange(participantIndex, 'companyEmail')}
            data-error={FORM_ERROR_MESSAGES.companyEmail}
            data-error-email={FORM_ERROR_MESSAGES.companyEmailFormat}
            submitAttempted={submitAttempted}
          />
          <Input
            id={`${idPrefix}-phone-number`}
            name={`participants.${participantIndex}.MobilePhone`}
            label="Phone Number"
            type="tel"
            inputMode="numeric"
            required
            value={participant.phoneNumber}
            onChange={onChange(participantIndex, 'phoneNumber')}
            data-error={FORM_ERROR_MESSAGES.phoneNumber}
            data-error-phone={FORM_ERROR_MESSAGES.phoneNumberFormat}
            submitAttempted={submitAttempted}
          />
          <Select
            id={`${idPrefix}-department`}
            name={`participants.${participantIndex}.Department__c`}
            label="Your Department"
            required
            placeholder="Select department"
            options={DEPARTMENT_OPTIONS}
            value={participant.department}
            onChange={onChange(participantIndex, 'department')}
            data-error={FORM_ERROR_MESSAGES.department}
            submitAttempted={submitAttempted}
          />
          <Select
            id={`${idPrefix}-role-title`}
            name={`participants.${participantIndex}.Job_Level__c`}
            label="Your Role / Title"
            required
            placeholder="Select role / title"
            options={ROLE_OPTIONS}
            value={participant.roleTitle}
            onChange={onChange(participantIndex, 'roleTitle')}
            data-error={FORM_ERROR_MESSAGES.roleTitle}
            submitAttempted={submitAttempted}
          />
        </div>
      </div>
    </section>
  );
}

function StepProfile({ form, onParticipantChange, submitAttempted }) {
  const participants = getSelectedParticipants(form);
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(participants.map((_, index) => [index, true])),
  );

  const handleToggleSection = useCallback((participantIndex) => {
    setOpenSections((prev) => ({
      ...prev,
      [participantIndex]: !(prev[participantIndex] ?? true),
    }));
  }, []);

  return (
    <div className="space-y-4">
      {participants.map((participant, index) => (
        <ParticipantFields
          key={`participant-${index + 1}`}
          participant={participant}
          participantIndex={index}
          onChange={onParticipantChange}
          submitAttempted={submitAttempted}
          isOpen={typeof openSections[index] === 'boolean' ? openSections[index] : true}
          onToggle={() => handleToggleSection(index)}
        />
      ))}
    </div>
  );
}

function HiddenFields({ form }) {
  const payload = buildSubmissionPayload(form);

  return (
    <div className="hidden" aria-hidden="true">
      <input type="hidden" name="Web_to_Lead__c" value={String(payload.Web_to_Lead__c)} readOnly />
      <input type="hidden" name="Promo_Website__c" value={payload.Promo_Website__c} readOnly />
      <input type="hidden" name="Page_Website__c" value={payload.Page_Website__c} readOnly />
      <input type="hidden" name="Source_Website__c" value={payload.Source_Website__c} readOnly />
      <input type="hidden" name="LeadSource" value={payload.LeadSource} readOnly />
      <input type="hidden" name="Event_Name__c" value={payload.Event_Name__c} readOnly />
      <input type="hidden" name="Participant_Count__c" value={String(payload.Participant_Count__c)} readOnly />
      <input
        type="hidden"
        name="I_am_an_existing_Link_Net_Customer__c"
        value={String(payload.I_am_an_existing_Link_Net_Customer__c)}
        readOnly
      />
    </div>
  );
}

function ModalFormEventRegister({ initialPayload, isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(() => createInitialForm(initialPayload));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const contentWrapperRef = useRef(null);
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'id';
  const stepMeta = useMemo(() => getStepMeta(form.maxParticipants), [form.maxParticipants]);
  const activeStep = stepMeta[currentStep - 1];
  const businessUnit = initialPayload?.businessUnit || 'enterprise';

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

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setForm(createInitialForm(initialPayload));
    setSubmitAttempted(false);
  }, [initialPayload]);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleParticipantCountChange = useCallback((event) => {
    const nextValue = event.target.value;

    setForm((prev) => ({
      ...prev,
      participantCount: String(Math.min(normalizeMaxParticipants(prev.maxParticipants), Number(nextValue) || 1)),
    }));
  }, []);

  const handleParticipantFieldChange = useCallback(
    (participantIndex, field) => (event) => {
      const nextValue = event.target.value;

      setForm((prev) => ({
        ...prev,
        participants: prev.participants.map((participant, index) => {
          if (index !== participantIndex) {
            return participant;
          }

          return {
            ...participant,
            [field]: nextValue,
          };
        }),
      }));
    },
    [],
  );

  const handleCompanyFieldChange = useCallback(
    (field) => (event) => {
      const nextValue = event.target.value;

      setForm((prev) => {
        if (field === 'province') {
          return {
            ...prev,
            province: nextValue,
            city: '',
            wardZipCode: '',
          };
        }

        if (field === 'city') {
          return {
            ...prev,
            city: nextValue,
            wardZipCode: '',
          };
        }

        return {
          ...prev,
          [field]: nextValue,
        };
      });
    },
    [],
  );

  const handleSubmitSuccess = useCallback(() => {
    const locale = params?.locale || 'id';
    const primaryParticipant = getSelectedParticipants(form)[0];
    const firstName = encodeURIComponent(primaryParticipant?.firstName?.trim() || 'there');

    handleReset();
    onClose();
    router.push(`/${locale}/enterprise/form/success?name=${firstName}&needs=Register%20Event`);
  }, [form, handleReset, onClose, params?.locale, router]);

  const handleContinue = useCallback(async () => {
    const errors = validateStep(activeStep?.id, form);

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      return;
    }

    setSubmitAttempted(false);

    if (currentStep < stepMeta.length) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (form.eventSlug) {
        await createEventRegistration(form.eventSlug, buildEventRegistrationPayload(form));
      } else {
        await submitEnterpriseForm('event_register', {
          locale,
          fields: buildSubmissionPayload(form),
          context: resolveSubmissionContext(initialPayload),
          groups: [],
          files: [],
        });
      }
      handleSubmitSuccess();
    } catch (err) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeStep?.id, businessUnit, currentStep, form, handleSubmitSuccess, initialPayload, locale, stepMeta.length]);

  const handlePrevious = useCallback(() => {
    setSubmitAttempted(false);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  const headerContent = useMemo(
    () => (
      <div className="mt-10 space-y-4">
        <div className="space-y-2">
          <h2 className="text-headline-h4 font-bold leading-tight text-black md:text-headline-h4">
            Register for <span> {form.eventName}</span>
          </h2>
          {/* {form.eventName ? (
            <p className="text-body-b5 text-secondary">{form.eventName}</p>
          ) : null} */}
        </div>
        <FormStepperModal
          className="!items-start lnModalFormSwiperLeft"
          align="start"
          steps={stepMeta}
          currentStep={currentStep}
        />
      </div>
    ),
    [currentStep, form.eventName, stepMeta],
  );

  const bodyContent = useMemo(() => {
    if (activeStep?.id === 'company') {
      return (
        <StepCompanyCombined
          form={form}
          onChange={handleCompanyFieldChange}
          onParticipantCountChange={handleParticipantCountChange}
          submitAttempted={submitAttempted}
        />
      );
    }

    if (activeStep?.id === 'participant') {
      return (
        <StepProfile
          form={form}
          onParticipantChange={handleParticipantFieldChange}
          submitAttempted={submitAttempted}
        />
      );
    }
    return null;
  }, [
    activeStep?.id,
    form,
    handleCompanyFieldChange,
    handleParticipantCountChange,
    handleParticipantFieldChange,
    submitAttempted,
  ]);

  const footerContent = (
    <div className="flex w-full items-center justify-between gap-3">
      {currentStep === 1 ? (
        <div />
      ) : (
        <Button
          type="button"
          variant="secondary"
          outline
          onClick={handlePrevious}
        >
          Previously
        </Button>
      )}

      <Button
        type="button"
        variant="warning"
        onClick={handleContinue}
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
      className=""
    >
      <div ref={contentWrapperRef} className="pb-2 pt-1">
        <HiddenFields form={form} />
        {bodyContent}
      </div>
    </Modal>
  );
}

export function useModalFormEventRegister() {
  return useContext(ModalFormEventRegisterContext);
}

export default function ModalFormEventRegisterProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [modalPayload, setModalPayload] = useState(INITIAL_MODAL_PAYLOAD);
  const hasMounted = useHasMounted();

  const openModal = useCallback((payload = {}) => {
    setModalPayload({
      Promo_Website__c: payload.Promo_Website__c || INITIAL_MODAL_PAYLOAD.Promo_Website__c,
      Page_Website__c: payload.Page_Website__c || INITIAL_MODAL_PAYLOAD.Page_Website__c,
      Source_Website__c: payload.Source_Website__c || INITIAL_MODAL_PAYLOAD.Source_Website__c,
      Product: payload.Product,
      context: payload.context,
      eventSlug: payload.eventSlug || '',
      eventName: payload.eventName || '',
      maxParticipants: normalizeMaxParticipants(payload.maxParticipants),
      businessUnit: payload.businessUnit || INITIAL_MODAL_PAYLOAD.businessUnit,
    });
    setSessionKey((prev) => prev + 1);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalPayload(INITIAL_MODAL_PAYLOAD);
  }, []);

  return (
    <ModalFormEventRegisterContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasMounted ? (
        <ModalFormEventRegister
          key={sessionKey}
          initialPayload={modalPayload}
          isOpen={isOpen}
          onClose={closeModal}
        />
      ) : null}
    </ModalFormEventRegisterContext.Provider>
  );
}
