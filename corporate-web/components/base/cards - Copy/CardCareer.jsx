'use client';

import React from 'react';
import Icon from '../Icon'; // Sesuaikan path
import Link from '../Link'; // Sesuaikan path

import { useParams } from 'next/navigation';

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

  return (
    <div className="w-full flex flex-col justify-between max-w-[400px] rounded-[16px] border border-gray-200 hover:border-yellow-500 bg-white p-[20px] min-h-[140px] md:h-[256px] transition-colors">
      <div className="cardBody">
        {/* Department */}
        <p className="mb-2 text-secondary font-regular text-caption-c1 line-clamp-1">
            {department}
        </p>

        {/* Title */}
        <h4 className="text-body-b3 font-bold text-black mb-4 leading-snug line-clamp-2">
            {title}
        </h4>

        {/* Badges: Type & Location */}
        <div className="flex flex-wrap gap-2 mb-8">
            <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-caption-c1 text-secondary">
                <Icon name="briefcase-filled" />
                <span className="font-regular">{type}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-caption-c1 text-secondary">
                <Icon name="pin-filled" />
                <span className="font-regular line-clamp-1">{location}</span>
            </div>
        </div>
      </div>
      

      {/* Action Buttons */}
      <div className="flex flex-row gap-2 pt-4 border-t border-gray-200">
        {/* Asumsi komponen <Link> milikmu menerima props variant dan size */}
        <Link 
          href={`/${locale}${applyUrl}`}
          variant="primary" 
          size="md"
          className="w-full flex transition-colors"
        >
          Apply
        </Link>
        
        <Link 
          href={`/${locale}${detailUrl}`}
          variant="secondary-outline" 
          size="md"
          className="w-full flex transition-colors transition-colors"
        >
          See Detail
        </Link>
      </div>
    </div>
  );
};

export default CardCareer;