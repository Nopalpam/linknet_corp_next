"use client";

import React, { useState, useEffect } from "react";
import { careerService } from "@/services/career.service";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterType: string;
  onTypeChange: (value: string) => void;
  filterLocation: string;
  onLocationChange: (value: string) => void;
  filterDivision: string;
  onDivisionChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function CareerFilters({
  search,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterType,
  onTypeChange,
  filterLocation,
  onLocationChange,
  filterDivision,
  onDivisionChange,
  onClearFilters,
}: Props) {
  const [filterOptions, setFilterOptions] = useState<{
    locations: string[];
    types: string[];
    divisions: string[];
  }>({ locations: [], types: [], divisions: [] });

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await careerService.getFilterOptions();
        if (response.data) {
          setFilterOptions(response.data);
        }
      } catch {
        // Filter load failure is non-critical
      }
    };
    loadFilters();
  }, []);

  const hasActiveFilters = search || filterStatus || filterType || filterLocation || filterDivision;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Search */}
        <div className="xl:col-span-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search position..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="scheduled">Scheduled</option>
        </select>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Types</option>
          {filterOptions.types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Location Filter */}
        <select
          value={filterLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Locations</option>
          {filterOptions.locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        {/* Division Filter */}
        <select
          value={filterDivision}
          onChange={(e) => onDivisionChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Divisions</option>
          {filterOptions.divisions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onClearFilters}
            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
