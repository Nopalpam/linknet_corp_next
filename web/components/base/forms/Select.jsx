import React, { forwardRef, useState } from 'react';

const Select = forwardRef(({ 
  id, label, options = [], error, helpText, required, className = '', 
  placeholder = 'Select one',
  submitAttempted, // <-- Prop trigger
  value, defaultValue, onChange, onBlur, ...props 
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [hasBlurred, setHasBlurred] = useState(false);
  
  const isControlled = value !== undefined;
  const actualValue = isControlled ? (value || '') : internalValue;

  const getValidationMessage = (val) => {
    if (required && !val) {
      return props['data-error'] || 'Please select one.';
    }

    return '';
  };

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }

    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    setHasBlurred(true);
    if (onBlur) onBlur(e);
  };

  const derivedError = submitAttempted || hasBlurred ? getValidationMessage(actualValue) : '';
  const displayError = error || derivedError;
  const isInvalid = !!displayError;

  return (
    <div className={`w-full ${className}`}>
      <div className={`lnFormInput lnFormInput--select ${isInvalid ? 'is-invalid' : ''} ${props.disabled ? 'is-disabled' : ''}`}>
        <select
          id={id} ref={ref} className="lnFormInput__control" required={required}
          value={isControlled ? value : undefined}
          defaultValue={!isControlled ? (defaultValue || "") : undefined}
          onChange={handleChange} onBlur={handleBlur} {...props}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <label htmlFor={id} className="lnFormInput__label">
          {label}{required && <span className="req">*</span>}
        </label>
        <span className="lnFormInput__arrow" aria-hidden="true"></span>
      </div>

      {(helpText || displayError) && (
        <small className={`lnFormInput__help text-body-b5 ${isInvalid ? 'text-red-500 is-active' : 'text-secondary'}`}>
          {displayError || helpText}
        </small>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;