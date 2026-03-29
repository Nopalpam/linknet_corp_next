'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

import Input from '../base/forms/Input';
import Select from '../base/forms/Select';
import Textarea from '../base/forms/Textarea';
import SelectMultiple from '../base/forms/SelectMultiple';
import Icon from '../base/Icon'; 
import Button from '../base/Button';

// --- DATA DUMMY ---
const departmentOptions = [
  { label: 'Management', value: 'management' },
  { label: 'IT Services', value: 'it' },
  { label: 'Finance', value: 'finance' },
];

const roleOptions = [
  { label: 'Manager', value: 'manager' },
  { label: 'Staff / Executive', value: 'staff' },
];

const industryOptions = [
  { label: 'Financial Service', value: 'finance' },
  { label: 'Manufacturing', value: 'manufacturing' },
];

const areaOptions = [
  { label: 'Jawa Barat, Kota Bekasi, Mustika', value: 'jabar_bekasi' },
  { label: 'DKI Jakarta, Jakarta Selatan', value: 'dki_jaksel' },
];

const solutionOptions = [
  { label: 'Cloud', value: 'cloud' },
  { label: 'Corporate TV', value: 'corporate_tv' },
  { label: 'Data Center', value: 'data_center' },
  { label: 'Data Communication', value: 'data_comm' },
  { label: 'Internet', value: 'internet' },
  { label: 'IoT', value: 'iot' },
];

