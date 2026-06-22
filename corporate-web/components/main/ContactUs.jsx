'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Input from '../base/forms/Input';
import Select from '../base/forms/Select';
import Textarea from '../base/forms/Textarea';
import Icon from '../base/Icon'; 
import Button from '../base/Button';
import Intro from '../base/section/Intro';
import { fetchPublicContactSettings, normalizeContactSettings } from '@/lib/contactDataSource';
import { hasIntroContent } from '@/shared/presentation/intro';

const DEFAULT_FORM_FIELDS = {
  firstName: { label: 'First Name', required: true },
  lastName: { label: 'Last Name', required: true },
  email: { label: 'Email', required: true },
  phone: { label: 'Phone', required: true },
  role: { label: 'Role / Job Title', required: false },
  company: { label: 'Company / Organization', required: false },
  inquiry: { label: 'Inquiry type', required: true },
  subject: { label: 'Subject', required: true },
  message: { label: 'Message', required: true, maxlength: 500 },
};

function mergeFormFields(customFields) {
  const custom = customFields && typeof customFields === 'object' ? customFields : {};
  return Object.fromEntries(
    Object.entries(DEFAULT_FORM_FIELDS).map(([key, value]) => [
      key,
      { ...value, ...(custom[key] || {}) },
    ])
  );
}

