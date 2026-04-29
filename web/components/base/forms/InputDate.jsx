import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Icon from '../Icon';

const InputDate = forwardRef(({
  id,
  label,
  type = 'date',
  error,
  helpText,
  required,
  className = '',
  submitAttempted,
  onChange,
  onBlur,
  value,
  defaultValue = '',
  ...props
}, ref) => {
  const inputRef = useRef(null);
  const [internalError, setInternalError] = useState('');
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? '');

  const isControlled = value !== undefined;
  const fieldValue = isControlled ? value : internalValue;

  useImperativeHandle(ref, () => inputRef.current);

  const validateField = (val) => {
    if (required && !String(val || '').trim()) {
      setInternalError(props['data-error'] || `${label} is required.`);
      return false;
    }

    setInternalError('');
    return true;
  };

  useEffect(() => {
    if (!isControlled) return;
    setInternalValue(value ?? '');
  }, [isControlled, value]);

  // Keep validation flow aligned with Input.jsx so submit-triggered forms behave consistently.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (submitAttempted) {
      validateField(fieldValue);
    }
  }, [submitAttempted, fieldValue]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleChange = (e) => {
    const nextValue = e.target.value;

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    if (!submitAttempted && internalError) {
      setInternalError('');
    }

    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    validateField(e.target.value);
    if (onBlur) onBlur(e);
  };

  const handleOpenPicker = (e) => {
    if (props.disabled) {
      e.preventDefault();
      return;
    }

    const input = inputRef.current;
    if (!input) return;

    // Use native behavior via label/input association — do not call `showPicker()`.
    // Focus so keyboard users still reach the control quickly.
    input.focus();
  };

  const isInvalid = !!error || !!internalError;
  const displayError = error || internalError;

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`lnFormInput ${isInvalid ? 'is-invalid' : ''} ${props.disabled ? 'is-disabled' : ''}`}
      >
        <input
          id={id}
          ref={inputRef}
          type={type}
          className="lnFormInput__control pr-16 text-[24px] font-medium leading-[1.2] text-black [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none"
          placeholder=" "
          required={required}
          value={fieldValue}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />

        <label htmlFor={id} className="lnFormInput__label text-[18px] leading-[1.25]">
          {label}
          {required && <span className="req">*</span>}
        </label>

        <label
          htmlFor={id}
          aria-label={`Open ${label || 'date'} picker`}
          onClick={handleOpenPicker}
          className={`absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-opacity hover:opacity-70 ${props.disabled ? 'pointer-events-none opacity-40 cursor-not-allowed' : ''}`}
        >
          <Icon name="calendar" style={{ '--icon-size': '24px' }} />
        </label>
      </div>

      {(helpText || displayError) && (
        <small className={`lnFormInput__help text-body-b5 ${isInvalid ? 'text-red-500 is-active' : 'text-secondary is-active'}`}>
          {displayError || helpText}
        </small>
      )}
    </div>
  );
});

InputDate.displayName = 'InputDate';

export default InputDate;
