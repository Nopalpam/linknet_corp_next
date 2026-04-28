import React, {
  forwardRef,
  useEffect,
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
  const [internalError, setInternalError] = useState('');
  const [internalFile, setInternalFile] = useState(defaultValue);

  const isControlled = value !== undefined;
  const selectedFile = isControlled ? value : internalFile;

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

  const validateField = (file) => {
    if (required && !file) {
      setInternalError(props['data-error'] || `${label} is required.`);
      return false;
    }

    if (file) {
      const extension = getFileExtension(file.name);

      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        setInternalError(
          props['data-error-format'] || 'Only PDF, PNG, JPG, and JPEG files are allowed.'
        );
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        setInternalError(
          props['data-error-size'] || 'Maximum file size is 2 MB.'
        );
        return false;
      }
    }

    setInternalError('');
    return true;
  };

  // Keep the same submit-trigger validation flow used by the other form inputs in this codebase.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (submitAttempted) {
      validateField(selectedFile);
    }
  }, [submitAttempted, selectedFile]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleOpenPicker = () => {
    if (props.disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const nextFile = e.target.files?.[0] || null;

    if (!nextFile) {
      setSelectedFile(null);
      if (!submitAttempted && internalError) setInternalError('');
      if (onChange) onChange(e);
      return;
    }

    const isValid = validateField(nextFile);

    if (!isValid) {
      clearNativeInput();
      setSelectedFile(null);
      return;
    }

    setSelectedFile(nextFile);
    if (internalError) setInternalError('');
    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    validateField(selectedFile);
    if (onBlur) onBlur(e);
  };

  const handleRemove = () => {
    clearNativeInput();
    setSelectedFile(null);
    setInternalError('');
    if (onRemove) onRemove();
    emitEmptyChange();
  };

  const isInvalid = !!error || !!internalError;
  const displayError = error || internalError;

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
