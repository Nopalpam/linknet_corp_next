// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // Ambil locale dari parameter asinkron
  const locale = await requestLocale;

  // Validasi jika locale tidak didukung
  if (!locales.includes(locale as any)) notFound();

  // Mengambil pesan
  const messages = (await import(`../messages/index.js`)).getMessages(locale);

  return {
    locale,
    messages: await messages
  };
});