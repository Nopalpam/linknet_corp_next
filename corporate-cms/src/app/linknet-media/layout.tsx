import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linknet Media - Channels & Content',
  description: 'Explore Linknet Media channels, trending content, and genres.',
};

export default function LinknetMediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
