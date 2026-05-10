'use client';

export const MEDIA_EMPTY_MESSAGE = 'Data not available';

export default function MediaEmptyState({
  message = MEDIA_EMPTY_MESSAGE,
  className = '',
}) {
  return (
    <p className={`py-10 text-center text-body-b4 text-secondary ${className}`}>
      {message}
    </p>
  );
}
