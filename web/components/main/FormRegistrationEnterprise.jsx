'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/base/Button';
import ModalFormRegistrationEnterpriseProvider, {
  useModalFormRegistrationEnterprise,
} from '@/components/base/modals/ModalFormRegistrationEnterprise';
import ModalFormRegistrationEnterpriseSMBProvider, {
  useModalFormRegistrationEnterpriseSMB,
} from '@/components/base/modals/ModalFormRegistrationEnterpriseSMB';
import ModalFormPartnershipEnterpriseProvider, {
  useModalFormPartnershipEnterprise,
} from '@/components/base/modals/ModalFormPartnershipEnterprise';
import ModalFormSuggestEnterpriseProvider, {
  useModalFormSuggestEnterprise,
} from '@/components/base/modals/ModalFormSuggestEnterprise';
import ModalFormEventRegisterProvider, {
  useModalFormEventRegister,
} from '@/components/base/modals/ModalFormEventRegister';
import { useParams } from 'next/navigation';
import { fetchFormModules } from '@/lib/formsApi';

const FALLBACK_ENTERPRISE_FORMS = [
  { slug: 'enterprise-consultation', name: 'Enterprise Consultation', category: 'REGISTRATION' },
  { slug: 'smb-enterprise', name: 'SMB Enterprise Registration', category: 'REGISTRATION' },
  { slug: 'enterprise-partnership', name: 'Enterprise Partnership', category: 'PARTNERSHIP' },
  { slug: 'suggest-enterprise', name: 'Solution Finder', category: 'RECOMMENDATION' },
  { slug: 'event-register', name: 'Enterprise Event Registration', category: 'EVENT' },
];

const FORM_REGISTRATION_VISIBLE_SLUGS = new Set([
  'enterprise-consultation',
  'smb-enterprise',
  'enterprise-partnership',
  'suggest-enterprise',
  'event-register',
]);

const FORM_ORDER = [
  'enterprise-consultation',
  'smb-enterprise',
  'enterprise-partnership',
  'suggest-enterprise',
  'event-register',
];

const BUTTON_LABELS = {
  'enterprise-consultation': 'Enterprise Consultation',
  'smb-enterprise': 'SMB Enterprise',
  'enterprise-partnership': 'Partnership',
  'suggest-enterprise': 'Solution Finder',
  'event-register': 'Register Event',
};

function normalizeEnterpriseForms(forms) {
  const bySlug = new Map();

  forms.forEach((form) => {
    if (form?.slug && !bySlug.has(form.slug)) {
      bySlug.set(form.slug, form);
    }
  });

  return Array.from(bySlug.values()).filter((form) => FORM_REGISTRATION_VISIBLE_SLUGS.has(form.slug)).sort((left, right) => {
    const leftIndex = FORM_ORDER.indexOf(left.slug);
    const rightIndex = FORM_ORDER.indexOf(right.slug);
    const safeLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const safeRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    if (safeLeft !== safeRight) return safeLeft - safeRight;
    return String(left.name || left.slug).localeCompare(String(right.name || right.slug));
  });
}

function getCurrentUrl() {
  if (typeof window === 'undefined') return undefined;
  return window.location.href;
}

function getSourceFromCurrentUrl() {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get('utm_source') || params.get('source') || undefined;
}

function buildSubmissionContext(pageContext) {
  return {
    product: pageContext?.product || undefined,
    promo: pageContext?.promo || undefined,
    source: getSourceFromCurrentUrl() || pageContext?.source || undefined,
    url: getCurrentUrl(),
  };
}

