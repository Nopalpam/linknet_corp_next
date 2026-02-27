'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState, type FormEvent } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function ContactUsRenderer({ data, locale }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission — integrate real API as needed
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">{t(data.title, locale)}</h2>
          {data.description && <p className="mt-3 text-gray-600 max-w-xl mx-auto">{t(data.description, locale)}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            {data.address && (
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-brand-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: t(data.address, locale) || '' }} />
              </div>
            )}
            {data.phone && (
              <div className="flex gap-3 items-center">
                <svg className="w-6 h-6 text-brand-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className="text-gray-600">{data.phone}</span>
              </div>
            )}
            {data.email && (
              <div className="flex gap-3 items-center">
                <svg className="w-6 h-6 text-brand-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href={`mailto:${data.email}`} className="text-brand-600 hover:underline">{data.email}</a>
              </div>
            )}
            {data.map_embed && (
              <div className="mt-4 rounded-lg overflow-hidden border border-gray-200" dangerouslySetInnerHTML={{ __html: data.map_embed }} />
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{locale === 'id' ? 'Pesan Terkirim!' : 'Message Sent!'}</h3>
                <p className="text-gray-600 mt-2">{locale === 'id' ? 'Terima kasih, kami akan segera menghubungi Anda.' : 'Thank you, we will get back to you soon.'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'id' ? 'Nama' : 'Name'}</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'id' ? 'Subjek' : 'Subject'}</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'id' ? 'Pesan' : 'Message'}</label>
                  <textarea rows={4} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors">
                  {loading ? (locale === 'id' ? 'Mengirim...' : 'Sending...') : (locale === 'id' ? 'Kirim Pesan' : 'Send Message')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
