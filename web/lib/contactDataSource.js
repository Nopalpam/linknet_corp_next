const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function localizedValue(value, locale = 'en') {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object' && !Array.isArray(value)) {
    return String(value[locale] || value.en || value.id || value.label || value.title || '').trim();
  }
  return String(value).trim();
}

function normalizePhoneNumbers(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        type: item?.type || 'phone',
        label: item?.label || (item?.type === 'whatsapp' ? 'WhatsApp' : 'Phone Number'),
        number: item?.number || item?.phone || item?.value || '',
      }))
      .filter((item) => item.number);
  }

  if (typeof value === 'string' && value.trim()) {
    return [{ type: 'phone', label: 'Phone Number', number: value.trim() }];
  }

  return [];
}

function normalizePhoneHref(number = '', type = 'phone') {
  const digits = String(number).replace(/[^\d+]/g, '');
  if (!digits) return '#';
  if (type === 'whatsapp') return `https://wa.me/${digits.replace(/^\+/, '')}`;
  return `tel:${digits}`;
}

export function normalizeContactSettings(settings = {}, locale = 'en') {
  const contact = settings.contact || {};
  const general = settings.general_branding || {};
  const site = general.site || {};
  const phoneNumbers = normalizePhoneNumbers(contact.phone_numbers || contact.phone || settings.contact_phone);
  const primaryPhone = phoneNumbers[0] || null;
  const email = localizedValue(contact.email || settings.contact_email);
  const address = localizedValue(site.address || contact.address || settings.contact_address, locale);

  return {
    email,
    emailHref: email ? `mailto:${email}` : '#',
    phoneNumbers,
    primaryPhone,
    phoneHref: primaryPhone ? normalizePhoneHref(primaryPhone.number, primaryPhone.type) : '#',
    address,
    socials: Array.isArray(contact.socials) ? contact.socials : [],
  };
}

export async function fetchPublicContactSettings(locale = 'en') {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/public`, { cache: 'no-store' });
    if (!response.ok) return normalizeContactSettings({}, locale);
    const json = await response.json();
    return normalizeContactSettings(json?.data || {}, locale);
  } catch {
    return normalizeContactSettings({}, locale);
  }
}
