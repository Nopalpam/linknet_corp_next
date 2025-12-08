import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.scss';

export const metadata: Metadata = {
  title: {
    default: 'LinkNet Corp',
    template: '%s | LinkNet Corp',
  },
  description: 'LinkNet Corp - Modern Web Application',
  keywords: ['linknet', 'web application', 'next.js'],
  authors: [{ name: 'LinkNet Corp' }],
  creator: 'LinkNet Corp',
  publisher: 'LinkNet Corp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'LinkNet Corp',
    title: 'LinkNet Corp',
    description: 'LinkNet Corp - Modern Web Application',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
