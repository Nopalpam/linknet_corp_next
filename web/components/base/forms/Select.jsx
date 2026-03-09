import React, { forwardRef, useState, useEffect } from 'react';

const Select = forwardRef(({ 
  id, label, options = [], error, helpText, required, className = '', 
  placeholder = 'Select one',
  submitAttempted, // <-- Prop trigger
  value, defaultValue, onChange, onBlur, ...props 
}, ref) => {
  const [internalError, setInternalError] = useState('');
  
  const isControlled = value !== undefined;
  const actualValue = isControlled ? value : (defaultValue || "");

  const validateField = (val) => {
    if (required && !val) {
      setInternalError(props['data-error'] || 'Please select one.');
      return false;
    }
    setInternalError('');
    return true;
  };

  // TRIGGER Submit Parent
  useEffect(() => {
    if (submitAttempted) {
      validateField(actualValue);
    }
  }, [submitAttempted, actualValue]);

  const handleChange = (e) => {
    if (!submitAttempted && internalError) setInternalError('');
    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    validateField(e.target.value);
    if (onBlur) onBlur(e);
  };

  const isInvalid = !!error || !!internalError;
  const displayError = error || internalError;

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