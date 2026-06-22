import React from 'react';
import Icon from '../Icon';

export default function Checkbox({ 
  id, 
  label, 
  checked, 
  onChange, 
  className = '', 
  ...props 
}) {
  return (
    <label 
      htmlFor={id} 
      className={`lnCheckbox ${checked ? 'is-checked' : ''} ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        className="lnCheckbox__input"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <div className="lnCheckbox__box text-white">
        {checked && (
          <Icon name="check" />
        )}
      </div>
      <span className="lnCheckbox__label text-body-b5 font-regular">{label}</span>
    </label>
  );
}