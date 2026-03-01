/**
 * Contact Us Renderer
 * Clean form + contact info with design system styling
 */

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
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        <div className="text-center mb-10 md:mb-14">
          {t(data.label, locale) && (
            <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
              {t(data.label, locale)}
            </div>
          )}
          <h2 className="text-headline-h3 font-bold text-black mt-3 leading-tight">
            {t(data.title, locale)}
          </h2>
          {data.description && (
            <p className="text-body-b4 text-secondary mt-4 max-w-xl mx-auto">
              {t(data.description, locale)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            {data.address && (
              <div className="flex gap-4">
                <span className="icon icon__map-pin text-warning flex-shrink-0 mt-1" style={{ '--icon-size': '24px' } as React.CSSProperties} />
                <div className="text-body-b5 text-secondary" dangerouslySetInnerHTML={{ __html: t(data.address, locale) || '' }} />
              </div>
            )}
            {data.phone && (
              <div className="flex gap-4 items-center">
                <span className="icon icon__phone text-warning flex-shrink-0" style={{ '--icon-size': '24px' } as React.CSSProperties} />
                <span className="text-body-b5 text-secondary">{data.phone}</span>
              </div>
            )}
            {data.email && (
              <div className="flex gap-4 items-center">
                <span className="icon icon__mail text-warning flex-shrink-0" style={{ '--icon-size': '24px' } as React.CSSProperties} />
                <a href={`mailto:${data.email}`} className="text-body-b5 text-warning hover:underline">{data.email}</a>
              </div>
            )}
            {data.map_embed && (
              <div className="mt-6 rounded-2xl overflow-hidden border border-neutral-100" dangerouslySetInnerHTML={{ __html: data.map_embed }} />
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-light-2 rounded-2xl p-6 md:p-8">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="icon icon__check text-green-600" style={{ '--icon-size': '32px' } as React.CSSProperties} />
                </div>
                <h3 className="text-body-b3 font-bold text-neutral-900">
                  {locale === 'id' ? 'Pesan Terkirim!' : 'Message Sent!'}
                </h3>
                <p className="text-body-b5 text-secondary mt-2">
                  {locale === 'id' ? 'Terima kasih, kami akan segera menghubungi Anda.' : 'Thank you, we will get back to you soon.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-body-b5 font-bold text-neutral-800 mb-1.5">
                    {locale === 'id' ? 'Nama' : 'Name'}
                  </label>
                  <input type="text" required className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-warning/30 focus:border-warning transition-colors text-body-b5" />
                </div>
                <div>
                  <label className="block text-body-b5 font-bold text-neutral-800 mb-1.5">Email</label>
                  <input type="email" required className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-warning/30 focus:border-warning transition-colors text-body-b5" />
                </div>
                <div>
                  <label className="block text-body-b5 font-bold text-neutral-800 mb-1.5">
                    {locale === 'id' ? 'Subjek' : 'Subject'}
                  </label>
                  <input type="text" required className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-warning/30 focus:border-warning transition-colors text-body-b5" />
                </div>
                <div>
                  <label className="block text-body-b5 font-bold text-neutral-800 mb-1.5">
                    {locale === 'id' ? 'Pesan' : 'Message'}
                  </label>
                  <textarea rows={4} required className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-warning/30 focus:border-warning transition-colors text-body-b5" />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full justify-center">
                  {loading
                    ? (locale === 'id' ? 'Mengirim...' : 'Sending...')
                    : (locale === 'id' ? 'Kirim Pesan' : 'Send Message')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
