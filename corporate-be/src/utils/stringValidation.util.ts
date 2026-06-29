export const hasWhitespace = (value: string): boolean => {
  for (const char of value) {
    if (char.trim() === '') return true;
  }
  return false;
};

export const isLowercaseSlug = (value: string): boolean => {
  if (!value || value.startsWith('-') || value.endsWith('-')) return false;

  let lastWasDash = false;
  for (const char of value) {
    const isAllowed = (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char === '-';
    if (!isAllowed) return false;
    if (char === '-' && lastWasDash) return false;
    lastWasDash = char === '-';
  }

  return true;
};

export const isDottedLowercaseIdentifier = (value: string): boolean => {
  if (!value || value.startsWith('.') || value.endsWith('.')) return false;

  const labels = value.split('.');
  return labels.every((label) => {
    if (!label) return false;
    for (const char of label) {
      if (!((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char === '_')) {
        return false;
      }
    }
    return true;
  });
};
