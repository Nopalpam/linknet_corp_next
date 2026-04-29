'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

import Input         from '../base/forms/Input';
import Select        from '../base/forms/Select';
import Textarea      from '../base/forms/Textarea';
import Icon          from '../base/Icon';
import Button        from '../base/Button';
import SegmentPicker from '../base/forms/SegmentPicker';

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────
const LiveChatIcon = () => (
  <img src="/assets/icons/chat-yellow.svg" className="w-6 h-6 mr-0.5" alt="Chat" />
);

const WhatsappIcon = () => (
  <img src="/assets/icons/whatsapp-color.svg" className="w-6 h-6 mr-0.5" alt="Whatsapp" />
);

const TAB_OPTIONS = [
  { label: 'Live Chat', value: 'live_chat', icon: <LiveChatIcon /> },
  { label: 'Whatsapp',  value: 'whatsapp',  icon: <WhatsappIcon /> },
];

const departmentOptions = [
  { label: 'Management',  value: 'management' },
  { label: 'IT Services', value: 'it'         },
  { label: 'Finance',     value: 'finance'    },
  { label: 'Operations',  value: 'operations' },
];

const roleOptions = [
  { label: 'Manager',           value: 'manager'  },
  { label: 'Staff / Executive', value: 'staff'    },
  { label: 'Director',          value: 'director' },
  { label: 'C-Level',           value: 'clevel'   },
];

const industryOptions = [
  { label: 'Financial Service', value: 'finance'       },
  { label: 'Manufacturing',     value: 'manufacturing' },
  { label: 'Retail & Commerce', value: 'retail'        },
  { label: 'Technology',        value: 'tech'          },
];

const provinceOptions = [
  { label: 'Jawa Barat',  value: 'jabar'  },
  { label: 'DKI Jakarta', value: 'dki'    },
  { label: 'Jawa Tengah', value: 'jateng' },
  { label: 'Jawa Timur',  value: 'jatim'  },
  { label: 'Banten',      value: 'banten' },
];

const cityByProvince = {
  jabar:  [{ label: 'Kota Bekasi',     value: 'bekasi'    }, { label: 'Kota Bandung',  value: 'bandung'  }, { label: 'Kota Bogor',  value: 'bogor'  }],
  dki:    [{ label: 'Jakarta Selatan', value: 'jaksel'    }, { label: 'Jakarta Pusat', value: 'jakpus'   }, { label: 'Jakarta Utara', value: 'jakut' }],
  jateng: [{ label: 'Kota Semarang',   value: 'semarang'  }, { label: 'Kota Solo',     value: 'solo'     }],
  jatim:  [{ label: 'Kota Surabaya',   value: 'surabaya'  }, { label: 'Kota Malang',   value: 'malang'   }],
  banten: [{ label: 'Kota Tangerang',  value: 'tangerang' }, { label: 'Kota Cilegon',  value: 'cilegon'  }],
};

const zipByCity = {
  bekasi:    [{ label: '17113 – Mustika Jaya', value: '17113' }, { label: '17114 – Mustikasari', value: '17114' }],
  bandung:   [{ label: '40111', value: '40111' }, { label: '40112', value: '40112' }],
  bogor:     [{ label: '16111', value: '16111' }],
  jaksel:    [{ label: '12110', value: '12110' }, { label: '12120', value: '12120' }],
  jakpus:    [{ label: '10110', value: '10110' }],
  jakut:     [{ label: '14110', value: '14110' }],
  semarang:  [{ label: '50111', value: '50111' }],
  solo:      [{ label: '57111', value: '57111' }],
  surabaya:  [{ label: '60111', value: '60111' }],
  malang:    [{ label: '65111', value: '65111' }],
  tangerang: [{ label: '15111', value: '15111' }],
  cilegon:   [{ label: '42411', value: '42411' }],
};

const solutionOptions = [
  { label: 'Cloud',              value: 'cloud'        },
  { label: 'Corporate TV',       value: 'corporate_tv' },
  { label: 'Data Center',        value: 'data_center'  },
  { label: 'Data Communication', value: 'data_comm'    },
  { label: 'Internet',           value: 'internet'     },
  { label: 'IoT',                value: 'iot'          },
];

