import React, { forwardRef, useState, useEffect } from 'react';

const Input = forwardRef(({ 
  id, label, type = 'text', error, helpText, required, className = '', 
  submitAttempted, // <-- Prop baru untuk trigger dari luar
  onChange, onBlur, ...props 
}, ref) => {
  const [internalError, setInternalError] = useState('');
  const [internalValue, setInternalValue] = useState(props.value || props.defaultValue || '');

  const onlyDigits = (s) => (s || '').replace(/\D+/g, '');
  const isPhoneValid = (raw) => /^0\d{9,}$/.test(onlyDigits(raw));
  const isEmailValid = (raw) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test((raw || '').trim());
  const autoFormatPhone = (raw) => onlyDigits(raw).replace(/(.{4})/g, '$1 ').trim();

  useEffect(() => {
    setInternalValue(props.value || props.defaultValue || '');
  }, [props.value, props.defaultValue]);

  // Fungsi sentral untuk mengecek validasi
  const validateField = (val) => {
    if (required && !val.trim()) {
      setInternalError(props['data-error'] || `${label} is required.`);
      return false;
    } else if (val) {
      if ((type === 'tel' || props['data-validate'] === 'phone') && !isPhoneValid(val)) {
        setInternalError(props['data-error-phone'] || 'Phone is required.');
        return false;
      } else if ((type === 'email' || props['data-validate'] === 'email') && !isEmailValid(val)) {
        setInternalError(props['data-error-email'] || 'Email is required.');
        return false;
      }
    }
    setInternalError('');
    return true;
  };

  // TRIGGER: Jika tombol submit diklik dari parent, jalankan validasi
  useEffect(() => {
    if (submitAttempted) {
      validateField(internalValue);
    }
  }, [submitAttempted, internalValue]); // Re-validasi otomatis jika user ngetik setelah gagal submit

  const handleChange = (e) => {
    let val = e.target.value;
    if (type === 'tel' || props['data-autofmt'] === 'phone') {
      val = autoFormatPhone(val);
      e.target.value = val;
    }
    setInternalValue(val);
    
    // Hapus pesan error saat mulai ngetik (jika belum pernah submit)
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
      {/* Memasang class is-invalid agar CSS SASS kamu membuat border & label jadi merah */}
      <div className={`lnFormInput ${isInvalid ? 'is-invalid' : ''} ${props.disabled ? 'is-disabled' : ''}`}>
        <input
          id={id} ref={ref} type={type} className="lnFormInput__control" placeholder=" "
          required={required} value={internalValue} onChange={handleChange} onBlur={handleBlur}
          {...props}
        />
        <label htmlFor={id} className="lnFormInput__label">
          {label}
          {required && <span className="req">*</span>}
        </label>
      </div>

      {(helpText || displayError) && (
        <small className={`lnFormInput__help text-body-b5 ${isInvalid ? 'text-red-500 is-active' : 'text-secondary'}`}>
          {displayError || helpText}
        </small>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
