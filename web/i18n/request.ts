// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Definisikan daftar locale yang didukung secara lokal di sini
// atau import dari file routing jika Anda membuatnya
const locales = ['en', 'id'];

export default getRequestConfig(async ({ requestLocale }) => {
  // Ambil locale dari parameter asinkron
  const locale = await requestLocale;

  // Validasi jika locale tidak didukung
  if (!locales.includes(locale as any)) notFound();

  // Mengambil pesan. 
  // Jika Anda menggunakan file index.js di folder messages, 
  // pastikan path-nya benar relatif terhadap file ini.
  const messages = (await import(`../messages/index.js`)).getMessages(locale);

  /* ATAU jika Anda ingin langsung import file spesifik tanpa file index perantara:
     const messages = (await import(`../messages/uspData-${locale}.js`)).default;
  */

  return {
    locale,
    messages: await messages
  };
});