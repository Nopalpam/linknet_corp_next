'use client';

import { useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import FormStepper, { FormStep } from '../base/forms/FormStepper';
import Input        from '../base/forms/Input';
import FieldReadOnly from '../base/forms/FieldReadOnly';
import Button       from '../base/Button';
import CoverageCheckInput, { COVERAGE_MODE, resolveManualLabels } from '../base/forms/CoverageCheckInput';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 3;

const INITIAL_FORM = {
  // Step 1 – Lokasi (covered mode)
  site_id:        '9823451',
  address:        '',
  addressDetail:  '',
  // Step 1 – Lokasi (manual mode)
  manualProvince:      '',
  manualCity:          '',
  manualZip:           '',
  manualDetailAddress: '',
  // Step 2 – Data Diri
  firstName:      '',
  lastName:       '',
  companyEmail:   '',
  phoneNumber:    '',
  // Step 3 – Jadwal
  installDate:     '',
  installTimeSlot: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateStep(stepNumber, form, coverageMode) {
  const errors = {};

  if (stepNumber === 1) {
    if (coverageMode === COVERAGE_MODE.SEARCH) {
      errors.address = 'Alamat pemasangan wajib diisi.';
    }

    if (coverageMode === COVERAGE_MODE.MANUAL) {
      if (!form.manualProvince.trim())
        errors.province = 'Province wajib dipilih.';
      if (!form.manualCity.trim())
        errors.city = 'City / Regency wajib dipilih.';
      if (!form.manualZip.trim())
        errors.zip = 'Ward / ZIP Code wajib dipilih.';
      if (!form.manualDetailAddress.trim())
        errors.detailAddress = 'Detail address wajib diisi.';
    }
  }

  if (stepNumber === 2) {
    if (!form.firstName.trim())
      errors.firstName = 'First name wajib diisi.';
    if (!form.lastName.trim())
      errors.lastName = 'Last name wajib diisi.';
    if (!form.companyEmail.trim())
      errors.companyEmail = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail))
      errors.companyEmail = 'Format email tidak valid.';
    if (!form.phoneNumber.trim())
      errors.phoneNumber = 'Nomor telepon wajib diisi.';
    else if (!/^[0-9+\-\s]{8,}$/.test(form.phoneNumber))
      errors.phoneNumber = 'Format nomor telepon tidak valid.';
  }

  if (stepNumber === 3) {
    if (!form.installDate)
      errors.installDate = 'Tanggal instalasi wajib dipilih.';
    if (!form.installTimeSlot)
      errors.installTimeSlot = 'Slot waktu wajib dipilih.';
  }

  return errors;
}

const isValid = (errors) => Object.keys(errors).length === 0;

function deriveStatus(stepNumber, currentStep) {
  if (stepNumber < currentStep)  return 'finish';
  if (stepNumber === currentStep) return 'active';
  return 'disabled';
}

// ─────────────────────────────────────────────────────────────────────────────
// Step body sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Step1Body({ form, onChange, onManualDataChange, onAddressSelect, onAddressReset, errors, submitAttempted, onCoverageModeChange }) {
  const manualData = {
    province:      form.manualProvince,
    city:          form.manualCity,
    zip:           form.manualZip,
    detailAddress: form.manualDetailAddress,
  };

  return (
    <div className="lnFormRegistration__fields space-y-4">
      <CoverageCheckInput
        required
        site_id={form.site_id ?? ''}
        addressDetail={form.addressDetail}
        onAddressDetailChange={onChange('addressDetail')}
        manualData={manualData}
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
  if (coverageMode === COVERAGE_MODE.MANUAL) {
    const labels = resolveManualLabels({
      province:      form.manualProvince,
      city:          form.manualCity,
      zip:           form.manualZip,
      detailAddress: form.manualDetailAddress,
    });

    return (
      <div className="lnAddressSummary space-y-3">
        <FieldReadOnly label="Province"        value={labels.provinceLabel} />
        <FieldReadOnly label="City / Regency"  value={labels.cityLabel} />
        <FieldReadOnly label="Ward / ZIP Code" value={labels.zipLabel} />
        <FieldReadOnly label="Detail Address"  value={labels.detailAddress} />
      </div>
    );
  }

  return (
    <div className="lnAddressSummary space-y-3">
      <FieldReadOnly label="Alamat Pemasangan" value={form.address} />
      <FieldReadOnly label="Detail Alamat"     value={form.addressDetail} />
    </div>
  );
}

