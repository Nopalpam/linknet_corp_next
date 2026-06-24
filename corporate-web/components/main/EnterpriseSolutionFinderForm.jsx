'use client';

import { useParams } from 'next/navigation';
import { SuggestEnterpriseContent } from '@/components/base/modals/ModalFormSuggestEnterprise';
import {
  buildEnterpriseFormPayload,
  EnterpriseInlineSection,
} from './enterpriseStandaloneForms';

export default function EnterpriseSolutionFinderForm({ pageContext, data, cmsData, className }) {
  const params = useParams();
  const locale = params?.locale || 'id';
  const resolvedData = cmsData || data || {};
  const initialPayload = buildEnterpriseFormPayload({
    pageContext,
    product: resolvedData.product,
    promoFallback: resolvedData.promo || 'Solution Finder',
    sourceFallback: resolvedData.source || 'Enterprise Website',
    pageFallback: `/${locale}/solutions`,
  });

  return (
    <EnterpriseInlineSection className={['min-h-screen px-4 py-8 sm:px-8 sm:py-12', className].filter(Boolean).join(' ')}>
      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1200px] overflow-hidden rounded-[20px] shadow-sm">
        <SuggestEnterpriseContent
          embedded
          initialPayload={initialPayload}
        />
      </div>
    </EnterpriseInlineSection>
  );
}
