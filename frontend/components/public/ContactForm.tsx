'use client';

import { motion } from 'framer-motion';
import { ContactFormData } from '@/types/component';
import { useState, FormEvent } from 'react';

interface ContactFormProps {
  data: ContactFormData;
}

interface ContactFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  inquiryType: 'BUSINESS' | 'SUPPORT' | 'CAREER' | 'OTHERS' | '';
  message: string;
}

export default function ContactForm({ data }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    company: '',
    inquiryType: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact-us/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Thank you for contacting us! We will get back to you soon.',
        });

        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: '',
          company: '',
          inquiryType: '',
          message: '',
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Failed to submit form. Please try again.',
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-form py-5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="row justify-content-center"
        >
          <div className="col-lg-8">
            {data.show_title && data.title && (
              <h2 className="text-center mb-3">{data.title}</h2>
            )}
            {data.description && (
              <p className="text-center text-muted mb-4">{data.description}</p>
            )}
            
            {/* Status Messages */}
            {submitStatus.type && (
              <div
                className={`alert ${
                  submitStatus.type === 'success' ? 'alert-success' : 'alert-danger'
                } alert-dismissible fade show`}
                role="alert"
              >
                {submitStatus.message}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSubmitStatus({ type: null, message: '' })}
                  aria-label="Close"
                ></button>
              </div>
            )}
            
            {/* Contact Form */}
            <form className="card p-4 shadow-sm" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="firstName" className="form-label">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="lastName" className="form-label">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g., IT Manager"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="company" className="form-label">
                    Company
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="inquiryType" className="form-label">
                  Inquiry Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select inquiry type</option>
                  <option value="BUSINESS">Business Inquiry</option>
                  <option value="SUPPORT">Technical Support</option>
                  <option value="CAREER">Career Opportunities</option>
                  <option value="OTHERS">Others</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="message" className="form-label">
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

