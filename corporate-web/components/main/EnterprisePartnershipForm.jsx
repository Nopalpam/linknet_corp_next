'use client';

import { useParams } from 'next/navigation';
import { PartnershipEnterpriseFormContent } from '@/components/base/modals/ModalFormPartnershipEnterprise';
import {
  buildEnterpriseFormPayload,
  EnterpriseInlineSection,
} from './enterpriseStandaloneForms';

export default function EnterprisePartnershipForm({ pageContext, data, cmsData, className }) {
  const params = useParams();
  const locale = params?.locale || 'id';
  const resolvedData = cmsData || data || {};
  const initialPayload = buildEnterpriseFormPayload({
    pageContext,
    product: resolvedData.product,
    promoFallback: resolvedData.promo || 'Enterprise Partnership',
    sourceFallback: resolvedData.source || 'Enterprise Website',
    pageFallback: `/${locale}/enterprise/form`,
  });

  return (
    <EnterpriseInlineSection className={['min-h-screen px-4 py-8 sm:px-8 sm:py-12', className].filter(Boolean).join(' ')}>
      <PartnershipEnterpriseFormContent
        embedded
        initialPayload={initialPayload}
      />
    </EnterpriseInlineSection>
  );
}
