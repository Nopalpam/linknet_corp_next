import React, { forwardRef, useState, useEffect, useRef } from 'react';
import Icon from '../Icon';

const SelectMultiple = forwardRef(({ 
  id, label, options = [], error, helpText, required, className = '', 
  placeholder = 'Select at least one.', // <-- Update placeholder
  submitAttempted, 
  value, defaultValue, onChange, onBlur, ...props 
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue || []);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasBlurred, setHasBlurred] = useState(false);
  
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const isControlled = value !== undefined;
  const actualValue = isControlled ? value : internalValue;

  // --- LOGIKA VALIDASI ---
  const getValidationMessage = (valArr) => {
    if (required && (!valArr || valArr.length === 0)) {
      return props['data-error'] || 'Please select at least one.';
    }

    return '';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery('');
          setHasBlurred(true);
          if (onBlur) onBlur({ target: { name: props.name, value: actualValue } });
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, actualValue, onBlur, props.name]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // --- LOGIKA HANDLE DATA ---
  const handleChange = (newValues) => {
    if (!isControlled) setInternalValue(newValues);
    if (onChange) {
      onChange({ target: { id, name: props.name, value: newValues } });
    }
  };

  const toggleOption = (optValue) => {
    const newValues = actualValue.includes(optValue)
      ? actualValue.filter(v => v !== optValue)
      : [...actualValue, optValue];
    handleChange(newValues);
  };

  const removeChip = (e, optValue) => {
    e.stopPropagation(); 
    handleChange(actualValue.filter(v => v !== optValue));
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasValue = actualValue.length > 0;
  const derivedError = submitAttempted || hasBlurred ? getValidationMessage(actualValue) : '';
  const displayError = error || derivedError;
  const isInvalid = !!displayError;

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      <div className={`lnFormInput ${isInvalid ? 'is-invalid' : ''} ${props.disabled ? 'is-disabled' : ''}`}>
        
        {/* CONTROL WRAPPER (Pengganti tag <select>) */}
        <div 
          className={`lnFormInput__control !h-auto min-h-[80px] flex flex-wrap items-center gap-1.5 !pt-[36px] !pb-[12px] px-4 cursor-${props.disabled ? 'not-allowed' : 'pointer'}`}
          onClick={() => {
            if (props.disabled) {
              return;
            }

            if (isOpen) {
              setIsOpen(false);
              setSearchQuery('');
              setHasBlurred(true);
              if (onBlur) onBlur({ target: { name: props.name, value: actualValue } });
              return;
            }

            setIsOpen(true);
          }}
        >
          {/* CHIPS */}
          {actualValue.map(val => {
            const opt = options.find(o => o.value === val);
            if (!opt) return null;
            return (
              <span 
                key={val} 
                className="lnSFChip is-active inline-flex items-center gap-1.5 px-3 py-1 text-body-b5 bg-secondary text-neutral-800 font-medium rounded-full z-10"
              >
                {opt.label}
                <button 
                  type="button" 
                  onClick={(e) => removeChip(e, val)}
                  className="bg-transparent border-none cursor-pointer opacity-50 hover:opacity-80 p-0 flex transition-opacity"
                >
                  <Icon name="close" />
                </button>
              </span>
            );
          })}

          {/* Placeholder Text ketika kosong */}
          {!hasValue && !isOpen && (
            <span className="text-neutral-400 text-base font-normal pointer-events-none w-full">
              {placeholder}
            </span>
          )}
        </div>

        {/* LABEL (Floating Label) */}
        <label 
          htmlFor={id} 
          className={`lnFormInput__label absolute left-4 pointer-events-none origin-top-left transition-all duration-200
            ${(hasValue || isOpen) ? 'top-2.5 scale-110 text-neutral-400' : 'top-5 scale-110 text-neutral-500'}
            ${isInvalid && 'text-red-500'}
          `}
        >
          {label}{required && <span className="text-red-500">*</span>}
        </label>
        
        {/* ARROW */}
        <Icon name="checklist" 
            className={`lnFormInput__arrow absolute right-4 md:right-5 top-3 pointer-events-none transition-transform`} 
            style={{ '--icon-size': '16px' }}
            aria-hidden="true"
        >
        </Icon >

        {/* DROPDOWN BOX */}
        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 md:max-w-[300px] p-2 z-[99] bg-white rounded-[12px] shadow-xl overflow-hidden flex flex-col lnSFDropdown">
            
            {/* SEARCH BOX */}
            <div className="flex items-center gap-3 border border-secondary rounded-[12px] p-2 bg-white lnSF__search min-h-auto">
              <span className="opacity-50 flex-shrink-0 lnSF__icon text-body-b3">
                <Icon name="search" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-body-b4 lnSF__input"
              />
            </div>

            {/* OPTIONS LIST */}
            <div className="max-h-[200px] overflow-y-auto py-2 grid gap-1 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = actualValue.includes(opt.value);
                  return (
                    <button 
                      key={opt.value}
                      type="button"
                      onClick={() => toggleOption(opt.value)}
                      className={`
                        flex justify-between items-center w-full font-medium text-left px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all border border-transparent
                        hover:bg-neutral-50
                        ${isSelected 
                            ? 'bg-[#FFB800]/10 text-neutral-900' 
                            : 'bg-transparent text-neutral-700'
                        }
                      `}
                    >
                      {opt.label}
                      {isSelected && (
                         <span className="text-[#FFB800]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                         </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-sm text-neutral-400">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* HELP / ERROR TEXT */}
      {(helpText || displayError) && (
        <small className={`mt-2 block text-xs ${isInvalid ? 'text-red-500 is-active' : 'text-neutral-500'}`}>
          {displayError || helpText}
        </small>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 10px; }
      `}</style>
    </div>
  );
});

SelectMultiple.displayName = 'SelectMultiple';
export default SelectMultiple;