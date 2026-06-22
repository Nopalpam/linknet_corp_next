'use client';

import Button from '@/components/base/Button';
import ModalFormRegistrationMediaProvider, {
  useModalFormRegistrationMedia,
} from '@/components/base/modals/ModalFormRegistrationMedia';
import ModalFormEventRegisterProvider, {
  useModalFormEventRegister,
} from '@/components/base/modals/ModalFormEventRegister';
import { useParams } from 'next/navigation';

function FormRegistrationMediaInner({ data = {} }) {
  const params = useParams();
  const locale = params?.locale || 'id';

  const { openModal: openRegistration } = useModalFormRegistrationMedia();
  const { openModal: openEventRegister } = useModalFormEventRegister();

  const title = data.title || 'Media Registration';
  const description = data.description || 'Daftarkan kemitraan atau kampanye media Anda.';
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
        <Button variant="primary" size="lg" onClick={openRegistration}>
          Daftar Media
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
                Source_Website__c: 'Media Website',
                maxParticipants,
                businessUnit: 'media',
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

export default function FormRegistrationMedia({ data, cmsData, styleProps }) {
  const resolvedData = cmsData || data || {};
  return (
    <ModalFormRegistrationMediaProvider>
      <ModalFormEventRegisterProvider>
        <FormRegistrationMediaInner data={resolvedData} />
      </ModalFormEventRegisterProvider>
    </ModalFormRegistrationMediaProvider>
  );
}
