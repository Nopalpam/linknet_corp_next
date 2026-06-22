import React, { forwardRef, useState } from 'react';

const Textarea = forwardRef(({ 
  id, label, error, helpText, required, maxLength, className = '', 
  submitAttempted, // <-- Prop trigger
  onChange, onBlur, ...props 
}, ref) => {
  const [internalValue, setInternalValue] = useState(props.defaultValue || '');
  const [hasBlurred, setHasBlurred] = useState(false);

  const isControlled = props.value !== undefined;
  const inputValue = isControlled ? (props.value || '') : internalValue;
  const charCount = inputValue.length;

  const getValidationMessage = (val) => {
    if (required && !String(val || '').trim()) {
      return props['data-error'] || 'Message is required.';
    }

    return '';
  };

  const handleChange = (e) => {
    const val = e.target.value;

    if (!isControlled) {
      setInternalValue(val);
    }

    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    setHasBlurred(true);
    if (onBlur) onBlur(e);
  };

  const derivedError = submitAttempted || hasBlurred ? getValidationMessage(inputValue) : '';
  const displayError = error || derivedError;
  const isInvalid = !!displayError;

  return (
    <div className={`w-full ${className}`}>
      <div className={`lnFormInput lnFormInput--textarea ${isInvalid ? 'is-invalid' : ''} ${props.disabled ? 'is-disabled' : ''}`} data-counter={!!maxLength}>
        <textarea
          id={id} ref={ref} className="lnFormInput__control" rows={props.rows || 4} placeholder=" "
          required={required} maxLength={maxLength}
          value={inputValue} onChange={handleChange} onBlur={handleBlur} {...props}
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