function FormRegistrationEnterpriseInner({ data = {}, pageContext }) {
  const params = useParams();
  const locale = params?.locale || 'id';
  const [enterpriseForms, setEnterpriseForms] = useState(FALLBACK_ENTERPRISE_FORMS);

  const { openModal: openConsultation } = useModalFormRegistrationEnterprise();
  const { openModal: openSMB } = useModalFormRegistrationEnterpriseSMB();
  const { openModal: openPartnership } = useModalFormPartnershipEnterprise();
  const { openModal: openSuggest } = useModalFormSuggestEnterprise();
  const { openModal: openEventRegister } = useModalFormEventRegister();

  const title = data.title || 'Enterprise Registration';
  const description = data.description || 'Pilih form sesuai kebutuhan bisnis enterprise Anda.';
  const eventName = data.event_name || '';
  const eventPromo = data.event_promo || '';
  const eventPage = data.event_page || `/${locale}/event`;
  const maxParticipants = data.max_participants || 5;
  const forms = useMemo(() => normalizeEnterpriseForms(enterpriseForms), [enterpriseForms]);

  useEffect(() => {
    const controller = new AbortController();

    fetchFormModules('enterprise', controller.signal)
      .then((items) => setEnterpriseForms(Array.isArray(items) && items.length ? items : FALLBACK_ENTERPRISE_FORMS))
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          console.error('[FormRegistrationEnterprise] Failed to load enterprise form modules:', error);
        }
      });

    return () => controller.abort();
  }, []);

  const buildModalPayload = useMemo(
    () => (promoFallback, sourceFallback = 'Enterprise Website', pageFallback) => {
      const context = buildSubmissionContext(pageContext);
      const pageUrl = context.url || pageFallback;

      return {
        Product: context.product,
        Promo_Website__c: context.promo || promoFallback,
        Page_Website__c: pageUrl,
        Source_Website__c: context.source || sourceFallback,
        context: {
          ...context,
          promo: context.promo || promoFallback,
          source: context.source || sourceFallback,
          url: pageUrl,
        },
      };
    },
    [pageContext],
  );

  const openForm = (form) => {
    switch (form.slug) {
      case 'enterprise-consultation':
        openConsultation(buildModalPayload('Enterprise Consultation Form', 'Enterprise Website', `/${locale}/enterprise/form`));
        break;
      case 'smb-enterprise':
        openSMB(buildModalPayload(form.name || 'SMB Enterprise Registration', 'Enterprise Website', `/${locale}/enterprise/form`));
        break;
      case 'enterprise-partnership':
        openPartnership(buildModalPayload(form.name || 'Enterprise Partnership', 'Enterprise Website', `/${locale}/enterprise/form`));
        break;
      case 'suggest-enterprise':
        openSuggest(buildModalPayload(form.name || 'Solution Finder', 'Enterprise Website', `/${locale}/solutions`));
        break;
      case 'event-register':
        openEventRegister({
          ...buildModalPayload(eventPromo || eventName || form.name || 'Enterprise Event Registration', 'Event Website', eventPage),
          eventName: eventName || form.name || 'Enterprise Event',
          maxParticipants,
          businessUnit: 'enterprise',
        });
        break;
      default:
        console.warn(`[FormRegistrationEnterprise] No modal registered for enterprise form slug: ${form.slug}`);
        break;
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      {(title || description) && (
        <div className="mb-8 text-center">
          {title && <h2 className="text-headline-h4 font-bold text-black">{title}</h2>}
          {description && <p className="mt-2 text-body-b4 text-secondary">{description}</p>}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center">
        {forms.map((form) => (
          <Button
            key={form.slug}
            variant="primary"
            size="lg"
            onClick={() => openForm(form)}
          >
            {BUTTON_LABELS[form.slug] || form.name || form.slug}
          </Button>
        ))}
      </div>
    </section>
  );
}

export default function FormRegistrationEnterprise({ data, cmsData, styleProps, pageContext }) {
  const resolvedData = cmsData || data || {};
  return (
    <ModalFormRegistrationEnterpriseProvider>
      <ModalFormRegistrationEnterpriseSMBProvider>
        <ModalFormPartnershipEnterpriseProvider>
          <ModalFormSuggestEnterpriseProvider>
            <ModalFormEventRegisterProvider>
              <FormRegistrationEnterpriseInner data={resolvedData} pageContext={pageContext} />
            </ModalFormEventRegisterProvider>
          </ModalFormSuggestEnterpriseProvider>
        </ModalFormPartnershipEnterpriseProvider>
      </ModalFormRegistrationEnterpriseSMBProvider>
    </ModalFormRegistrationEnterpriseProvider>
  );
}
