import React, { forwardRef, useState, useEffect } from 'react';

const Textarea = forwardRef(({ 
  id, label, error, helpText, required, maxLength, className = '', 
  submitAttempted, // <-- Prop trigger
  onChange, onBlur, ...props 
}, ref) => {
  const [internalError, setInternalError] = useState('');
  const [internalValue, setInternalValue] = useState(props.value || props.defaultValue || '');
  const [charCount, setCharCount] = useState(internalValue.length);

  const validateField = (val) => {
    if (required && !val.trim()) {
      setInternalError(props['data-error'] || 'Message is required.');
      return false;
    }
    setInternalError('');
    return true;
  };

  // TRIGGER Submit Parent
  useEffect(() => {
    if (submitAttempted) {
      validateField(internalValue);
    }
  }, [submitAttempted, internalValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    setCharCount(val.length);
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
      <div className={`lnFormInput lnFormInput--textarea ${isInvalid ? 'is-invalid' : ''} ${props.disabled ? 'is-disabled' : ''}`} data-counter={!!maxLength}>
        <textarea
          id={id} ref={ref} className="lnFormInput__control" rows={props.rows || 4} placeholder=" "
          required={required} maxLength={maxLength}
          value={internalValue} onChange={handleChange} onBlur={handleBlur} {...props}
        />
        <label htmlFor={id} className="lnFormInput__label">
          {label}{required && <span className="req">*</span>}
        </label>
        {maxLength && (
          <span className="lnFormInput__counter" aria-live="polite">{charCount}/{maxLength}</span>
        )}
      </div>

      {(helpText || displayError) && (
        <small className={`lnFormInput__help text-body-b5 ${isInvalid ? 'text-red-500 is-active' : 'text-secondary'}`}>
          {displayError || helpText}
        </small>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;