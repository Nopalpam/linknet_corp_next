'use client';

import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import LinknetLink from '../base/Link';

const SUCCESS_CONTENT = {
  'sales-inquiry': {
    title: (firstName) =>
      `Hi, ${firstName}. Thank you, your sales inquiry has been successfully submitted`,
    subtitle:
      'Our sales team has received your request and will contact you shortly to discuss the best solution for your business needs.',
  },
  support: {
    title: (firstName) =>
      `Hi, ${firstName}. Thank you, your support request has been successfully submitted`,
    subtitle:
      'Our support team has received your issue details and will follow up with you as soon as possible to assist further.',
  },
  partnership: {
    title: (firstName) =>
      `Hi, ${firstName}. Thank you, your partnership inquiry has been successfully submitted`,
    subtitle:
      'Our team has received your partnership request and will review the opportunity before reaching out to you shortly.',
  },
  'register-event': {
    title: (firstName) =>
      `Hi, ${firstName}. Thank you, your event registration has been successfully submitted`,
    subtitle:
      'We have received your event registration details and our team will follow up with the next information shortly.',
  },
  default: {
    title: (firstName) =>
      `Hi, ${firstName}. Thank you, your registration has been successfully submitted`,
    subtitle:
      'We have received all required information and documents. The Linknet team will review your submission and contact you shortly.',
  },
};

function getDisplayName(value) {
  const normalizedValue = String(value || '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!normalizedValue) {
    return 'there';
  }

  return normalizedValue;
}

function getNeedsKey(value) {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  if (normalizedValue in SUCCESS_CONTENT) {
    return normalizedValue;
  }

  return 'default';
}

export default function FormRegistrationSuccess() {
  const params = useParams();
  const searchParams = useSearchParams();

  const locale = params?.locale || 'id';
  const displayName = useMemo(
    () => getDisplayName(searchParams.get('name')),
    [searchParams]
  );
  const needsKey = useMemo(
    () => getNeedsKey(searchParams.get('needs')),
    [searchParams]
  );
  const content = SUCCESS_CONTENT[needsKey];

  return (
    <section className="relative isolate overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="container">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center text-center">
          <div className="relative mb-10 aspect-[486/271] w-full max-w-[400px] overflow-hidden rounded-[28px] shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
            <Image
              src="/assets/photos/thumb/img-success.png"
              alt="Registration submitted successfully"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 486px"
              priority
            />
          </div>

          <div className="max-w-3xl">
            <h1 className="text-balance text-headline-h3 font-bold leading-tight text-black">
              {content.title(displayName)}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-body-b4 text-secondary">
              {content.subtitle}
            </p>
          </div>

          <LinknetLink
            href={`/${locale}`}
            size='lg'
            variant='secondary-outline'
            className="mt-8"
          >
            Back to Homepage
          </LinknetLink>
        </div>
      </div>
    </section>
  );
}