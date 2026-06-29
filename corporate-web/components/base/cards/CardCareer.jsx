'use client';

import React from 'react';
import Icon from '../Icon'; // Sesuaikan path
import Link from '../Link'; // Sesuaikan path

import { useParams } from 'next/navigation';

const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;

const CardCareer = ({
  department = "Central Function - Human Capital",
  title = "Employee & Industrial Relations Internship",
  type = "Internship",
  location = "Cyberpark",
  applyUrl = "#",
  detailUrl = "#"
}) => {

    const params = useParams();
    const locale = params.locale || 'en';

  const toLocalizedHref = (url) => {
    if (!url) return '#';
    if (
      ABSOLUTE_URL_PATTERN.test(url) ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      url.startsWith('#')
    ) {
      return url;
    }

    return `/${locale}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const applyHref = toLocalizedHref(applyUrl);
  const detailHref = toLocalizedHref(detailUrl);
  const isExternalApply = ABSOLUTE_URL_PATTERN.test(applyHref);

  return (
    <div className="lnCardCareer w-full flex flex-col justify-between max-w-[400px] rounded-[16px] border border-gray-200 hover:border-yellow-500 bg-white p-[20px] h-full min-h-[140px] md:min-h-[256px] transition-colors">
      <div className="lnCardCareer__body cardBody">
        {/* Department */}
        <p className="lnCardCareer__department mb-2 text-secondary font-regular text-caption-c1 line-clamp-1">
            {department}
        </p>

        {/* Title */}
        <h4 className="lnCardCareer__title text-body-b3 font-bold text-black mb-4 leading-snug line-clamp-2">
            {title}
        </h4>

        {/* Badges: Type & Location */}
        <div className="lnCardCareer__meta flex flex-wrap gap-2 mb-8">
            <div className="lnCardCareer__pill lnCardCareer__pill--type flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-caption-c1 text-secondary">
                <Icon name="briefcase-filled" className="lnCardCareer__pillIcon" />
                <span className="lnCardCareer__pillText font-regular">{type}</span>
            </div>
            <div className="lnCardCareer__pill lnCardCareer__pill--location flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-caption-c1 text-secondary">
                <Icon name="pin-filled" className="lnCardCareer__pillIcon" />
                <span className="lnCardCareer__pillText font-regular line-clamp-1">{location}</span>
            </div>
        </div>
      </div>
      

      {/* Action Buttons */}
      <div className="lnCardCareer__actions flex flex-row gap-2 pt-4 border-t border-gray-200">
        {/* Asumsi komponen <Link> milikmu menerima props variant dan size */}
        <Link 
          href={applyHref}
          target={isExternalApply ? '_blank' : undefined}
          rel={isExternalApply ? 'noopener noreferrer' : undefined}
          variant="primary" 
          size="md"
          className="lnCardCareer__action lnCardCareer__action--apply w-full flex transition-colors"
        >
          Apply
        </Link>
        
        <Link 
          href={detailHref}
          variant="secondary-outline" 
          size="md"
          className="lnCardCareer__action lnCardCareer__action--detail w-full flex transition-colors transition-colors"
        >
          See Detail
        </Link>
      </div>
    </div>
  );
};

export default CardCareer;
