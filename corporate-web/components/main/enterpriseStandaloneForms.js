'use client';

function getCurrentUrl() {
  if (typeof window === 'undefined') return undefined;
  return window.location.href;
}

function getSourceFromCurrentUrl() {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get('utm_source') || params.get('source') || undefined;
}

export function buildEnterpriseFormPayload({
  pageContext,
  promoFallback,
  sourceFallback = 'Enterprise Website',
  pageFallback,
  product,
}) {
  const url = getCurrentUrl() || pageFallback;
  const source = getSourceFromCurrentUrl() || pageContext?.source || sourceFallback;
  const promo = pageContext?.promo || promoFallback;
  const resolvedProduct = product || pageContext?.product || undefined;

  return {
    Product: resolvedProduct,
    Promo_Website__c: promo,
    Page_Website__c: url,
    Source_Website__c: source,
    context: {
      product: resolvedProduct,
      promo,
      source,
      url,
    },
  };
}

export function EnterpriseInlineSection({ children, className = '' }) {
  return (
    <section className={['bg-light-2', className].filter(Boolean).join(' ')}>
      {children}
    </section>
  );
}
