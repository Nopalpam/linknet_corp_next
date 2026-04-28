'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../Button';
import Input from '../forms/Input';
import Modal from '../Modal';
import Select from '../forms/Select';
import Textarea from '../forms/Textarea';
import FormStepperModal from '../forms/FormStepperModal';
import { useFormSubmission } from '@/components/hooks/useFormSubmission';

const ModalFormPartnershipEnterpriseContext = createContext({
  openModal: () => {},
  closeModal: () => {},
});

const TOTAL_STEPS = 2;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9,}$/;

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

const PARTNERSHIP_TYPE_OPTIONS = [
  'Referral Partnership',
  'Reseller Partnership',
  'Strategic Alliance',
  'Technology Partnership',
  'Others',
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

const PROVINCE_OPTIONS = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Banten',
].map((option) => ({
  label: option,
  value: option,
}));

const CITY_BY_PROVINCE = {
  'DKI Jakarta': ['Jakarta Selatan', 'Jakarta Barat', 'Jakarta Pusat'],
  'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor'],
  'Jawa Tengah': ['Semarang', 'Solo', 'Magelang'],
  'DI Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul'],
  'Jawa Timur': ['Surabaya', 'Sidoarjo', 'Malang'],
  Banten: ['Tangerang', 'Tangerang Selatan', 'Serang'],
};

const WARD_BY_CITY = {
  'Jakarta Selatan': ['Kebayoran Baru', 'Setiabudi', 'Tebet'],
  'Jakarta Barat': ['Kembangan', 'Palmerah', 'Cengkareng'],
  'Jakarta Pusat': ['Menteng', 'Tanah Abang', 'Kemayoran'],
  Bandung: ['Coblong', 'Lengkong', 'Sukajadi'],
  Bekasi: ['Bekasi Selatan', 'Bekasi Timur', 'Jatiasih'],
  Bogor: ['Bogor Tengah', 'Bogor Barat', 'Cigombong'],
  Semarang: ['Banyumanik', 'Candisari', 'Tembalang'],
  Solo: ['Banjarsari', 'Laweyan', 'Jebres'],
  Magelang: ['Magelang Tengah', 'Magelang Utara', 'Mertoyudan'],
  Yogyakarta: ['Gondokusuman', 'Jetis', 'Umbulharjo'],
  Sleman: ['Depok', 'Ngaglik', 'Mlati'],
  Bantul: ['Banguntapan', 'Kasihan', 'Sewon'],
  Surabaya: ['Tegalsari', 'Wonokromo', 'Rungkut'],
  Sidoarjo: ['Buduran', 'Candi', 'Gedangan'],
  Malang: ['Klojen', 'Lowokwaru', 'Blimbing'],
  Tangerang: ['Ciledug', 'Karawaci', 'Pinang'],
  'Tangerang Selatan': ['Serpong', 'Pondok Aren', 'Ciputat'],
  Serang: ['Curug', 'Kasemen', 'Walantaka'],
};

const STEP_META = [
  {
    step: 1,
    label: 'Profile',
    actionLabel: 'Continue',
  },
  {
    step: 2,
    label: 'Company',
    actionLabel: 'Confirm & Submit',
  },
];

const FORM_ERROR_MESSAGES = {
  firstName: 'First Name is required.',
  lastName: 'Last Name is required.',
  companyEmail: 'Company Email is required.',
  companyEmailFormat: 'Company Email format is invalid.',
  phoneNumber: 'Phone Number is required.',
  phoneNumberFormat: 'Phone Number format is invalid.',
  department: 'Your Department is required.',
  roleTitle: 'Your Role / Title is required.',
  typePartnership: 'Type of Partnership is required.',
  otherPartnershipType: 'Other Partnership Type is required.',
  companyName: 'Company Name is required.',
  businessIndustry: 'Business Industry is required.',
  province: 'Province is required.',
  city: 'City is required.',
  wardZipCode: 'Ward / ZIP Code is required.',
  detailAddress: 'Detail Address is required.',
};

