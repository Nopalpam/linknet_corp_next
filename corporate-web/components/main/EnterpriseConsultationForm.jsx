'use client';

import { useParams } from 'next/navigation';
import { EnterpriseConsultationFormContent } from '@/components/base/modals/ModalFormRegistrationEnterprise';
import {
  buildEnterpriseFormPayload,
  EnterpriseInlineSection,
} from './enterpriseStandaloneForms';

export default function EnterpriseConsultationForm({ pageContext, data, cmsData, className }) {
  const params = useParams();
  const locale = params?.locale || 'id';
  const resolvedData = cmsData || data || {};
  const initialPayload = buildEnterpriseFormPayload({
    pageContext,
    product: resolvedData.product,
    promoFallback: resolvedData.promo || 'Enterprise Consultation Form',
    sourceFallback: resolvedData.source || 'Enterprise Website',
    pageFallback: `/${locale}/enterprise/form`,
  });

  return (
    <EnterpriseInlineSection className={className}>
      <EnterpriseConsultationFormContent initialPayload={initialPayload} />
    </EnterpriseInlineSection>
  );
}
