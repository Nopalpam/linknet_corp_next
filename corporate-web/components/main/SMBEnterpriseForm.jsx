'use client';

import { useParams } from 'next/navigation';
import { SMBEnterpriseFormContent } from '@/components/base/modals/ModalFormRegistrationEnterpriseSMB';
import {
  buildEnterpriseFormPayload,
  EnterpriseInlineSection,
} from './enterpriseStandaloneForms';

export default function SMBEnterpriseForm({ pageContext, data, cmsData, className }) {
  const params = useParams();
  const locale = params?.locale || 'id';
  const resolvedData = cmsData || data || {};
  const initialPayload = buildEnterpriseFormPayload({
    pageContext,
    product: resolvedData.product,
    promoFallback: resolvedData.promo || 'SMB Enterprise Registration',
    sourceFallback: resolvedData.source || 'Enterprise Website',
    pageFallback: `/${locale}/enterprise/form`,
  });

  return (
    <EnterpriseInlineSection className={className}>
      <SMBEnterpriseFormContent initialPayload={initialPayload} />
    </EnterpriseInlineSection>
  );
}