function Step2Body({ form, onChange, errors, submitAttempted }) {
  return (
    <div className="lnFormRegistration__fields grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        id="firstName"
        label="First Name"
        required
        value={form.firstName}
        onChange={onChange('firstName')}
        error={errors.firstName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="lastName"
        label="Last Name"
        required
        value={form.lastName}
        onChange={onChange('lastName')}
        error={errors.lastName}
        submitAttempted={submitAttempted}
      />
      <Input
        id="companyEmail"
        label="Company Email"
        type="email"
        required
        value={form.companyEmail}
        onChange={onChange('companyEmail')}
        error={errors.companyEmail}
        submitAttempted={submitAttempted}
      />
      <Input
        id="phoneNumber"
        label="Phone Number"
        type="tel"
        required
        value={form.phoneNumber}
        onChange={onChange('phoneNumber')}
        error={errors.phoneNumber}
        submitAttempted={submitAttempted}
      />
    </div>
  );
}

function Step2Summary({ firstName, lastName, companyEmail, phoneNumber }) {
  return (
    <div className="lnPersonalSummary grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      <FieldReadOnly label="First Name"    value={firstName} />
      <FieldReadOnly label="Last Name"     value={lastName} />
      <FieldReadOnly label="Company Email" value={companyEmail} />
      <FieldReadOnly label="Phone Number"  value={phoneNumber} />
    </div>
  );
}

const TIME_SLOTS = [
  '08:00 – 10:00',
  '10:00 – 12:00',
  '13:00 – 15:00',
  '15:00 – 17:00',
];

function TimeSlotPicker({ value, onChange, error, submitAttempted }) {
  return (
    <div className="lnTimeSlotPicker">
      <p className="lnTimeSlotPicker__label text-caption-c1 text-secondary mb-2">
        Slot Waktu<span className="text-danger ml-0.5">*</span>
      </p>
      <div className="lnTimeSlotPicker__grid grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TIME_SLOTS.map((slot) => {
          const isSelected = value === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onChange(slot)}
              aria-pressed={isSelected}
              className={[
                'lnTimeSlotPicker__pill text-body-b5 font-medium',
                'px-3 py-2.5 rounded-lg border transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400',
                isSelected
                  ? 'border-warning bg-yellow-50 text-warning'
                  : 'border-secondary bg-white text-black hover:border-yellow-300 hover:bg-yellow-50',
              ].join(' ')}
            >
              {slot}
            </button>
          );
        })}
      </div>
      {submitAttempted && error && (
        <p className="lnTimeSlotPicker__error text-caption-c1 text-danger mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

function Step3Body({ form, onChange, onTimeSlot, errors, submitAttempted }) {
  return (
    <div className="lnFormRegistration__fields space-y-4">
      <Input
        id="installDate"
        label="Tanggal Instalasi"
        type="date"
        required
        value={form.installDate}
        onChange={onChange('installDate')}
        error={errors.installDate}
        submitAttempted={submitAttempted}
      />
      <TimeSlotPicker
        value={form.installTimeSlot}
        onChange={onTimeSlot}
        error={errors.installTimeSlot}
        submitAttempted={submitAttempted}
      />
    </div>
  );
}

function Step3Summary({ installDate, installTimeSlot }) {
  return (
    <div className="lnScheduleSummary grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      <FieldReadOnly label="Tanggal Instalasi" value={installDate} />
      <FieldReadOnly label="Slot Waktu"        value={installTimeSlot} />
    </div>
  );
}

function SuccessScreen({ onReset }) {
  return (
    <div className="lnSuccessScreen flex flex-col items-center justify-center min-h-screen px-4 gap-5 text-center bg-light">
      <div className="lnSuccessScreen__icon w-16 h-16 rounded-full bg-success flex items-center justify-center shadow-md">
        <Check size={32} strokeWidth={2.5} className="text-white" />
      </div>
      <div className="lnSuccessScreen__copy">
        <h2 className="text-headline-h5 font-bold text-black mb-2">Pendaftaran Berhasil!</h2>
        <p className="text-body-b5 text-secondary max-w-xs mx-auto">
          Tim kami akan segera menghubungi Anda untuk konfirmasi jadwal instalasi.
        </p>
      </div>
      <Button variant="warning" onClick={onReset}>
        Daftar Lagi
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormRegistration
// ─────────────────────────────────────────────────────────────────────────────

export default function FormRegistration({ onClose }) {
  const [currentStep, setCurrentStep]         = useState(1);
  const [form, setForm]                       = useState(INITIAL_FORM);
  const [submitted, setSubmitted]             = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [stepErrors, setStepErrors]           = useState({});
  const [navDirection, setNavDirection]        = useState('forward');
  const [coverageMode, setCoverageMode]       = useState(COVERAGE_MODE.SEARCH);

  const handleCoverageModeChange = useCallback((mode) => {
    setCoverageMode(mode);
  }, []);

  const handleFieldChange = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setStepErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleManualDataChange = useCallback((newManualData) => {
    setForm((prev) => ({
      ...prev,
      manualProvince:      newManualData.province,
      manualCity:          newManualData.city,
      manualZip:           newManualData.zip,
      manualDetailAddress: newManualData.detailAddress,
    }));

    setStepErrors((prev) => {
      const next = { ...prev };
      const fieldMap = {
        province:      'province',
        city:          'city',
        zip:           'zip',
        detailAddress: 'detailAddress',
      };
      for (const [key, errorKey] of Object.entries(fieldMap)) {
        if (newManualData[key] && next[errorKey]) {
          delete next[errorKey];
        }
      }
      return next;
    });
  }, []);

  // ★ Called by CoverageCheckInput when user selects an address from search
  const handleAddressSelect = useCallback(({ site_id, address }) => {
    setForm((prev) => ({
      ...prev,
      site_id,
      address,
    }));
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next.address;
      return next;
    });
  }, []);

  // ★ Called by CoverageCheckInput on close/edit/back/notFound
  //   Resets ALL address-related fields to clean state
  const handleAddressReset = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      site_id:             null,
      address:             '',
      addressDetail:       '',
      manualProvince:      '',
      manualCity:          '',
      manualZip:           '',
      manualDetailAddress: '',
    }));
    setStepErrors({});
  }, []);

  const handleTimeSlot = useCallback((slot) => {
    setForm((prev) => ({ ...prev, installTimeSlot: slot }));
    setStepErrors((prev) => {
      if (!prev.installTimeSlot) return prev;
      const next = { ...prev };
      delete next.installTimeSlot;
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const errors = validateStep(currentStep, form, coverageMode);

    if (!isValid(errors)) {
      setSubmitAttempted(true);
      setStepErrors(errors);
      return;
    }

    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection('forward');

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    } else {
      console.log('[FormRegistration] Submitted:', form);
      setSubmitted(true);
    }
  }, [currentStep, form, coverageMode]);

  const handleChangeStep = useCallback((step) => {
    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection('backward');
    setCurrentStep(step);
  }, []);

  const handleReset = useCallback(() => {
    setForm(INITIAL_FORM);
    setCurrentStep(1);
    setSubmitted(false);
    setSubmitAttempted(false);
    setStepErrors({});
    setNavDirection('forward');
    setCoverageMode(COVERAGE_MODE.SEARCH);
  }, []);

  if (submitted) return <SuccessScreen onReset={handleReset} />;

  const s1 = deriveStatus(1, currentStep);
  const s2 = deriveStatus(2, currentStep);
  const s3 = deriveStatus(3, currentStep);

  return (
    <FormStepper
      currentStep={currentStep}
      onClose={onClose}
      onChangeStep={handleChangeStep}
      navDirection={navDirection}
      title={'Dapatkan Koneksi Internet Terpercaya dari Linknet'}
      className="lnFormRegistration"
    >

      <FormStep
        name="lokasi"
        step={1}
        status={s1}
        step_name="Layanan & Lokasi Pemasangan"
        step_title="Layanan & Lokasi Pemasangan"
        step_description="Pastikan alamat pemasangan sudah benar sebelum melanjutkan."
        bodySlot={
          s1 === 'active'
            ? (
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
            )
            : (
              <Step1Summary
                form={form}
                coverageMode={coverageMode}
              />
            )
        }
        footerSlot={
          <Button variant="warning" onClick={handleConfirm}>
            Confirm
          </Button>
        }
      />

      <FormStep
        name="personal_data"
        step={2}
        status={s2}
        step_name="Data Diri"
        step_title="Data Diri"
        step_description="Pastikan data yang Anda masukkan sudah benar."
        bodySlot={
          s2 === 'active'
            ? (
              <Step2Body
                form={form}
                onChange={handleFieldChange}
                errors={stepErrors}
                submitAttempted={submitAttempted}
              />
            )
            : (
              <Step2Summary
                firstName={form.firstName}
                lastName={form.lastName}
                companyEmail={form.companyEmail}
                phoneNumber={form.phoneNumber}
              />
            )
        }
        footerSlot={
          <Button variant="warning" onClick={handleConfirm}>
            Confirm
          </Button>
        }
      />

      <FormStep
        name="schedule"
        step={3}
        status={s3}
        step_name="Jadwal Instalasi"
        step_title="Jadwal Instalasi"
        step_description="Kami akan menghubungi Anda untuk konfirmasi jadwal setelah proses selesai."
        bodySlot={
          s3 === 'active'
            ? (
              <Step3Body
                form={form}
                onChange={handleFieldChange}
                onTimeSlot={handleTimeSlot}
                errors={stepErrors}
                submitAttempted={submitAttempted}
              />
            )
            : (
              <Step3Summary
                installDate={form.installDate}
                installTimeSlot={form.installTimeSlot}
              />
            )
        }
        footerSlot={
          <Button variant="warning" onClick={handleConfirm}>
            Submit
          </Button>
        }
      />

    </FormStepper>
  );
}