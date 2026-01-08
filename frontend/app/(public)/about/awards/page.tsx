'use client';

import { useState, useEffect } from 'react';
import { AwardsByYear } from '@/types/award.types';
import { awardApi } from '@/lib/api/award.api';
import { FiAward, FiCalendar, FiTarget } from 'react-icons/fi';

export default function AwardsPage() {
  const [awardsByYear, setAwardsByYear] = useState<AwardsByYear>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const data = await awardApi.getAwardsByYear();
      setAwardsByYear(data);
    } catch (error) {
      console.error('Failed to load awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const years = Object.keys(awardsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <FiTarget className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Our Awards & Achievements
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Recognition of our commitment to excellence and innovation in the industry
            </p>
          </div>
        </div>
      </section>

      {/* View Toggle */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'timeline'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Grid View
          </button>
        </div>
      </section>

      {/* Awards Display */}
      <section className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : years.length === 0 ? (
          <div className="text-center py-20">
            <FiAward className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No Awards Yet
            </h3>
            <p className="text-gray-600">Check back soon for updates!</p>
          </div>
        ) : viewMode === 'timeline' ? (
          <TimelineView awardsByYear={awardsByYear} years={years} />
        ) : (
          <GridView awardsByYear={awardsByYear} years={years} />
        )}
      </section>
    </div>
  );
}

// Timeline View Component
function TimelineView({ awardsByYear, years }: { awardsByYear: AwardsByYear; years: number[] }) {
  return (
    <div className="max-w-5xl mx-auto">
      {years.map((year) => (
        <div key={year} className="relative">
          {/* Year Badge */}
          <div className="sticky top-20 z-10 mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-lg">
              <FiCalendar className="w-6 h-6" />
              <span className="text-2xl font-bold">{year}</span>
            </div>
          </div>

          {/* Awards for this year */}
          <div className="space-y-6 mb-12 ml-8">
            {(awardsByYear[year] || []).map((award) => (
              <div
                key={award.id}
                className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-blue-400 before:to-purple-400"
              >
                {/* Timeline Dot */}
                <div className="absolute left-[-8px] top-6 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-lg"></div>

                {/* Award Card */}
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Image */}
                    {award.image && (
                      <div className="md:col-span-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={award.image}
                          alt={award.title}
                          className="w-full h-full object-cover min-h-[200px]"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className={`p-6 ${award.image ? 'md:col-span-2' : 'md:col-span-3'}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <FiAward className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {award.title}
                          </h3>
                          <div className="flex items-center gap-2 text-blue-600 font-medium mb-3">
                            <FiTarget className="w-4 h-4" />
                            <span>{award.issuer}</span>
                          </div>
                          {award.description && (
                            <p className="text-gray-600 leading-relaxed">
                              {award.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Grid View Component
function GridView({ awardsByYear, years }: { awardsByYear: AwardsByYear; years: number[] }) {
  return (
    <div className="max-w-7xl mx-auto">
      {years.map((year) => (
        <div key={year} className="mb-16">
          {/* Year Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-lg">
              <FiCalendar className="w-6 h-6" />
              <span className="text-2xl font-bold">{year}</span>
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-blue-200 to-transparent rounded"></div>
          </div>

          {/* Awards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(awardsByYear[year] || []).map((award) => (
              <div
                key={award.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden group"
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
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {award.title}
                  </h3>
                  <div className="flex items-center gap-2 text-blue-600 font-medium mb-3">
                    <FiTarget className="w-4 h-4" />
                    <span className="text-sm">{award.issuer}</span>
                  </div>
                  {award.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {award.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
