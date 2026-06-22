import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Icon from '../Icon';

const ACCEPTED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];
const ACCEPT_ATTRIBUTE = '.pdf,.png,.jpg,.jpeg';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const DEFAULT_HELP_TEXT = 'Only PNG, JPG and PDF files are supported. Max file size is 2mb';

const getFileExtension = (fileName = '') => {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
};

const InputFile = forwardRef(({
  id,
  label,
  error,
  helpText = DEFAULT_HELP_TEXT,
  required,
  className = '',
  submitAttempted,
  value,
  defaultValue = null,
  onChange,
  onBlur,
  onRemove,
  accept = ACCEPT_ATTRIBUTE,
  ...props
}, ref) => {
  const inputRef = useRef(null);
  const [customError, setCustomError] = useState('');
  const [internalFile, setInternalFile] = useState(defaultValue);
  const [hasBlurred, setHasBlurred] = useState(false);

  const isControlled = value !== undefined;
  const selectedFile = isControlled ? (value ?? null) : internalFile;

  useImperativeHandle(ref, () => inputRef.current);

  const clearNativeInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const setSelectedFile = (file) => {
    if (!isControlled) {
      setInternalFile(file);
    }
  };

  const emitEmptyChange = () => {
    if (onChange) {
      onChange({
        target: {
          id,
          name: props.name,
          value: null,
          files: [],
        },
      });
    }
  };

  const getValidationMessage = (file) => {
    if (required && !file) {
      return props['data-error'] || `${label} is required.`;
    }

    if (file) {
      const extension = getFileExtension(file.name);

      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        return props['data-error-format'] || 'Only PDF, PNG, JPG, and JPEG files are allowed.';
      }

      if (file.size > MAX_FILE_SIZE) {
        return props['data-error-size'] || 'Maximum file size is 2 MB.';
      }
    }

    return '';
  };

  const handleOpenPicker = () => {
    if (props.disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const nextFile = e.target.files?.[0] || null;
    setCustomError('');

    if (!nextFile) {
      setSelectedFile(null);
      if (onChange) onChange(e);
      return;
    }

    const validationMessage = getValidationMessage(nextFile);

    if (validationMessage) {
      setHasBlurred(true);
      setCustomError(validationMessage);
      clearNativeInput();
      setSelectedFile(null);
      return;
    }

    setHasBlurred(true);
    setSelectedFile(nextFile);
    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    setHasBlurred(true);
    if (onBlur) onBlur(e);
  };

  const handleRemove = () => {
    clearNativeInput();
    setSelectedFile(null);
    setCustomError('');
    setHasBlurred(true);
    if (onRemove) onRemove();
    emitEmptyChange();
  };

  const derivedError = customError || (submitAttempted || hasBlurred ? getValidationMessage(selectedFile) : '');
  const displayError = error || derivedError;
  const isInvalid = !!displayError;

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full">
        <div
          className={`mb-2 block text-body-b5 font-regular ${isInvalid ? 'text-red-500' : 'text-black'}`}
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </div>

        <input
          id={id}
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={props.disabled}
          {...props}
        />

        {!selectedFile ? (
          <button
            type="button"
            onClick={handleOpenPicker}
            disabled={props.disabled}
            className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-body-b5 font-medium leading-[1.2] transition-colors ${
              props.disabled
                ? 'cursor-not-allowed border-neutral-200 bg-light-1 text-secondary'
                : isInvalid
                  ? 'border-red-500 bg-white text-black'
                  : 'border-[#D9D9D9] bg-white text-black hover:border-neutral-400'
            }`}
          >
            Choose File
          </button>
        ) : (
          <div
            className={`flex w-full items-center gap-4 rounded-full px-2 py-1 md:px-4 inline-flex shrink-0 justify-center ${
              props.disabled ? 'bg-light-1' : 'bg-[#F5F5F5]'
            } ${isInvalid ? 'border border-red-500' : 'border border-transparent'}`}
          >
            <div className='flex gap-2 w-full'>
              <span className="items-center justify-center rounded-full bg-[#FFB800] px-3 py-1 text-caption-c1 font-medium leading-none text-black">
                {getFileExtension(selectedFile.name).toUpperCase()}
              </span>

              <span className="min-w-0 flex-1 truncate text-body-b5 font-medium leading-[1.2] text-black">
                {selectedFile.name}
              </span>
            </div>

            {!props.disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black transition-opacity hover:opacity-70"
                aria-label={`Remove ${selectedFile.name}`}
              >
                <Icon name="close" style={{ '--icon-size': '24px' }} />
              </button>
            )}
          </div>
        )}
      </div>

      <small className={`mt-4 block text-body-b5 ${isInvalid ? 'text-red-500 is-active' : 'text-secondary'}`}>
        {displayError || helpText}
      </small>
    </div>
  );
});

InputFile.displayName = 'InputFile';

export default InputFile;
