'use client';

import React, { useEffect, useState } from 'react';
import { Award } from '@/types/award.types';
import { awardApi } from '@/lib/api/award.api';
import { FiAward, FiTarget, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

interface AwardsShowcaseProps {
  limit?: number;
  showViewAll?: boolean;
}

export const AwardsShowcase: React.FC<AwardsShowcaseProps> = ({
  limit = 6,
  showViewAll = true,
}) => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const data = await awardApi.getActiveAwards();
      setAwards(data.slice(0, limit));
    } catch (error) {
      console.error('Failed to load awards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (awards.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
            <FiTarget className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Awards & Recognition
          </h2>
          <p className="text-xl text-gray-600">
            Celebrating our achievements and commitment to excellence
          </p>
        </div>

        {/* Awards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {awards.map((award, index) => (
            <div
              key={award.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden group"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                {award.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={award.image}
                      alt={award.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FiAward className="w-20 h-20 text-blue-300" />
                  </div>
                )}
                
                {/* Year Badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm text-blue-600 font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                    {award.year}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {award.title}
                </h3>
                <div className="flex items-center gap-2 text-blue-600 font-medium mb-3">
                  <FiTarget className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm line-clamp-1">{award.issuer}</span>
                </div>
                {award.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {award.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {showViewAll && (
          <div className="text-center">
            <Link
              href="/about/awards"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
            >
              View All Awards
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