const INITIAL_MODAL_PAYLOAD = {
  Promo_Website__c: 'Enterprise Partnership',
  Page_Website__c: '/enterprise/form',
  Source_Website__c: 'Enterprise Website',
};

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  companyEmail: '',
  phoneNumber: '',
  department: '',
  roleTitle: '',
  typePartnership: '',
  otherPartnershipType: '',
  companyName: '',
  businessIndustry: '',
  province: '',
  city: '',
  wardZipCode: '',
  detailAddress: '',
  Web_to_Lead__c: true,
  Promo_Website__c: INITIAL_MODAL_PAYLOAD.Promo_Website__c,
  Page_Website__c: INITIAL_MODAL_PAYLOAD.Page_Website__c,
  Source_Website__c: INITIAL_MODAL_PAYLOAD.Source_Website__c,
  LeadSource: 'Website',
  I_am_an_existing_Link_Net_Customer__c: false,
};

function createInitialForm() {
  return {
    ...INITIAL_FORM,
  };
}

function buildSubmissionPayload(form) {
  return {
    FirstName: form.firstName,
    LastName: form.lastName,
    Department__c: form.department,
    Email: form.companyEmail,
    MobilePhone: form.phoneNumber,
    Company: form.companyName,
    Business_Industry__c: form.businessIndustry,
    Province__c: form.province,
    City__c: form.city,
    Kecamatan_Zipcode__c: form.wardZipCode,
    Building_Name__c: form.detailAddress,
    Job_Level__c: form.roleTitle,
    Type_of_Partnership__c: form.typePartnership,
    Other_Partnership_Type__c: form.otherPartnershipType,
    Web_to_Lead__c: form.Web_to_Lead__c,
    Promo_Website__c: form.Promo_Website__c,
    Page_Website__c: form.Page_Website__c,
    Source_Website__c: form.Source_Website__c,
    LeadSource: form.LeadSource,
    I_am_an_existing_Link_Net_Customer__c: form.I_am_an_existing_Link_Net_Customer__c,
  };
}

function validateStep1(form) {
  const errors = {};

  if (!form.firstName.trim()) {
    errors.firstName = FORM_ERROR_MESSAGES.firstName;
  }

  if (!form.lastName.trim()) {
    errors.lastName = FORM_ERROR_MESSAGES.lastName;
  }

  if (!form.companyEmail.trim()) {
    errors.companyEmail = FORM_ERROR_MESSAGES.companyEmail;
  } else if (!EMAIL_REGEX.test(form.companyEmail)) {
    errors.companyEmail = FORM_ERROR_MESSAGES.companyEmailFormat;
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = FORM_ERROR_MESSAGES.phoneNumber;
  } else if (!PHONE_REGEX.test(String(form.phoneNumber).replace(/\D+/g, ''))) {
    errors.phoneNumber = FORM_ERROR_MESSAGES.phoneNumberFormat;
  }

  if (!form.department.trim()) {
    errors.department = FORM_ERROR_MESSAGES.department;
  }

  if (!form.roleTitle.trim()) {
    errors.roleTitle = FORM_ERROR_MESSAGES.roleTitle;
  }

  if (!form.typePartnership.trim()) {
    errors.typePartnership = FORM_ERROR_MESSAGES.typePartnership;
  }

  if (form.typePartnership === 'Others' && !form.otherPartnershipType.trim()) {
    errors.otherPartnershipType = FORM_ERROR_MESSAGES.otherPartnershipType;
  }

  return errors;
}

function validateStep2(form) {
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
  }, {});
}

