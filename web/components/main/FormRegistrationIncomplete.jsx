'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Button from '../base/Button';
import InputFile from '../base/forms/InputFile';

const DOCUMENT_FIELDS = [
  {
    key: 'nibCompanyFile',
    id: 'incomplete-nib-company-file',
    label: 'NIB Company',
  },
  {
    key: 'apjiiCertificateFile',
    id: 'incomplete-apjii-certificate-file',
    label: 'APJII Participation Certificate',
  },
  {
    key: 'linknetProductStatementFile',
    id: 'incomplete-linknet-product-statement-file',
    label: 'Written statement of the Linknet product to be selected',
  },
  {
    key: 'previousYearFinancialReportFile',
    id: 'incomplete-previous-year-financial-report-file',
    label: 'Previous Year Financial Report (Company)',
  },
  {
    key: 'companyDeedFile',
    id: 'incomplete-company-deed-file',
    label: 'Company Deed of Establishment and Company Decree',
  },
];

const FORM_ERROR_MESSAGES = {
  nibCompanyFile: 'NIB Company is required.',
  apjiiCertificateFile: 'APJII Participation Certificate is required.',
  linknetProductStatementFile:
    'Written statement of the Linknet product to be selected is required.',
  previousYearFinancialReportFile:
    'Previous Year Financial Report (Company) is required.',
  companyDeedFile:
    'Company Deed of Establishment and Company Decree is required.',
};

function createInitialForm() {
  return DOCUMENT_FIELDS.reduce((result, field) => {
    result[field.key] = null;
    return result;
  }, {});
}

function getDisplayName(value) {
  const normalizedValue = String(value || '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!normalizedValue) {
    return 'Partner';
  }

  return normalizedValue;
}

function validateForm(form) {
  return DOCUMENT_FIELDS.reduce((errors, field) => {
    if (!form[field.key]) {
      errors[field.key] = FORM_ERROR_MESSAGES[field.key];
    }

    return errors;
  }, {});
}

export default function FormRegistrationIncomplete() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(createInitialForm);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const locale = params?.locale || 'id';
  const displayName = useMemo(
    () => getDisplayName(searchParams.get('name')),
    [searchParams]
  );

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      if (!(field in prev)) return prev;

      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleFileChange = useCallback(
    (field) => (event) => {
      const file = event.target.files?.[0] || null;

      setForm((prev) => ({
        ...prev,
        [field]: file,
      }));
      clearError(field);
    },
    [clearError]
  );

  const handleFileRemove = useCallback(
    (field) => () => {
      setForm((prev) => ({
        ...prev,
        [field]: null,
      }));
      clearError(field);
    },
    [clearError]
  );

  const handleSubmit = useCallback(() => {
    const nextErrors = validateForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitAttempted(true);
      setErrors(nextErrors);
      return;
    }

    setSubmitAttempted(false);
    setErrors({});

    console.log('[FormRegistrationIncomplete] Submitted:', {
      name: displayName,
      ...DOCUMENT_FIELDS.reduce((result, field) => {
        result[field.key] = form[field.key]?.name || null;
        return result;
      }, {}),
    });

    setSubmitted(true);
  }, [displayName, form]);

  useEffect(() => {
    if (!submitted) return;

    const encodedName = encodeURIComponent(displayName);
    router.push(`/${locale}/enterprise/form/success?name=${encodedName}`);
  }, [displayName, locale, router, submitted]);

  return (
    <section className="relative isolate overflow-hidden bg-[#f6f7fb] py-14 lg:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/80 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-[260px] w-[260px] rounded-full bg-[#ffb800]/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-headline-h3 font-bold leading-tight text-black">
            {`Hi, ${displayName}. Let's complete the following document uploads to complete the registration`}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-body-b4 text-secondary">
            Please complete the required document uploads below to finalize
            your registration
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-[20px] md:rounded-[32px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:p-8 lg:p-10">
          <div className="space-y-8">
            <div>
              <h2 className="text-headline-h6 font-bold text-black">
                Upload Documents
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {DOCUMENT_FIELDS.map((field) => (
                <InputFile
                  key={field.key}
                  id={field.id}
                  label={field.label}
                  required
                  value={form[field.key]}
                  onChange={handleFileChange(field.key)}
                  onRemove={handleFileRemove(field.key)}
                  error={errors[field.key]}
                  data-error={FORM_ERROR_MESSAGES[field.key]}
                  submitAttempted={submitAttempted}
                />
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" variant="warning" size="lg" onClick={handleSubmit}>
                Confirm & Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
