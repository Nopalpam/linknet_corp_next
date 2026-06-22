'use client';

/**
 * FieldReadOnly.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays a single read-only field in the "finish" state of a FormStep.
 *
 * Usage:
 *   <FieldReadOnly label="Alamat Pemasangan" value="Jl. Puri Indah Raya..." />
 *   <FieldReadOnly label="Company Email" value="yui@mediaindo.com" required />
 *
 * Props:
 *   label     {string}   Field label text
 *   value     {string}   Displayed value (falls back to "—" when empty)
 *   required  {boolean}  Append red asterisk to label (default: true)
 *   className {string?}  Extra modifier class on the root element
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function FieldReadOnly({
  label,
  value,
  required = true,
  className = '',
}) {
  return (
    <div className={`lnFieldReadOnly ${className}`}>
      <p className="lnFieldReadOnly__label text-caption-c1 text-secondary mb-1">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </p>
      <p className="lnFieldReadOnly__value text-body-b4 text-black leading-snug">
        {value || '—'}
      </p>
    </div>
  );
}
