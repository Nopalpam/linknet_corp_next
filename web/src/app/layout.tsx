import type { Metadata } from "next";
import "./globals.css";
import { Navbar, FooterCorp } from "@/components/layout";
import { SITE_NAME } from "@/config/env";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - We LINK the nation for better lives`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "PT Link Net Tbk - Connecting Indonesia with reliable and innovative network solutions.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <FooterCorp />
      </body>
    </html>
  );
}