function validateStep(step, form) {
  switch (step) {
    case 1:
      return validateStep1(form);
    case 2:
      return validateStep2(form);
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

function Step1Fields({ form, onChange, submitAttempted }) {
  const showOtherPartnershipType = form.typePartnership === 'Others';

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        id="partnership-enterprise-first-name"
        name="FirstName"
        label="First Name"
        required
        value={form.firstName}
        onChange={onChange('firstName')}
        data-error={FORM_ERROR_MESSAGES.firstName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="partnership-enterprise-last-name"
        name="LastName"
        label="Last Name"
        required
        value={form.lastName}
        onChange={onChange('lastName')}
        data-error={FORM_ERROR_MESSAGES.lastName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="partnership-enterprise-company-email"
        name="Email"
        label="Company Email"
        type="email"
        required
        value={form.companyEmail}
        onChange={onChange('companyEmail')}
        data-error={FORM_ERROR_MESSAGES.companyEmail}
        data-error-email={FORM_ERROR_MESSAGES.companyEmailFormat}
        submitAttempted={submitAttempted}
      />
      <Input
        id="partnership-enterprise-phone-number"
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
      <Select
        id="partnership-enterprise-department"
        name="Department__c"
        label="Your Department"
        required
        placeholder="Select department"
        options={DEPARTMENT_OPTIONS}
        value={form.department}
        onChange={onChange('department')}
        data-error={FORM_ERROR_MESSAGES.department}
        submitAttempted={submitAttempted}
      />
      <Select
        id="partnership-enterprise-role-title"
        name="Job_Level__c"
        label="Your Role / Title"
        required
        placeholder="Select role / title"
        options={ROLE_OPTIONS}
        value={form.roleTitle}
        onChange={onChange('roleTitle')}
        data-error={FORM_ERROR_MESSAGES.roleTitle}
        submitAttempted={submitAttempted}
      />
      <Select
        id="partnership-enterprise-type"
        name="Type_of_Partnership__c"
        label="Type of Partnership"
        required
        className="md:col-span-2"
        placeholder="Select partnership type"
        options={PARTNERSHIP_TYPE_OPTIONS}
        value={form.typePartnership}
        onChange={onChange('typePartnership')}
        data-error={FORM_ERROR_MESSAGES.typePartnership}
        submitAttempted={submitAttempted}
      />
      {showOtherPartnershipType ? (
        <Input
          id="partnership-enterprise-other-type"
          name="Other_Partnership_Type__c"
          label="Other Partnership Type"
          required
          className="md:col-span-2"
          value={form.otherPartnershipType}
          onChange={onChange('otherPartnershipType')}
          data-error={FORM_ERROR_MESSAGES.otherPartnershipType}
          submitAttempted={submitAttempted}
        />
      ) : null}
    </div>
  );
}

function Step2Fields({ form, onChange, submitAttempted }) {
  const cityOptions = (CITY_BY_PROVINCE[form.province] || []).map((option) => ({
    label: option,
    value: option,
  }));

  const wardOptions = (WARD_BY_CITY[form.city] || []).map((option) => ({
    label: option,
    value: option,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        id="partnership-enterprise-company-name"
        name="Company"
        label="Company Name"
        required
        value={form.companyName}
        onChange={onChange('companyName')}
        data-error={FORM_ERROR_MESSAGES.companyName}
        submitAttempted={submitAttempted}
      />
      <Select
        id="partnership-enterprise-business-industry"
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
        id="partnership-enterprise-province"
        name="Province__c"
        label="Province"
        required
        placeholder="Select province"
        options={PROVINCE_OPTIONS}
        value={form.province}
        onChange={onChange('province')}
        data-error={FORM_ERROR_MESSAGES.province}
        submitAttempted={submitAttempted}
      />
      <Select
        id="partnership-enterprise-city"
        name="City__c"
        label="City"
        required
        placeholder="Select city"
        options={cityOptions}
        value={form.city}
        onChange={onChange('city')}
        data-error={FORM_ERROR_MESSAGES.city}
        submitAttempted={submitAttempted}
        disabled={!form.province}
      />
      <Select
        id="partnership-enterprise-ward-zip-code"
        name="Kecamatan_Zipcode__c"
        label="Ward/ZIP Code"
        required
        placeholder="Select ward / ZIP code"
        options={wardOptions}
        value={form.wardZipCode}
        onChange={onChange('wardZipCode')}
        data-error={FORM_ERROR_MESSAGES.wardZipCode}
        submitAttempted={submitAttempted}
        disabled={!form.city}
      />
      <div className="hidden md:block" />
      <Textarea
        id="partnership-enterprise-detail-address"
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
      <input
        type="hidden"
        name="I_am_an_existing_Link_Net_Customer__c"
        value={String(payload.I_am_an_existing_Link_Net_Customer__c)}
        readOnly
      />
      <input type="hidden" name="Type_of_Partnership__c" value={payload.Type_of_Partnership__c} readOnly />
      <input type="hidden" name="Other_Partnership_Type__c" value={payload.Other_Partnership_Type__c} readOnly />
    </div>
  );
}

function ModalFormPartnershipEnterprise({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(createInitialForm);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'id';

  const { submit } = useFormSubmission('enterprise', 'enterprise-partnership');

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setForm(createInitialForm());
    setSubmitAttempted(false);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleFieldChange = useCallback(
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

        if (field === 'typePartnership') {
          return {
            ...prev,
            typePartnership: nextValue,
            otherPartnershipType: nextValue === 'Others' ? prev.otherPartnershipType : '',
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
    const firstName = encodeURIComponent(form.firstName.trim() || 'there');

    handleReset();
    onClose();
    router.push(`/${locale}/enterprise/form/success?name=${firstName}&needs=Partnership`);
  }, [form.firstName, handleReset, onClose, params?.locale, router]);

  const handleContinue = useCallback(async () => {
    const errors = validateStep(currentStep, form);

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      return;
    }

    setSubmitAttempted(false);

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submit({
        locale,
        sourcePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
        values: buildSubmissionPayload(form),
        groups: [],
        files: [],
      });
      handleSubmitSuccess();
    } catch (err) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, form, handleSubmitSuccess, locale, submit]);

  const handlePrevious = useCallback(() => {
    setSubmitAttempted(false);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  const headerContent = useMemo(
    () => (
      <div className="space-y-4 mt-10">
        <h2 className="text-headline-h4 font-bold leading-tight text-black md:text-headline-h4">
          Become a Linknet Channel Partner
        </h2>
        <FormStepperModal
          className="!items-start"
          align="start"
          steps={STEP_META}
          currentStep={currentStep}
        />
      </div>
    ),
    [currentStep],
  );

  const bodyContent = currentStep === 1 ? (
    <Step1Fields
      form={form}
      onChange={handleFieldChange}
      submitAttempted={submitAttempted}
    />
  ) : (
    <Step2Fields
      form={form}
      onChange={handleFieldChange}
      submitAttempted={submitAttempted}
    />
  );

  const footerContent = (
    <div className="flex w-full items-center justify-between gap-3">
      {currentStep === 1 ? <div /> : (
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
        {STEP_META[currentStep - 1]?.actionLabel}
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
      className="lnModalFormPartnershipEnterprise"
    >
      <div className="pb-2 pt-1">
        <HiddenFields form={form} />
        {bodyContent}
      </div>
    </Modal>
  );
}

export function useModalFormPartnershipEnterprise() {
  return useContext(ModalFormPartnershipEnterpriseContext);
}

export default function ModalFormPartnershipEnterpriseProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const hasMounted = useHasMounted();

  const openModal = useCallback(() => {
    setSessionKey((prev) => prev + 1);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ModalFormPartnershipEnterpriseContext.Provider value={{ openModal, closeModal }}>
      {children}
      {hasMounted ? (
        <ModalFormPartnershipEnterprise
          key={sessionKey}
          isOpen={isOpen}
          onClose={closeModal}
        />
      ) : null}
    </ModalFormPartnershipEnterpriseContext.Provider>
  );
}
