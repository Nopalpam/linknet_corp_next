'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Sesuaikan path import di bawah ini dengan struktur foldermu
import SearchFilterBar from '@/components/base/SearchFilterBar';
import CardCareer from '../base/cards/CardCareer'; 
import { careers } from '../../data/components/careerList'; 

export default function CareerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Ambil state currentPage dari URL Parameter (?page=x)
  const pageParam = searchParams.get('page');
  const parsedPage = parseInt(pageParam, 10);
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const ITEMS_PER_PAGE = 12; // Menampilkan 12 data per halaman

  // 2. State Lokal untuk Pencarian & Filter
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState({});

  // ==========================================
  // A. AUTO-GENERATE FILTER OPTIONS
  // ==========================================
  const generatedFilters = useMemo(() => {
    const locations = new Set();
    const types = new Set();
    const departments = new Set();

    // Ekstrak nilai unik dari data careers
    careers.forEach(job => {
      if (job.location) locations.add(job.location);
      if (job.employment_type) types.add(job.employment_type);
      if (job.department) departments.add(job.department);
    });

    const filters = [];
    
    if (locations.size > 0) {
      filters.push({ 
        key: 'location', 
        placeholder: 'Location', 
        options: Array.from(locations).map(l => ({ label: l, value: l })) 
      });
    }
    if (types.size > 0) {
      filters.push({ 
        key: 'employment_type', 
        placeholder: 'Job Type', 
        options: Array.from(types).map(t => ({ label: t, value: t })) 
      });
    }
    if (departments.size > 0) {
      filters.push({ 
        key: 'department', 
        placeholder: 'Division/Department', 
        options: Array.from(departments).map(d => ({ label: d, value: d })) 
      });
    }

    return filters;
  }, []);

  // ==========================================
  // B. LOGIC FILTER DATA (FLAT ARRAY)
  // ==========================================
  const filteredCareers = useMemo(() => {
    const searchKeyword = searchValue.trim().toLowerCase();

    return careers.filter(job => {
      // Filter Pencarian (Berdasarkan Title)
      const jobTitle = job.title ? job.title.toLowerCase() : "";
      const matchSearch = searchKeyword === "" || jobTitle.includes(searchKeyword);
      
      // Filter Dropdown
      let matchFilters = true;
      for (const key in filterValues) {
        const selectedVal = filterValues[key];
        if (selectedVal && selectedVal !== '') {
          // Cocokkan key filter dengan properti di objek job
          if (job[key] !== selectedVal) {
            matchFilters = false;
            break;
          }
        }
      }

      return matchSearch && matchFilters;
    });
  }, [searchValue, filterValues]);

  // ==========================================
  // C. KALKULASI DATA PAGINATION
  // ==========================================
  const totalPages = Math.ceil(filteredCareers.length / ITEMS_PER_PAGE) || 1; 
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCareers = filteredCareers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ==========================================
  // D. HANDLERS
  // ==========================================
  const resetPageToFirst = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    resetPageToFirst();
  };

  const handleSearchChange = (val) => {
    setSearchValue(val);
    resetPageToFirst();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      
      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      // Scroll halus kembali ke atas list
      window.scrollTo({
        top: document.getElementById('career-list-section')?.offsetTop - 50,
        behavior: 'smooth'
      });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage > totalPages - 3) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <section id="career-list-section" className="bg-light-2 pt-10 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        
        {/* ========================================= */}
        {/* GLOBAL SEARCH & FILTER BAR */}
        {/* ========================================= */}
        <div className="mb-10">
          <SearchFilterBar 
            searchPlaceholder="Search job titles..."
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            filters={generatedFilters} 
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* ========================================= */}
        {/* LIST RENDERER (PAGINATED GRID) */}
        {/* ========================================= */}
        {paginatedCareers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:min-h-[500px] items-start">
            {paginatedCareers.map((job) => (
              <div key={job.id} className="animate-in fade-in duration-500 h-full">
                <CardCareer 
                  department={job.department}
                  title={job.title}
                  type={job.employment_type} // Mapping ke type
                  location={job.location}
                  applyUrl={job.applyURL}
                  detailUrl={job.detailURL}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400 min-h-[400px]">
            <p className="text-lg">No open positions found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchValue('');
                setFilterValues({});
                resetPageToFirst();
              }}
              className="mt-4 text-[#FFB800] hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ========================================= */}
        {/* PAGINATION CONTROLS */}
        {/* ========================================= */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 pt-4">
            
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-neutral-500 bg-white border border-neutral-200 rounded-full hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-2 mx-2">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                  disabled={page === '...'}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-colors ${
                    page === currentPage 
                      ? 'bg-[#FFB800] text-black border-[#FFB800]' // Sesuaikan dengan warna brand
                      : page === '...'
                        ? 'bg-transparent text-neutral-400 cursor-default'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <span className="sm:hidden text-sm font-medium text-neutral-500 mx-2">
              Page {currentPage} of {totalPages}
            </span>

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-6 py-2 text-sm font-medium text-neutral-800 bg-white border border-neutral-200 rounded-full hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            
          </div>
        )}

      </div>
    </section>
  );
}