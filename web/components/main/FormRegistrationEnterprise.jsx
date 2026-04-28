'use client';

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

function FormRegistrationEnterpriseInner({ data = {} }) {
  const params = useParams();
  const locale = params?.locale || 'id';

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

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      {(title || description) && (
        <div className="mb-8 text-center">
          {title && <h2 className="text-headline-h4 font-bold text-black">{title}</h2>}
          {description && <p className="mt-2 text-body-b4 text-secondary">{description}</p>}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={() =>
            openConsultation({
              Promo_Website__c: 'Enterprise Consultation Form',
              Page_Website__c: `/${locale}/enterprise/form`,
              Source_Website__c: 'Enterprise Website',
            })
          }
        >
          Enterprise Consultation
        </Button>
        <Button variant="primary" size="lg" onClick={openSMB}>
          SMB Enterprise
        </Button>
        <Button variant="primary" size="lg" onClick={openPartnership}>
          Partnership
        </Button>
        <Button variant="primary" size="lg" onClick={openSuggest}>
          Suggest Enterprise
        </Button>
        {eventName && (
          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              openEventRegister({
                eventName,
                Promo_Website__c: eventPromo || eventName,
                Page_Website__c: eventPage,
                Source_Website__c: 'Enterprise Website',
                maxParticipants,
                businessUnit: 'enterprise',
              })
            }
          >
            Register Event
          </Button>
        )}
      </div>
    </section>
  );
}

export default function FormRegistrationEnterprise({ data, cmsData, styleProps }) {
  const resolvedData = cmsData || data || {};
  return (
    <ModalFormRegistrationEnterpriseProvider>
      <ModalFormRegistrationEnterpriseSMBProvider>
        <ModalFormPartnershipEnterpriseProvider>
          <ModalFormSuggestEnterpriseProvider>
            <ModalFormEventRegisterProvider>
              <FormRegistrationEnterpriseInner data={resolvedData} />
            </ModalFormEventRegisterProvider>
          </ModalFormSuggestEnterpriseProvider>
        </ModalFormPartnershipEnterpriseProvider>
      </ModalFormRegistrationEnterpriseSMBProvider>
    </ModalFormRegistrationEnterpriseProvider>
  );
}
