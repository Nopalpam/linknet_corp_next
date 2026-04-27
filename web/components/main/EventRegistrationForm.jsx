'use client';

import { useMemo, useState } from 'react';
import { createEventRegistration } from '@/lib/eventsApi';
import { formatEventTimestamp } from '@/lib/eventFormatters';

const INITIAL_PARTICIPANT = {
  name: '',
  email: '',
  phone: '',
  job_title: '',
};

const INITIAL_FORM = {
  company_name: '',
  company_email: '',
  company_phone: '',
  company_address: '',
  pic_name: '',
  pic_email: '',
  pic_phone: '',
  notes: '',
  participants: [{ ...INITIAL_PARTICIPANT }],
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EventRegistrationForm({ event }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const maxParticipants = useMemo(
    () => event?.maxRegisterParticipants || event?.max_register_participants || 1,
    [event]
  );

  const registrationCloseLabel = event?.registrationEndedTime || event?.registration_end_at
    ? formatEventTimestamp(event.registrationEndedTime || event.registration_end_at)
    : null;

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const setParticipantField = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.map((participant, participantIndex) => (
        participantIndex === index ? { ...participant, [key]: value } : participant
      )),
    }));
  };

  const addParticipant = () => {
    if (formData.participants.length >= maxParticipants) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, { ...INITIAL_PARTICIPANT }],
    }));
  };

  const removeParticipant = (index) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((_, participantIndex) => participantIndex !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) {
      return 'Company name is required.';
    }

    if (!formData.company_email.trim()) {
      return 'Company email is required.';
    }

    if (!isValidEmail(formData.company_email.trim())) {
      return 'Company email is invalid.';
    }

    if (!formData.pic_name.trim()) {
      return 'PIC name is required.';
    }

    if (!formData.pic_email.trim()) {
      return 'PIC email is required.';
    }

    if (!isValidEmail(formData.pic_email.trim())) {
      return 'PIC email is invalid.';
    }

    if (!formData.participants.length) {
      return 'At least one participant is required.';
    }

    if (formData.participants.length > maxParticipants) {
      return `Maximum ${maxParticipants} participants are allowed.`;
    }

    for (let index = 0; index < formData.participants.length; index += 1) {
      const participant = formData.participants[index];

      if (!participant.name.trim()) {
        return `Participant ${index + 1} name is required.`;
      }

      if (!participant.email.trim()) {
        return `Participant ${index + 1} email is required.`;
      }

      if (!isValidEmail(participant.email.trim())) {
        return `Participant ${index + 1} email is invalid.`;
      }
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        company_name: formData.company_name.trim(),
        company_email: formData.company_email.trim(),
        company_phone: formData.company_phone.trim(),
        company_address: formData.company_address.trim(),
        pic_name: formData.pic_name.trim(),
        pic_email: formData.pic_email.trim(),
        pic_phone: formData.pic_phone.trim(),
        notes: formData.notes.trim(),
        participants: formData.participants.map((participant) => ({
          name: participant.name.trim(),
          email: participant.email.trim(),
          phone: participant.phone.trim(),
          job_title: participant.job_title.trim(),
        })),
      };

      await createEventRegistration(event.slug, payload);
      setSuccessMessage('Registration submitted successfully. Our team will contact you if follow-up is needed.');
      setFormData(INITIAL_FORM);
    } catch (submitError) {
      setError(submitError.message || 'Failed to submit registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 md:px-0">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-neutral-200 bg-neutral-50 p-6 md:p-10">
          <div className="mb-8 max-w-3xl">
            <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-caption-c1 font-semibold uppercase tracking-[0.24em] text-yellow-800">
              Registration
            </span>
            <h2 className="mt-3 text-headline-h4 text-black">Register Your Team</h2>
            <p className="mt-3 text-body-b4 text-secondary">
              Submit one company registration with up to {maxParticipants} participant{maxParticipants > 1 ? 's' : ''}.
            </p>
            {registrationCloseLabel ? (
              <p className="mt-2 text-body-b5 text-secondary">Registration closes on {registrationCloseLabel}.</p>
            ) : null}
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-body-b5 text-red-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-body-b5 text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-body-b5 font-semibold text-black">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setField('company_name', e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                  placeholder="PT Example Indonesia"
                />
              </div>
              <div>
                <label className="mb-2 block text-body-b5 font-semibold text-black">Company Email</label>
                <input
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setField('company_email', e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                  placeholder="company@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-body-b5 font-semibold text-black">Company Phone</label>
                <input
                  type="text"
                  value={formData.company_phone}
                  onChange={(e) => setField('company_phone', e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                  placeholder="+62 812 3456 7890"
                />
              </div>
              <div>
                <label className="mb-2 block text-body-b5 font-semibold text-black">PIC Name</label>
                <input
                  type="text"
                  value={formData.pic_name}
                  onChange={(e) => setField('pic_name', e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                  placeholder="Primary contact person"
                />
              </div>
              <div>
                <label className="mb-2 block text-body-b5 font-semibold text-black">PIC Email</label>
                <input
                  type="email"
                  value={formData.pic_email}
                  onChange={(e) => setField('pic_email', e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                  placeholder="pic@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-body-b5 font-semibold text-black">PIC Phone</label>
                <input
                  type="text"
                  value={formData.pic_phone}
                  onChange={(e) => setField('pic_phone', e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                  placeholder="+62 812 3456 7890"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-body-b5 font-semibold text-black">Company Address</label>
                <textarea
                  rows={2}
                  value={formData.company_address}
                  onChange={(e) => setField('company_address', e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                  placeholder="Company office address"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-body-b3 font-bold text-black">Participants</h3>
                  <p className="text-body-b5 text-secondary">
                    Add up to {maxParticipants} participant{maxParticipants > 1 ? 's' : ''} for this registration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addParticipant}
                  disabled={formData.participants.length >= maxParticipants}
                  className="rounded-full border border-neutral-300 px-4 py-2 text-body-b5 font-semibold text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add Participant
                </button>
              </div>

              <div className="space-y-4">
                {formData.participants.map((participant, index) => (
                  <div key={`participant-${index}`} className="rounded-[24px] border border-neutral-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h4 className="text-body-b4 font-bold text-black">Participant {index + 1}</h4>
                      {formData.participants.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeParticipant(index)}
                          className="text-body-b5 font-semibold text-red-600 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-body-b5 font-semibold text-black">Name</label>
                        <input
                          type="text"
                          value={participant.name}
                          onChange={(e) => setParticipantField(index, 'name', e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-body-b5 font-semibold text-black">Email</label>
                        <input
                          type="email"
                          value={participant.email}
                          onChange={(e) => setParticipantField(index, 'email', e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-body-b5 font-semibold text-black">Phone</label>
                        <input
                          type="text"
                          value={participant.phone}
                          onChange={(e) => setParticipantField(index, 'phone', e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-body-b5 font-semibold text-black">Job Title</label>
                        <input
                          type="text"
                          value={participant.job_title}
                          onChange={(e) => setParticipantField(index, 'job_title', e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-body-b5 font-semibold text-black">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setField('notes', e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-body-b5 text-black outline-none transition focus:border-black"
                placeholder="Additional context or requirements"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6">
              <p className="text-body-b5 text-secondary">
                By submitting this form, you confirm the participant information is accurate.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center rounded-full bg-black px-6 py-3 text-body-b5 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}