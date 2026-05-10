'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon'; // Sesuaikan path

// ==========================================
// SUB-COMPONENT: CUSTOM DROPDOWN
// ==========================================
function CustomDropdown({ filter, selectedValue, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fitur "Click Outside" untuk menutup dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = filter.options.find(opt => opt.value === selectedValue);
  const displayLabel = selectedOption ? selectedOption.label : filter.placeholder;

  return (
    // relative tetap dipertahankan sebagai anchor dropdown
    <div className="relative shrink-0" ref={dropdownRef}>
      
      {/* 1. TRIGGER BUTTON (Chip) */}
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox" 
        aria-expanded={isOpen}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors ${
          isOpen || selectedValue 
            ? 'border-yellow-500 bg-yellow-50 text-black' 
            : 'border-neutral-100 bg-white text-neutral-700 hover:border-neutral-300'
        }`}
      >
        <span className="whitespace-nowrap">{displayLabel}</span>
        <Icon 
          name="chevron-down" 
          style={{ '--icon-size': '16px' }} 
          className={`text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* 2. DROPDOWN MENU (Floating Listbox) */}
      {isOpen && (
        <div 
          role="listbox" 
          aria-label={filter.placeholder}
          className="absolute left-0 top-full mt-2 w-48 bg-white border border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-[16px] flex flex-col py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Opsi "All" (Reset Value) */}
          <button 
            type="button" 
            role="option" 
            aria-selected={!selectedValue}
            onClick={() => {
              onChange(filter.key, ""); 
              setIsOpen(false);
            }}
            className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
              !selectedValue 
                ? 'bg-neutral-50 text-neutral-900 font-bold' 
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            All
          </button>

          {/* List Options */}
          {filter.options.map((opt, idx) => {
            const isActive = selectedValue === opt.value;
            return (
              <button 
                key={idx}
                type="button" 
                role="option" 
                aria-selected={isActive}
                onClick={() => {
                  onChange(filter.key, opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                  isActive 
                    ? 'bg-neutral-50 text-neutral-900 font-bold' 
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}


// ==========================================
// MAIN COMPONENT: SEARCH FILTER BAR
// ==========================================
export default function SearchFilterBar({
  searchPlaceholder = "Use the keyword title of the Financial Statement",
  searchValue = "",
  onSearchChange,
  filters = [], 
  filterValues = {}, 
  onFilterChange,
  showSearch = true,
  className = ""
}) {
  return (
    <form 
      // PERBAIKAN 1: Hapus overflow-x-hidden dari sini
      className={`flex flex-col md:flex-row items-center md:items-stretch w-full bg-white rounded-[16px] px-4 py-3 pt-5 md:px-5 md:pt-4 md:py-4 gap-4 md:gap-0 shadow-md transition-all ${className}`}
      role="search" 
      aria-label="Search and Filter"
      onSubmit={(e) => e.preventDefault()} 
    >
      
      {/* 1. SEARCH INPUT */}
      {showSearch && (
      <label className="flex-1 flex items-center w-full gap-3 cursor-text md:py-2">
        <Icon 
          name="search" 
          className="text-neutral-400 shrink-0" 
          style={{ '--icon-size': '20px' }} 
        />
        <input 
          type="search" 
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-body-b4 text-neutral-900 placeholder:text-neutral-400 focus:ring-0 p-0"
          autoComplete="off"
        />
      </label>
      )}

      {/* 2. DIVIDER */}
      {showSearch && filters && filters.length > 0 && (
        <span className="hidden md:block w-px bg-neutral-100 mx-5 my-2 shrink-0" aria-hidden="true"></span>
      )}

      {/* 3. FILTERS (Custom Dropdowns) */}
      {filters && filters.length > 0 && (
        <div 
          // PERBAIKAN 2: Ganti overflow-x-auto & no-scrollbar menjadi flex-wrap
          className="flex flex-wrap items-center w-full md:w-auto gap-2.5 shrink-0 pt-2 md:pt-0 pb-1 md:pb-0" 
          role="group" 
          aria-label="Filters"
        >
          {filters.map((filter, index) => (
            <CustomDropdown 
              key={index}
              filter={filter}
              selectedValue={filterValues[filter.key]}
              onChange={onFilterChange}
            />
          ))}
        </div>
      )}
    </form>
  );
}
