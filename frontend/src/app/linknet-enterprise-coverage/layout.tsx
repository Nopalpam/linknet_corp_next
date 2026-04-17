import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linknet Enterprise - Coverage Check',
  description: 'Cek ketersediaan jaringan Linknet Enterprise di lokasi Anda.',
};

export default function LinknetEnterpriseCoverageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
