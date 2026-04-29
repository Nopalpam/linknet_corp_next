'use client';

import { usePathname } from 'next/navigation';

import Footer from './Footer';
import Navbar from './Navbar';

export default function LayoutChrome({ children }) {
  const pathname = usePathname();
  const isPreviewRoute = /^\/(en|id)\/preview\/(fiber|media)(?:\/|$)/.test(pathname || '');

  if (isPreviewRoute) {
    return children;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
