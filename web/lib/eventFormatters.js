function getValidDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatShortMonthDay(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function formatEventDateLabel({ date, startDate, endDate, start_date, end_date }) {
  const singleDate = getValidDate(date);
  const rangeStart = getValidDate(startDate || start_date);
  const rangeEnd = getValidDate(endDate || end_date);

  if (singleDate) {
    return formatShortDate(singleDate);
  }

  if (rangeStart && rangeEnd) {
    const sameYear = rangeStart.getUTCFullYear() === rangeEnd.getUTCFullYear();

    if (sameYear) {
      return `${formatShortMonthDay(rangeStart)} - ${formatShortDate(rangeEnd)}`;
    }

    return `${formatShortDate(rangeStart)} - ${formatShortDate(rangeEnd)}`;
  }

  if (rangeStart) return formatShortDate(rangeStart);
  if (rangeEnd) return formatShortDate(rangeEnd);

  return '';
}

export function formatEventTimestamp(value) {
  const date = getValidDate(value);

  if (!date) return value || '-';

  const datePart = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });

  return `${datePart}, ${timePart}`;
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

export function formatEventTimeLabel({
  timeStart,
  timeEnd,
  time_start,
  time_end,
  date,
  startDate,
  endDate,
  start_date,
  end_date,
}) {
  const start = getValidDate(timeStart || time_start || date || startDate || start_date);
  const end = getValidDate(timeEnd || time_end || endDate || end_date);

  if (start && end) {
    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  if (start) return formatTime(start);
  if (end) return formatTime(end);

  return '';
}