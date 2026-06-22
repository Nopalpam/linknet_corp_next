import React, { forwardRef, useId, useState } from 'react';

function joinClassNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function getDefaultRadioClassName({ checked, isInvalid, isDisabled, className }) {
  return joinClassNames(
    'lnRadio flex items-center gap-3 rounded-2xl border border-transparent bg-white px-4 py-3',
    checked && 'is-checked bg-[#EAF5F2]',
    !checked && !isDisabled && 'hover:bg-[var(--bg-light-1,#f8f9fa)]',
    isInvalid && 'is-invalid border-[var(--color-danger,#dc2626)]',
    isDisabled && 'is-disabled cursor-not-allowed opacity-60',
    className,
  );
}

function getCardRadioClassName({ variant, checked, isInvalid, isDisabled, className }) {

  let stateClass = '';
  if (checked) {
    stateClass = 'border border-primary !bg-[#FFF9EC]';
  } else if (!checked) {
    stateClass = 'border border-neutral bg-white';
  }

  return joinClassNames(
    'lnRadio flex justify-center rounded-[16px] px-4 py-3 transition-colors duration-200 cursor-pointer',
    variant === 'card' ? 'lnRadio--card' : 'lnRadio--card-date min-h-[80px] min-w-[100px]',
    stateClass,
    isInvalid && '!border-[var(--color-danger,#dc2626)] is-invalid',
    isDisabled && '!22cursor-not-allowed !border-none bg-secondary is-disabled opacity-50',
    className,
  );
}



function RadioBase({
  id,
  name,
  label,
  value,
  checked = false,
  onChange,
  onBlur,
  className = '',
  error,
  helpText,
  required = false,
  submitAttempted = false,
  variant = 'default',
  children,
  dayLabel,
  dateLabel,
  ...props
}, ref) {
  const generatedId = useId();
  const inputId = id || `radio-${generatedId}`;
  const helpId = `${inputId}-help`;
  const [internalError, setInternalError] = useState('');

  const requiredErrorMessage = props['data-error'] || `${label || 'This field'} is required.`;
  const isDisabled = !!props.disabled;
  const submitError = submitAttempted && required && !checked ? requiredErrorMessage : '';
  const isInvalid = !!error || !!submitError || !!internalError;
  const displayError = error || submitError || internalError;

  const validateField = (isSelected) => {
    if (required && !isSelected) {
      setInternalError(requiredErrorMessage);
      return false;
    }

    setInternalError('');
    return true;
  };

  const handleChange = (event) => {
    if (internalError) setInternalError('');
    if (submitAttempted) validateField(event.target.checked);
    if (onChange) onChange(event);
  };

  const handleBlur = (event) => {
    validateField(event.target.checked);
    if (onBlur) onBlur(event);
  };

  const rootClassName = variant === 'default'
    ? getDefaultRadioClassName({ checked, isInvalid, isDisabled, className })
    : getCardRadioClassName({ variant, checked, isInvalid, isDisabled, className });

  const wrapperClassName = variant === 'default' ? 'w-full' : 'w-fit max-w-full';

  const renderDefaultContent = () => (
    <>
      <span className={joinClassNames(
        'lnRadio__dot flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 bg-transparent transition-all duration-200',
        checked && 'border-primary',
      )}>
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <span className="lnRadio__label text-body-b5 font-regular">
        {label}
      </span>
    </>
  );

  const renderCardContent = () => (
    <span className="lnRadio__cardContent flex w-full flex-col items-center justify-center text-center">
      <span className={joinClassNames(
        'lnRadio__cardLabel text-body-b4 font-medium',
        isDisabled ? 'text-[var(--color-neutral-400,#a3a3a3)]' : 'text-black',
      )}>
        {label}
      </span>
    </span>
  );

  const renderCardDateContent = () => (
    <span className="lnRadio__cardContent flex w-full flex-col items-center justify-center gap-1.5 text-center">
      {dayLabel && (
        <span className={joinClassNames(
          'lnRadio__day text-caption-c1 font-regular leading-[1.2]',
          isDisabled ? 'text-[var(--color-neutral-400,#a3a3a3)]' : 'text-secondary',
        )}>
          {dayLabel}
        </span>
      )}
      {dateLabel && (
        <span className={joinClassNames(
          'lnRadio__date text-body-b4 font-medium leading-[1.1]',
          isDisabled ? 'text-[var(--color-neutral-400,#a3a3a3)]' : 'text-black',
        )}>
          {dateLabel}
        </span>
      )}
    </span>
  );

  const renderContent = () => {
    if (children) return children;
    if (variant === 'card') return renderCardContent();
    if (variant === 'card-date') return renderCardDateContent();
    return renderDefaultContent();
  };

  if (variant === 'default' && !helpText && !displayError) {
    return (
      <label htmlFor={inputId} className={rootClassName}>
        <input
          ref={ref}
          type="radio"
          id={inputId}
          name={name}
          value={value}
          className="lnRadio__input hidden"
          checked={checked}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isDisabled}
          {...props}
        />
        {renderDefaultContent()}
      </label>
    );
  }

  return (
    <div className={wrapperClassName}>
      <label htmlFor={inputId} className={rootClassName}>
        <input
          ref={ref}
          type="radio"
          id={inputId}
          name={name}
          value={value}
          className="lnRadio__input hidden"
          checked={checked}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          disabled={isDisabled}
          aria-describedby={helpText || displayError ? helpId : undefined}
          {...props}
        />
        {renderContent()}
      </label>

 
    </div>
  );
}

const Radio = forwardRef(RadioBase);
Radio.displayName = 'Radio';

export const RadioCard = forwardRef((props, ref) => (
  <RadioBase ref={ref} variant="card" {...props} />
));
RadioCard.displayName = 'RadioCard';

export const RadioCardDate = forwardRef((props, ref) => (
  <RadioBase ref={ref} variant="card-date" {...props} />
));
RadioCardDate.displayName = 'RadioCardDate';

export default Radio;
