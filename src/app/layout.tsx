import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { brand } from '@/data/siteContent';
import { isIndexable } from '@/lib/visibility';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://akwabaland.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s — ${brand.name}`,
  },
  description: brand.descriptor,
  robots: isIndexable()
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  referrer: 'strict-origin-when-cross-origin',
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.descriptor,
    type: 'website',
    url: '/',
    siteName: brand.name,
  },
};

export const viewport: Viewport = {
  themeColor: '#090908',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} grain`}>
      <body>{children}</body>
    </html>
  );
}
