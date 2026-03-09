'use client';

import React, { useState, useRef } from 'react';
import Input from '../base/forms/Input';
import Select from '../base/forms/Select';
import Textarea from '../base/forms/Textarea';
import Checkbox from '../base/forms/Checkbox';           // <--- Import Checkbox
import SelectMultiple from '../base/forms/SelectMultiple'; // <--- Import SelectMultiple
import Icon from '../base/Icon'; 
import Button from '../base/Button';

export default function ContactUs() {
  const formRef = useRef(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // 1. Tambahkan state untuk solutions (array) dan agreeTerms (boolean)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    role: '', company: '', inquiry: '', message: '',
    solutions: [], 
    agreeTerms: false 
  });

  const inquiryOptions = [
    { label: 'Business Inquiry', value: 'business' },
    { label: 'Technical Support', value: 'support' },
    { label: 'Career', value: 'career' },
    { label: 'Others', value: 'others' },
  ];

  // Opsi untuk Select Multiple
  const solutionOptions = [
    { label: 'Data Center', value: 'data-center' },
    { label: 'CTIP', value: 'ctip' },
    { label: 'Anti-DDoS', value: 'anti-ddos' },
    { label: 'Cloud Services', value: 'cloud' },
    { label: 'Network Firewall', value: 'firewall' },
  ];

  const handleChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('cu-', '');
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true); 

    // Validasi manual untuk SelectMultiple jika dianggap wajib (required)
    // Karena SelectMultiple kita custom div, browser tidak bisa menahannya secara otomatis
    const isSolutionsEmpty = formData.solutions.length === 0;

    setTimeout(() => {
      const form = formRef.current;
      const firstInvalid = form.querySelector('.is-invalid .lnFormInput__control') || form.querySelector(':invalid');
      
      // Cek apakah form native tidak valid ATAU select multiple kosong
      if (firstInvalid || isSolutionsEmpty) {
        if (firstInvalid) {
          firstInvalid.focus({ preventScroll: true });
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (isSolutionsEmpty) {
          // Jika hanya Select Multiple yang error, scroll ke sana
          const smEl = document.getElementById('cu-solutions-wrap');
          smEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Lolos Validasi!
        console.log('Valid Form Submitted:', formData);
        alert("Form berhasil dikirim!");
      }
    }, 50);
  };

  return (
    <section className="py-16 bg-light-2">
      <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* --- KIRI: Info Kontak --- */}
        <div className="w-full lg:w-5/12 pt-4">
           <h2 className="text-headline-h3 font-bold text-black mb-4 tracking-tight">We're Here to Help</h2>
           <p className="text-body-b4 text-secondary mb-10 leading-relaxed">
             We're here to assist you with any questions, concerns, or feedback you may have. Connect with us today!
           </p>

           <div className="text-neutral-400 font-regular text-body-b4 mb-6">For further inquiry,</div>

            <div className="flex flex-col gap-6">
              {/* Item: Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center shrink-0">
                  <Icon name="mail" className="text-neutral-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-body-b5 text-secondary font-regular mb-1">Email Us</span>
                  <a href="mailto:corporate.secretary@linknet.co.id" className="text-body-b4 font-medium text-black transition-colors">
                    corporate.secretary@linknet.co.id
                  </a>
                </div>
              </div>

              {/* Item: Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center shrink-0">
                  <Icon name="phone" className="text-neutral-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-body-b5 text-secondary font-regular mb-1">Phone Number</span>
                  <a href="tel:02129536800" className="text-body-b4 font-medium text-black transition-colors">
                    021-29536800
                  </a>
                </div>
              </div>

              {/* Item: Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center shrink-0">
                  <Icon name="pin-location" className="text-neutral-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-body-b5 text-secondary font-regular mb-1">Registered Office</span>
                  <p href="tel:02129536800" className="text-body-b4 font-medium text-black transition-colors">
                    Centennial Tower Lantai 26, Unit D. Jl. Jenderal Gatot Subroto Kav. 24-25 Jakarta 12930, Indonesia
                  </p>
                </div>
              </div>


            </div>
        </div>

        {/* --- KANAN: Form Card --- */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white rounded-[24px] p-6 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] shadow-lg">
            <h3 className="text-xl font-bold text-neutral-900 mb-8">Fill in the following data</h3>

            <form id="applyForm" ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                
                <Input 
                  id="cu-firstName" label="First Name" required 
                  data-error="First name is required."
                  value={formData.firstName} onChange={handleChange}
                  submitAttempted={submitAttempted} 
                />
                <Input 
                  id="cu-lastName" label="Last Name" required 
                  data-error="Last name is required."
                  value={formData.lastName} onChange={handleChange}
                  submitAttempted={submitAttempted}
                />

                <Input 
                  id="cu-email" type="email" label="Email" required 
                  data-error="Email is required." data-error-email="Invalid email format."
                  value={formData.email} onChange={handleChange}
                  submitAttempted={submitAttempted}
                />
                <Input 
                  id="cu-phone" type="tel" label="Phone" required 
                  data-validate="phone" data-autofmt="phone"
                  data-error="Phone is required." data-error-phone="Must start with 0 and contain at least 10 digits."
                  value={formData.phone} onChange={handleChange}
                  submitAttempted={submitAttempted}
                />

                <Input id="cu-role" label="Role / Job Title" value={formData.role} onChange={handleChange} submitAttempted={submitAttempted} />
                <Input id="cu-company" label="Company / Organization" value={formData.company} onChange={handleChange} submitAttempted={submitAttempted} />

                <div className="md:col-span-2">
                  <Select 
                    id="cu-inquiry" label="Inquiry type" options={inquiryOptions} required 
                    data-error="Please select one."
                    value={formData.inquiry} onChange={handleChange}
                    submitAttempted={submitAttempted}
                  />
                </div>

                {/* --- 2. SELECT MULTIPLE DI SINI --- */}
                <div className="md:col-span-2" id="cu-solutions-wrap">
                  <SelectMultiple 
                    id="cu-solutions" 
                    label="Solutions of Interest" 
                    options={solutionOptions} 
                    required 
                    selectedValues={formData.solutions} 
                    onChange={(newValues) => setFormData(prev => ({ ...prev, solutions: newValues }))}
                    // Trigger error merah dari parent state
                    error={submitAttempted && formData.solutions.length === 0 ? "Please select at least one solution." : ""}
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea 
                    id="cu-message" label="Message" maxLength={500} required 
                    data-error="Message is required."
                    value={formData.message} onChange={handleChange}
                    submitAttempted={submitAttempted}
                  />
                </div>

              </div>

              {/* --- 3. CHECKBOX AGREEMENT DI SINI --- */}
              <div className="mt-6 mb-8">
                <Checkbox 
                  id="cu-agreeTerms"
                  label="I acknowledge that I have read, understood, and agreed to the applicable Terms & Conditions and Privacy Policy."
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                />
                {/* Pesan error manual untuk Checkbox jika dibutuhkan */}
                {submitAttempted && !formData.agreeTerms && (
                  <p className="text-sm text-red-500 mt-2 px-4">You must agree to the Terms & Conditions.</p>
                )}
              </div>

              <div className="flex gap-4 justify-end mt-4">
                <Button 
                  type="reset"
                  variant='secondary-outline' 
                  size='lg'
                  onClick={() => { 
                    setFormData({ firstName: '', lastName: '', email: '', phone: '', role: '', company: '', inquiry: '', message: '', solutions: [], agreeTerms: false }); 
                    setSubmitAttempted(false); 
                  }} 
                >
                  Reset
                </Button>
                <Button
                  variant='primary'
                  size='lg' 
                  type="submit"
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}