export default function ContactUs({
  cmsData = null,
  settings = null,
  locale = 'en',
  className = '',
}) {
  const formRef = useRef(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [contactSettings, setContactSettings] = useState(() => normalizeContactSettings(settings || {}, locale));
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    role: '', company: '', inquiry: '', subject: '', message: '',
  });

  const inquiryOptions = [
    { label: 'Business Inquiry', value: 'BUSINESS' },
    { label: 'Technical Support', value: 'SUPPORT' },
    { label: 'Career', value: 'CAREER' },
    { label: 'Others', value: 'OTHERS' },
  ];

  const introData = useMemo(() => cmsData?.introData || cmsData?.sectionIntro || cmsData?.intro || null, [cmsData]);
  const formFields = useMemo(() => mergeFormFields(cmsData?.form_fields || cmsData?.formFields), [cmsData]);
  const hasContactData = Boolean(contactSettings.email || contactSettings.primaryPhone?.number || contactSettings.address);

  useEffect(() => {
    if (settings) {
      setContactSettings(normalizeContactSettings(settings, locale));
      return;
    }

    let alive = true;
    fetchPublicContactSettings(locale).then((nextSettings) => {
      if (alive) setContactSettings(nextSettings);
    });

    return () => {
      alive = false;
    };
  }, [locale, settings]);

  if (cmsData?.show === false) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('cu-', '');
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = (clearStatus = true) => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', role: '', company: '', inquiry: '', subject: '', message: '' });
    setSubmitAttempted(false);
    setFormResetKey((value) => value + 1);
    if (clearStatus) setSubmitStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitStatus(null);

    const form = formRef.current;
    const firstInvalid = form?.querySelector('.is-invalid .lnFormInput__control') || form?.querySelector(':invalid');
    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestId = globalThis.crypto?.randomUUID?.() || `contact-${Date.now()}`;
      const response = await fetch('/api/contact-us/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          company: formData.company,
          inquiryType: formData.inquiry,
          subject: formData.subject,
          message: formData.message,
        }),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok || json?.success === false) {
        const responseRequestId = response.headers.get('x-request-id') || json?.requestId || requestId;
        const message = json?.message || json?.error?.message || 'Failed to submit contact form.';
        throw new Error(`${message}${responseRequestId ? ` Request ID: ${responseRequestId}` : ''}`);
      }

      setSubmitStatus({ type: 'success', message: json?.message || 'Thank you for contacting us.' });
      resetForm(false);
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Failed to submit contact form.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`py-16 bg-light-2 ${className}`}>
      <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        <div className="w-full lg:w-5/12 pt-4">
          {hasIntroContent(introData) ? (
            <Intro
              as={introData.as || 'h2'}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || 'left'}
              className="!mb-10"
            />
          ) : (
            <>
              <h2 className="text-headline-h3 font-bold text-black mb-4 tracking-tight">We&apos;re Here to Help</h2>
              <p className="text-body-b4 text-secondary mb-10 leading-relaxed">
                We&apos;re here to assist you with any questions, concerns, or feedback you may have. Connect with us today!
              </p>
            </>
          )}

           {hasContactData && (
             <div className="text-neutral-400 font-regular text-body-b4 mb-6">For further inquiry,</div>
           )}

            <div className="flex flex-col gap-6">
              {contactSettings.email && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center shrink-0">
                    <Icon name="mail" className="text-neutral-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body-b5 text-secondary font-regular mb-1">Email Us</span>
                    <a href={contactSettings.emailHref} className="text-body-b4 font-medium text-black transition-colors">
                      {contactSettings.email}
                    </a>
                  </div>
                </div>
              )}

              {contactSettings.primaryPhone?.number && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center shrink-0">
                    <Icon name="phone" className="text-neutral-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body-b5 text-secondary font-regular mb-1">{contactSettings.primaryPhone.label || 'Phone Number'}</span>
                    <a href={contactSettings.phoneHref} className="text-body-b4 font-medium text-black transition-colors">
                      {contactSettings.primaryPhone.number}
                    </a>
                  </div>
                </div>
              )}

              {contactSettings.address && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center shrink-0">
                    <Icon name="pin-location" className="text-neutral-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body-b5 text-secondary font-regular mb-1">Registered Office</span>
                    <p className="text-body-b4 font-medium text-black transition-colors">
                      {contactSettings.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
        </div>

        <div className="w-full lg:w-7/12">
          <div className="bg-white rounded-[24px] p-6 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] shadow-lg">
            <h3 className="text-xl font-bold text-neutral-900 mb-8">Fill in the following data</h3>
            {submitStatus && (
              <div className={`mb-5 rounded-xl px-4 py-3 text-body-b5 ${
                submitStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {submitStatus.message}
              </div>
            )}

            <form key={formResetKey} id="applyForm" ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                
                <Input 
                  id="cu-firstName" label={formFields.firstName.label} required={formFields.firstName.required !== false}
                  data-error="First name is required."
                  value={formData.firstName} onChange={handleChange}
                  submitAttempted={submitAttempted} 
                />
                <Input 
                  id="cu-lastName" label={formFields.lastName.label} required={formFields.lastName.required !== false}
                  data-error="Last name is required."
                  value={formData.lastName} onChange={handleChange}
                  submitAttempted={submitAttempted}
                />

                <Input 
                  id="cu-email" type="email" label={formFields.email.label} required={formFields.email.required !== false}
                  data-error="Email is required." data-error-email="Invalid email format."
                  value={formData.email} onChange={handleChange}
                  submitAttempted={submitAttempted}
                />
                <Input 
                  id="cu-phone" type="tel" label={formFields.phone.label} required={formFields.phone.required !== false}
                  data-validate="phone" data-autofmt="phone"
                  data-error="Phone is required." data-error-phone="Must start with 0 and contain at least 10 digits."
                  value={formData.phone} onChange={handleChange}
                  submitAttempted={submitAttempted}
                />

                <Input id="cu-role" label={formFields.role.label} required={formFields.role.required === true} value={formData.role} onChange={handleChange} submitAttempted={submitAttempted} />
                <Input id="cu-company" label={formFields.company.label} required={formFields.company.required === true} value={formData.company} onChange={handleChange} submitAttempted={submitAttempted} />

                <div className="md:col-span-2">
                  <Select 
                    id="cu-inquiry" label={formFields.inquiry.label} options={inquiryOptions} required={formFields.inquiry.required !== false}
                    data-error="Please select one."
                    value={formData.inquiry} onChange={handleChange}
                    submitAttempted={submitAttempted}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    id="cu-subject"
                    label={formFields.subject.label}
                    required={formFields.subject.required !== false}
                    data-error="Subject is required."
                    value={formData.subject}
                    onChange={handleChange}
                    submitAttempted={submitAttempted}
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea 
                    id="cu-message" label={formFields.message.label} maxLength={Number(formFields.message.maxlength || formFields.message.maxLength || 500)} required={formFields.message.required !== false}
                    data-error="Message is required."
                    value={formData.message} onChange={handleChange}
                    submitAttempted={submitAttempted}
                  />
                </div>

              </div>

              <div className="flex gap-4 justify-end mt-4">
                <Button 
                  type="reset"
                  variant='secondary-outline' 
                  size='lg'
                  onClick={() => resetForm()}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button
                  variant='primary'
                  size='lg' 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