export default function OmniChannelWidget({ className = "" }) {
  // --- STATES ---
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); 
  const [currentTab, setCurrentTab] = useState('live_chat'); 
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', department: '', roleTitle: '',
    companyName: '', businessIndustry: '', provinceCityZip: '', detailAddress: '',
    solutions: []
  });

  // --- REFS ---
  const widgetRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const formRef = useRef(null);

  // --- ANIMASI WIDGET BUKA/TUTUP ---
  useEffect(() => {
    if (!widgetRef.current) return;
    if (isOpen) {
      gsap.to(widgetRef.current, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.1)", pointerEvents: "auto" });
    } else {
      gsap.to(widgetRef.current, { y: 30, scale: 0.95, opacity: 0, duration: 0.3, ease: "power2.in", pointerEvents: "none" });
    }
  }, [isOpen]);

  // --- ANIMASI PINDAH STEP ---
  useEffect(() => {
    if (!contentWrapperRef.current) return;
    gsap.fromTo(contentWrapperRef.current, 
      { opacity: 0, x: 15 },
      { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
    );
  }, [currentStep, currentTab]);

  // --- HANDLERS ---
  const handleToggleWidget = () => {
    if (!isOpen) {
      setCurrentStep(0);
      setSubmitAttempted(false);
    }
    setIsOpen(!isOpen);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('cu-', '');
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (e.currentTarget.checkValidity()) {
      setSubmitAttempted(false);
      setCurrentStep(prev => prev + 1);
    } else {
      const firstInvalid = formRef.current?.querySelector('.is-invalid .lnFormInput__control') || formRef.current?.querySelector(':invalid');
      firstInvalid?.focus({ preventScroll: true });
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const isSolutionsEmpty = formData.solutions.length === 0;

    if (e.currentTarget.checkValidity() && !isSolutionsEmpty) {
      setSubmitAttempted(false);
      // Masuk ke Step 4 (Waiting Chat)
      setCurrentStep(4);
      
      // Simulasi timer untuk masuk ke Step 5 (Leave Confirmation) setelah 5 detik
      setTimeout(() => {
        setCurrentStep(5);
      }, 5000);

    } else if (isSolutionsEmpty) {
      const smEl = document.getElementById('cu-solutions-wrap');
      smEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // --- RENDER UI BLOCKS ---
  const renderAvatars = () => (
    <div className="flex -space-x-3 shrink-0">
      <div className="w-8 h-8 rounded-full border-2 border-white bg-neutral-200 overflow-hidden"><img src="/assets/images/agent-1.jpg" alt="A" className="w-full h-full object-cover" /></div>
      <div className="w-8 h-8 rounded-full border-2 border-white bg-neutral-200 overflow-hidden"><img src="/assets/images/agent-2.jpg" alt="A" className="w-full h-full object-cover" /></div>
      <div className="w-8 h-8 rounded-full border-2 border-white bg-neutral-200 overflow-hidden"><img src="/assets/images/agent-3.jpg" alt="A" className="w-full h-full object-cover" /></div>
    </div>
  );

  const renderTabs = () => (
    <div className="bg-neutral-100/80 p-1.5 rounded-full flex mb-6 shrink-0 mt-2">
      <button
        type="button"
        onClick={() => setCurrentTab('live_chat')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all ${currentTab === 'live_chat' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
      >
        <Icon name="chat" className={`w-4 h-4 ${currentTab === 'live_chat' ? 'text-yellow-500' : ''}`} />
        Live Chat
      </button>
      <button
        type="button"
        onClick={() => setCurrentTab('whatsapp')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all ${currentTab === 'whatsapp' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
      >
        <Icon name="whatsapp" className={`w-4 h-4 ${currentTab === 'whatsapp' ? 'text-green-500' : ''}`} />
        Whatsapp
      </button>
    </div>
  );

  const renderHeader = () => {
    if (currentStep === 0) {
      return (
        <button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-800 bg-transparent rounded-full transition-colors z-10">
          <Icon name="close" className="w-5 h-5" />
        </button>
      );
    }

    if (currentStep >= 4) {
      // Header untuk Waiting / Leave
      return (
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-white shrink-0">
          <p className="text-base font-bold text-neutral-900">Waiting to Chat</p>
          <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-800 transition-colors">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
      );
    }

    // Header untuk Step 1, 2, 3
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {renderAvatars()}
          <div>
            <p className="text-sm font-bold text-neutral-900">Linknet Enterprise</p>
            <p className="text-xs font-medium text-neutral-500 flex items-center gap-1">
              <Icon name="clock" className="w-3 h-3" /> a few minutes
            </p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-800 transition-colors">
          <Icon name="close" className="w-6 h-6" />
        </button>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // INTRO
        return (
          <div className="p-6 pt-8">
            <div className="mb-8">
              <Icon name="chat" className="w-12 h-12 text-yellow-500 mb-6" />
              <h2 className="text-3xl font-bold text-neutral-900 mb-3 leading-tight tracking-tight">Let's start new chat with our Expert Team</h2>
              <p className="text-base text-neutral-500 mb-8 font-medium">How can we help you today?</p>
              
              <ul className="space-y-4 text-sm text-neutral-700 font-medium">
                <li className="flex items-start gap-3">
                  <Icon name="check" className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" /> Ask for our product details now
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" /> Schedule a Demo of our featured products today
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check" className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" /> Our Professional Support Team is ready to serve you 24/7
                </li>
              </ul>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-bold text-neutral-900">Start a Conversation</p>
                  <p className="text-xs font-medium text-neutral-500 flex items-center gap-1 mt-0.5">
                    <Icon name="clock" className="w-3 h-3" /> a few minutes
                  </p>
                </div>
                {renderAvatars()}
              </div>
              <Button 
                variant="primary" size="lg" className="w-full mb-3 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 border-none shadow-sm rounded-xl"
                onClick={() => { setCurrentTab('live_chat'); setCurrentStep(1); }}
              >
                <Icon name="chat" className="w-5 h-5" /> Start Conversation
              </Button>
              <Button 
                variant="secondary-outline" size="lg" className="w-full bg-white border border-neutral-200 text-green-600 hover:bg-green-50 flex items-center justify-center gap-2 rounded-xl"
                onClick={() => { setCurrentTab('whatsapp'); setCurrentStep(1); }}
              >
                <Icon name="whatsapp" className="w-5 h-5" /> Send us a Whatsapp
              </Button>
            </div>
          </div>
        );

      case 1: // STEP 1: Personal Data
        return (
          <form ref={formRef} onSubmit={handleNextStep} noValidate className="px-6 pb-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            {renderTabs()}
            <div className="flex flex-col gap-5">
              <Input id="cu-firstName" label="First Name*" required value={formData.firstName} onChange={handleChange} submitAttempted={submitAttempted} />
              <Input id="cu-lastName" label="Last Name*" required value={formData.lastName} onChange={handleChange} submitAttempted={submitAttempted} />
              <Input id="cu-email" type="email" label="Company Email*" required value={formData.email} onChange={handleChange} submitAttempted={submitAttempted} />
              <Input id="cu-phone" type="tel" label="Phone Number*" required value={formData.phone} onChange={handleChange} submitAttempted={submitAttempted} />
              <Select id="cu-department" label="Department*" options={departmentOptions} required value={formData.department} onChange={handleChange} submitAttempted={submitAttempted} />
              <Select id="cu-roleTitle" label="Your Role / Title*" options={roleOptions} required value={formData.roleTitle} onChange={handleChange} submitAttempted={submitAttempted} />
              
              <div className="mt-2 flex gap-3">
                <Button variant="secondary-outline" size="lg" type="button" onClick={() => setCurrentStep(0)} className="flex-1 bg-white border-neutral-200 rounded-xl">Previous</Button>
                <Button variant="primary" size="lg" type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 border-none shadow-sm rounded-xl">Next</Button>
              </div>
            </div>
          </form>
        );

      case 2: // STEP 2: Company Data
        return (
          <form ref={formRef} onSubmit={handleNextStep} noValidate className="px-6 pb-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            {renderTabs()}
            <div className="flex flex-col gap-5">
              <Input id="cu-companyName" label="Company Name*" required value={formData.companyName} onChange={handleChange} submitAttempted={submitAttempted} />
              <Select id="cu-businessIndustry" label="Business Industry*" options={industryOptions} required value={formData.businessIndustry} onChange={handleChange} submitAttempted={submitAttempted} />
              <Select id="cu-provinceCityZip" label="Province, City, ZIP Code*" options={areaOptions} required value={formData.provinceCityZip} onChange={handleChange} submitAttempted={submitAttempted} />
              <Textarea id="cu-detailAddress" label="Detail Address" maxLength={200} required value={formData.detailAddress} onChange={handleChange} submitAttempted={submitAttempted} />

              <div className="mt-2 flex gap-3">
                <Button variant="secondary-outline" size="lg" type="button" onClick={() => setCurrentStep(1)} className="flex-1 bg-white border-neutral-200 rounded-xl">Previous</Button>
                <Button variant="primary" size="lg" type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 border-none shadow-sm rounded-xl">Next</Button>
              </div>
            </div>
          </form>
        );

      case 3: // STEP 3: Solutions
        return (
          <form ref={formRef} onSubmit={handleFinalSubmit} noValidate className="px-6 pb-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            {renderTabs()}
            <div className="flex flex-col gap-5">
              
              <div>
                <p className="text-sm font-bold text-neutral-900 mb-3">Choose a Solutions</p>
                {/* Search Simulation */}
                <div className="relative mb-4">
                   <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                     <Icon name="search" className="w-4 h-4 text-neutral-400" />
                   </div>
                   <input type="text" placeholder="Search Quickly Here" className="w-full pl-4 pr-10 py-2.5 rounded-full border border-neutral-200 text-sm focus:outline-none focus:border-yellow-400" />
                </div>

                <div id="cu-solutions-wrap">
                  <SelectMultiple 
                    id="cu-solutions" 
                    options={solutionOptions} 
                    required 
                    selectedValues={formData.solutions} 
                    onChange={(newValues) => setFormData(prev => ({ ...prev, solutions: newValues }))}
                    error={submitAttempted && formData.solutions.length === 0 ? "Please select at least one solution." : ""}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button variant="secondary-outline" size="lg" type="button" onClick={() => setCurrentStep(2)} className="flex-1 bg-white border-neutral-200 rounded-xl">Previous</Button>
                <Button variant="primary" size="lg" type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 border-none shadow-sm rounded-xl">Start</Button>
              </div>
            </div>
          </form>
        );

      case 4: // STEP 4: WAITING
        return (
          <div className="flex flex-col items-center justify-center h-[400px] px-6 text-center">
             <h3 className="text-2xl font-bold text-neutral-900 mb-2">Hello, {formData.firstName || 'Guest'}!</h3>
             <p className="text-base text-neutral-500 font-medium mb-4">An agent is on the way</p>
             <div className="flex space-x-2 mb-12">
                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>

             <button type="button" onClick={() => setCurrentStep(5)} className="text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 py-2.5 px-6 rounded-full transition-colors">
               Cancel Chat Request
             </button>
          </div>
        );

      case 5: // STEP 5: LEAVE
        return (
          <div className="flex flex-col items-center justify-center h-[400px] px-8 text-center">
             <h3 className="text-2xl font-bold text-neutral-900 mb-4">Leave?</h3>
             <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-10">
               No one is available to chat. Try again later.<br />
               If you leave now, you'll lose your place in line to chat.
             </p>

             <div className="w-full flex flex-col gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="text-red-500 hover:text-red-600 font-bold text-sm py-2">
                  Leave
                </button>
                <Button variant="primary" size="lg" onClick={() => setCurrentStep(4)} className="w-full bg-yellow-400 hover:bg-yellow-500 text-neutral-900 border-none shadow-sm rounded-xl">
                  Continue to Wait
                </Button>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed z-[100] ${className}`}>
      
      {/* --- WIDGET CONTAINER --- */}
      <div 
        ref={widgetRef}
        className="fixed bottom-0 right-0 w-full h-[100dvh] md:bottom-28 md:right-8 md:w-[420px] md:h-auto md:max-h-[750px] bg-white md:rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden opacity-0 pointer-events-none translate-y-5 border border-neutral-200"
      >
        {renderHeader()}
        
        {/* CONTENT AREA */}
        <div className="flex-1 relative bg-white" ref={contentWrapperRef}>
          {renderStepContent()}
        </div>
      </div>

      {/* --- FLOATING BUTTON (TRIGGER) --- */}
      <button 
        onClick={handleToggleWidget} 
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 rounded-full bg-yellow-400 text-neutral-900 flex items-center justify-center shadow-[0_8px_24px_rgba(250,204,21,0.4)] transition-transform duration-300 hover:scale-110 active:scale-95 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Icon name="chat" className="w-8 h-8" />
      </button>
      
    </div>
  );
}