const INITIAL_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  department: '', roleTitle: '',
  companyName: '', businessIndustry: '',
  province: '', city: '', zip: '',
  detailAddress: '',
  solutions: [],
};

// ─────────────────────────────────────────────────────────────
// AVATAR GROUP
// ─────────────────────────────────────────────────────────────
function AvatarGroup({ size = 32 }) {
  const bg      = ['#ffffff', '#ffffff', '#ffffff'];
  const letters = ['A', 'B', 'C'];
  return (
    <div className="flex shrink-0">
      {letters.map((l, i) => (
        <div
          key={i}
          className="rounded-full border-2 border-white overflow-hidden flex items-center justify-center font-bold shadow-lg text-white relative"
          style={{
            width: size, height: size,
            backgroundColor: bg[i],
            marginLeft: i === 0 ? 0 : -(size * 0.28),
            fontSize: size * 0.34,
            zIndex: letters.length - i,
          }}
        >
          <img
            src={`/assets/photos/cs/cs-${i + 1}.jpg`}
            alt={l}
            onError={e => { e.currentTarget.style.display = 'none'; }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {l}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SOLUTION PICKER
// ─────────────────────────────────────────────────────────────
function SolutionPicker({ selectedValues = [], onChange, error = '' }) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? solutionOptions.filter(opt =>
        selectedValues.includes(opt.value) ||
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : solutionOptions;

  const toggle = (val) => {
    onChange(
      selectedValues.includes(val)
        ? selectedValues.filter(v => v !== val)
        : [...selectedValues, val]
    );
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative">
        <input
          type="text"
          placeholder="Search Quickly Here"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-neutral-100 rounded-[12px] text-body-b5 outline-none focus:border-yellow-400 transition-colors text-neutral-700 placeholder:text-neutral-400"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex">
          <Icon name="search" style={{ '--icon-size': '20px' }} />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(opt => {
          const checked = selectedValues.includes(opt.value);
          return (
            <div
              key={opt.value}
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggle(opt.value)}
              className={`
                flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer select-none transition-all
                ${checked ? 'bg-emerald-50' : 'bg-white hover:bg-neutral-50'}
              `}
            >
              <span className={`
                w-5 h-5 rounded-[5px] flex border items-center justify-center shrink-0 transition-all
                ${checked ? 'bg-green-500 border-green-500' : 'bg-white border-neutral-200'}
              `}>
                {checked && <Icon name="check" className="w-3 h-3 text-white" />}
              </span>
              <span className={`text-body-b5 ${checked ? 'font-medium text-black' : 'font-medium text-neutral-700'}`}>
                {opt.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function OmniFloatingWidget({ cmsData, className = '' }) {
  const cfg = cmsData || {};
  const enabled = cfg.enabled !== false && cfg.enabled !== 'false';
  const widgetTitle = cfg.title || "Let's start new chat";
  const widgetSubtitle = cfg.subtitle || 'How can we help you today?';
  const whatsappUrl = cfg.whatsappUrl || 'https://wa.me/628111700700';
  const submitEndpoint = cfg.submitEndpoint || '';
  const [isOpen, setIsOpen]                   = useState(false);
  const [currentStep, setCurrentStep]         = useState(0);
  const [currentTab, setCurrentTab]           = useState('live_chat');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formData, setFormData]               = useState({ ...INITIAL_FORM });

  const widgetRef    = useRef(null);
  const overlayRef   = useRef(null);
  const contentRef   = useRef(null);
  const step1FormRef = useRef(null);
  const step2FormRef = useRef(null);
  const step3FormRef = useRef(null);

  // Refs untuk elemen GSAP di StepIntro
  const introIconRef    = useRef(null);
  const introTitleRef   = useRef(null);
  const introSubRef     = useRef(null);
  const introListRef    = useRef(null);
  const introCardRef    = useRef(null);

  // ── Open / close animation — slide-up on mobile, scale on desktop
  useEffect(() => {
    if (!widgetRef.current || !overlayRef.current) return;
    const isMobile = window.innerWidth < 768;

    if (isOpen) {
      // Show overlay — mobile only
      if (window.innerWidth < 768) overlayRef.current.style.display = 'block';
      // Show widget
      widgetRef.current.style.display = 'flex';

      if (isMobile) {
        widgetRef.current.style.transition = 'none';
        widgetRef.current.style.transform  = 'translateY(100%)';
        widgetRef.current.style.opacity    = '1';
      } else {
        widgetRef.current.style.transition = 'none';
        widgetRef.current.style.transform  = 'translateY(20px) scale(0.97)';
        widgetRef.current.style.opacity    = '0';
      }

      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!widgetRef.current || !overlayRef.current) return;
        const transition = isMobile
          ? 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
          : 'opacity 0.25s ease, transform 0.25s ease';
        widgetRef.current.style.transition    = transition;
        widgetRef.current.style.transform     = isMobile ? 'translateY(0)' : 'translateY(0) scale(1)';
        widgetRef.current.style.opacity       = '1';
        widgetRef.current.style.pointerEvents = 'auto';
        overlayRef.current.style.transition   = 'opacity 0.3s ease';
        overlayRef.current.style.opacity      = '1';
      }));
    } else {
      const isMobileClose = window.innerWidth < 768;
      if (isMobileClose) {
        widgetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
        widgetRef.current.style.transform  = 'translateY(100%)';
      } else {
        widgetRef.current.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        widgetRef.current.style.opacity    = '0';
        widgetRef.current.style.transform  = 'translateY(20px) scale(0.97)';
      }
      widgetRef.current.style.pointerEvents = 'none';
      overlayRef.current.style.transition   = 'opacity 0.3s ease';
      overlayRef.current.style.opacity      = '0';
      const t = setTimeout(() => {
        if (widgetRef.current)  widgetRef.current.style.display  = 'none';
        if (overlayRef.current) overlayRef.current.style.display = 'none';
      }, 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ── Step transition animation (GSAP)
  useEffect(() => {
    if (!contentRef.current || !isOpen) return;
    gsap.fromTo(contentRef.current,
      { opacity: 0, x: 12 },
      { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }
    );
  }, [currentStep]);

  // ── StepIntro entrance animation (GSAP stagger) — runs when step 0 becomes visible
  useEffect(() => {
    if (!isOpen || currentStep !== 0) return;

    // Small delay to let the widget open animation finish first
    const delay = window.innerWidth < 768 ? 0.38 : 0.28;

    const targets = [
      introIconRef.current,
      introTitleRef.current,
      introSubRef.current,
      introListRef.current,
      introCardRef.current,
    ].filter(Boolean);

    // Set initial state
    gsap.set(targets, { opacity: 0, y: 18 });

    // Stagger reveal
    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: 'power3.out',
      stagger: 0.07,
      delay,
    });
  }, [isOpen, currentStep]);

  // ── Handlers
  const handleClose = () => setIsOpen(false);

  const handleToggle = () => {
    if (!isOpen) {
      setCurrentStep(0);
      setSubmitAttempted(false);
    }
    setIsOpen(v => !v);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('cu-', '');
    if (key === 'province') {
      setFormData(prev => ({ ...prev, province: value, city: '', zip: '' }));
    } else if (key === 'city') {
      setFormData(prev => ({ ...prev, city: value, zip: '' }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const goNext = (formRef) => {
    setSubmitAttempted(true);
    const form = formRef.current;
    if (!form) return;
    if (form.checkValidity()) {
      setSubmitAttempted(false);
      setCurrentStep(prev => prev + 1);
    } else {
      const invalid =
        form.querySelector('.is-invalid .lnFormInput__control') ||
        form.querySelector(':invalid');
      invalid?.focus({ preventScroll: true });
    }
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const noSolutions = formData.solutions.length === 0;
    if (noSolutions) {
      document.getElementById('cu-solutions-wrap')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (submitEndpoint) {
      try {
        await fetch(submitEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            channel: currentTab,
          }),
        });
      } catch (error) {
        console.error('Failed to submit omnichannel form:', error);
      }
    }

    if (currentTab === 'whatsapp' && whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    setFormData({ ...INITIAL_FORM });
    setCurrentTab('live_chat');
    setCurrentStep(0);
    setSubmitAttempted(false);
    setIsOpen(false);
  };

  const cityOptions = formData.province ? (cityByProvince[formData.province] ?? []) : [];
  const zipOptions  = formData.city     ? (zipByCity[formData.city]          ?? []) : [];

  if (!enabled) return null;

  // ─────────────────────────────────────────────
  // RENDER: Tabs
  // ─────────────────────────────────────────────
  const renderTabs = () => (
    <div className="mb-2 shrink-0">
      <SegmentPicker
        options={TAB_OPTIONS}
        value={currentTab}
        onChange={setCurrentTab}
        className="w-full"
      />
    </div>
  );

  // ─────────────────────────────────────────────
  // RENDER: Widget header (Steps 1–3)
  // ─────────────────────────────────────────────
  const renderHeader = () => {
    if (currentStep === 0) return null;
    return (
      <div className="flex items-center justify-between px-5 py-3.5 pb-1 shrink-0">
        <div className="flex items-center gap-3">
          <AvatarGroup size={36} />
          <div>
            <p className="text-body-b4 font-bold text-black leading-tight">Linknet Enterprise</p>
            <p className="text-caption-c1 text-secondary font-regular flex items-center gap-1 mt-0.5">
              <Icon name="clock" style={{'--icon-size':'14px'}} />
              a few minutes
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
        >
          <Icon name="close" className="w-[18px] h-[18px]" />
        </button>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // RENDER: StepIntro — GSAP stagger entrance
  // Each major block has its own ref for individual animation targeting
  // ─────────────────────────────────────────────
  const renderStepIntro = () => (
    <div className="overflow-y-auto flex-1 px-[20px] md:px-[24px] pt-7 pb-6 relative">
      {/* Close button — not animated, always visible */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
      >
        <Icon name="close" className="w-[18px] h-[18px]" />
      </button>

      {/* 1. Icon badge */}
      <div ref={introIconRef} className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-5">
        <img src="/assets/icons/chat-yellow.svg" className="w-8 h-8" alt="Message" />
      </div>

      {/* 2. Title */}
      <h2 ref={introTitleRef} className="text-[22px] font-extrabold text-black leading-[1.3] tracking-tight mb-2">
        {widgetTitle}<br />with our Expert Team
      </h2>

      {/* 3. Subtitle */}
      <p ref={introSubRef} className="text-body-b4 text-secondary font-regular mb-6">
        {widgetSubtitle}
      </p>

      {/* 4. Checklist */}
      <ul ref={introListRef} className="flex flex-col gap-3 mb-8">
        {[
          'Ask for our product details now',
          'Schedule a Demo of our featured products today',
          'Our Professional Support Team is ready to serve you 24/7',
        ].map((text, i) => (
          <li key={i} className="flex items-start gap-2.5 text-body-b4 text-black font-regular">
            <span className="flex items-center justify-center shrink-0 mt-px">
              <Icon name="check" className="text-yellow-600" style={{ '--icon-size': '24px' }} />
            </span>
            {text}
          </li>
        ))}
      </ul>

      {/* 5. CTA card */}
      <div ref={introCardRef} className="rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-body-b4 font-bold text-black">Start a Conversation</p>
            <p className="text-body-b5 text-secondary font-regular flex items-center gap-1 mt-0.5">
              <Icon name="clock" />
              a few minutes
            </p>
          </div>
          <AvatarGroup size={40} />
        </div>

        <Button
          type="button"
          variant="primary" size="lg"
          className="w-full mb-2.5"
          onClick={() => { setCurrentTab('live_chat'); setCurrentStep(1); }}
          iconLeft={<img src="/assets/icons/chat-color.svg" className="w-6 h-6 mr-0.5" alt="Chat" />}
        >
          Start Conversation
        </Button>

        <Button
          type="button"
          variant="secondary-outline" size="lg"
          className="w-full flex"
          onClick={() => { setCurrentTab('whatsapp'); setCurrentStep(1); }}
          iconLeft={<img src="/assets/icons/whatsapp-color.svg" className="w-6 h-6 mr-0.5" alt="Whatsapp" />}
        >
          Send us a Whatsapp
        </Button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // RENDER: StepPersonalData
  // ─────────────────────────────────────────────
  const renderStepPersonalData = () => (
    <form
      ref={step1FormRef}
      noValidate
      onSubmit={e => e.preventDefault()}
      className="flex flex-col flex-1 overflow-hidden"
    >
      <div className="px-5 pt-3 pb-1 shrink-0">{renderTabs()}</div>
      <div className="overflow-y-auto flex-1 px-5 py-2 flex flex-col gap-3.5">

        <Input
          id="cu-firstName" label="First Name" required
          value={formData.firstName} onChange={handleChange}
          submitAttempted={submitAttempted}
        />
        <Input
          id="cu-lastName" label="Last Name" required
          value={formData.lastName} onChange={handleChange}
          submitAttempted={submitAttempted}
        />
        <Input
          id="cu-email" type="email" label="Company Email" required
          value={formData.email} onChange={handleChange}
          submitAttempted={submitAttempted}
        />
        <Input
          id="cu-phone" type="tel" label="Phone Number" required
          value={formData.phone} onChange={handleChange}
          submitAttempted={submitAttempted}
        />
        <Select
          id="cu-department" label="Department"
          options={departmentOptions} required
          value={formData.department} onChange={handleChange}
          submitAttempted={submitAttempted}
        />
        <Select
          id="cu-roleTitle" label="Your Role / Title"
          options={roleOptions} required
          value={formData.roleTitle} onChange={handleChange}
          submitAttempted={submitAttempted}
        />

      </div>

      {/* Fixed action buttons */}
      <div className="shrink-0 px-5 pb-4 pt-3 bg-white flex gap-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <Button
          type="button" variant="secondary-outline" size="lg"
          className="flex-1 border-neutral-200 rounded-xl"
          onClick={() => setCurrentStep(0)}
        >
          Previous
        </Button>
        <Button
          type="button" variant="primary" size="lg"
          className="flex-1"
          onClick={() => goNext(step1FormRef)}
        >
          Next
        </Button>
      </div>
    </form>
  );

  // ─────────────────────────────────────────────
  // RENDER: StepCompanyData
  // ─────────────────────────────────────────────
  const renderStepCompanyData = () => (
    <form
      ref={step2FormRef}
      noValidate
      onSubmit={e => e.preventDefault()}
      className="flex flex-col flex-1 overflow-hidden"
    >
      <div className="px-5 pt-3 pb-1 shrink-0">{renderTabs()}</div>
      <div className="overflow-y-auto flex-1 px-5 py-2 flex flex-col gap-3.5">

        <Input
          id="cu-companyName" label="Company Name" required
          value={formData.companyName} onChange={handleChange}
          submitAttempted={submitAttempted}
        />
        <Select
          id="cu-businessIndustry" label="Business Industry"
          options={industryOptions} required
          value={formData.businessIndustry} onChange={handleChange}
          submitAttempted={submitAttempted}
        />
        <Select
          id="cu-province" label="Province"
          options={provinceOptions} required
          value={formData.province} onChange={handleChange}
          submitAttempted={submitAttempted}
        />
        <Select
          id="cu-city" label="City / Regency"
          options={cityOptions} required
          value={formData.city} onChange={handleChange}
          submitAttempted={submitAttempted}
          disabled={!formData.province}
        />
        <Select
          id="cu-zip" label="ZIP Code"
          options={zipOptions} required
          value={formData.zip} onChange={handleChange}
          submitAttempted={submitAttempted}
          disabled={!formData.city}
        />
        <Textarea
          id="cu-detailAddress" label="Detail Address"
          maxLength={200} required
          value={formData.detailAddress} onChange={handleChange}
          submitAttempted={submitAttempted}
        />

      </div>

      {/* Fixed action buttons */}
      <div className="shrink-0 px-5 pb-4 pt-3 bg-white flex gap-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <Button
          type="button" variant="secondary-outline" size="lg"
          className="flex-1 border-neutral-200 rounded-xl"
          onClick={() => setCurrentStep(1)}
        >
          Previous
        </Button>
        <Button
          type="button" variant="primary" size="lg"
          className="flex-1"
          onClick={() => goNext(step2FormRef)}
        >
          Next
        </Button>
      </div>
    </form>
  );

  // ─────────────────────────────────────────────
  // RENDER: StepSolution
  // ─────────────────────────────────────────────
  const renderStepSolution = () => (
    <form
      ref={step3FormRef}
      noValidate
      onSubmit={e => e.preventDefault()}
      className="flex flex-col flex-1 overflow-hidden"
    >
      <div className="px-5 pt-3 pb-1 shrink-0">{renderTabs()}</div>
      <div className="overflow-y-auto flex-1 px-5 py-2">

        <p className="text-body-b4 font-bold text-black mb-3.5">Choose a Solutions</p>

        <div id="cu-solutions-wrap">
          <SolutionPicker
            selectedValues={formData.solutions}
            onChange={(vals) => setFormData(prev => ({ ...prev, solutions: vals }))}
            error={
              submitAttempted && formData.solutions.length === 0
                ? 'Please select at least one solution.'
                : ''
            }
          />
        </div>

      </div>

      {/* Fixed action buttons */}
      <div className="shrink-0 px-5 pb-4 pt-3 bg-white flex gap-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <Button
          type="button" variant="secondary-outline" size="lg"
          className="border-neutral-200 rounded-xl"
          iconLeft={<Icon name="chevron-left" />}
          onClick={() => setCurrentStep(2)}
        />
        <Button
          type="button" variant="primary" size="lg"
          className="flex-1 w-full"
          onClick={handleSubmit}
        >
          Start Conversation
        </Button>
      </div>
    </form>
  );

  // ─────────────────────────────────────────────
  // STEP ROUTER
  // ─────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderStepIntro();
      case 1: return renderStepPersonalData();
      case 2: return renderStepCompanyData();
      case 3: return renderStepSolution();
      default: return null;
    }
  };

  // ─────────────────────────────────────────────
  // ROOT
  // ─────────────────────────────────────────────
  return (
    <div className={`fixed z-[100] ${className}`}>

      {/* ── OVERLAY — mobile only ── */}
      <div
        ref={overlayRef}
        onClick={handleClose}
        style={{ display: 'none', opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-[9990]"
      />

      {/* ── WIDGET PANEL ── */}
      <div
        ref={widgetRef}
        style={{
          display: 'none',
          opacity: 1,
          transform: 'translateY(100%)',
          pointerEvents: 'none',
        }}
        className="fixed bottom-0 left-0 right-0 md:inset-auto md:bottom-[96px] md:right-6 w-full max-h-[90vh] md:w-[380px] md:max-h-[80vh] bg-white rounded-t-[20px] md:rounded-[20px] shadow-[0_16px_48px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] flex-col overflow-hidden z-[9995]"
      >
        {renderHeader()}
        <div
          ref={contentRef}
          className="flex flex-col flex-1 overflow-hidden relative"
        >
          {renderStep()}
        </div>
      </div>

      {/* ── FLOATING ACTION BUTTON ── */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Open chat"
        className={`
          fixed bottom-6 right-6 w-14 h-14 bg-primary border-none
          flex items-center justify-center
          shadow-[0_8px_24px_rgba(251,191,36,0.5)]
          hover:scale-110 active:scale-95 transition-all duration-200
          z-[9999] cursor-pointer
          ${isOpen ? 'hidden md:flex rounded-full' : 'flex rounded-full'}
        `}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" width="26" height="26"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        ) : (
          <svg viewBox="0 0 38 38" fill="none" width="28" height="28">
            <rect x="2"  y="2"  width="21" height="17" rx="4" fill="white" opacity="0.95"/>
            <path d="M5 19v5.5l6.5-5.5H23"  fill="white" opacity="0.95"/>
            <rect x="14" y="11" width="22" height="17" rx="4" fill="white" opacity="0.5"/>
            <path d="M17 28v5.5l6.5-5.5H36" fill="white" opacity="0.5"/>
          </svg>
        )}
      </button>

    </div>
  );
}
