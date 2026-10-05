import type { NextConfig } from 'next';

const isPrivate = (process.env.SITE_VISIBILITY ?? 'PRIVATE') !== 'PUBLIC';
const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://akwabaland.com').replace(/^https?:\/\//, '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 960, 1280, 1920, 2560],
    // Higgsfield CDN — used only while NEXT_PUBLIC_MEDIA_SOURCE=remote,
    // before media:fetch has populated public/media/akwaba.
    remotePatterns: [
      { protocol: 'https', hostname: 'd8j0ntlcm91z4.cloudfront.net' },
      { protocol: 'https', hostname: 'd2ol7oe51mr4n9.cloudfront.net' },
    ],
  },
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/icon.svg' }];
  },
  // One address. The Vercel preview host and www both land on the apex domain,
  // so every link anyone forwards reads akwabaland.com.
  async redirects() {
    return [
      { source: '/:path*', has: [{ type: 'host', value: 'akwabaland.vercel.app' }], destination: `https://${SITE_HOST}/:path*`, permanent: true },
      { source: '/:path*', has: [{ type: 'host', value: `www.${SITE_HOST}` }], destination: `https://${SITE_HOST}/:path*`, permanent: true },
    ];
  },
  async headers() {
    const base = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    // Belt and braces: robots meta is set in the layout; this header covers
    // downloads and anything a crawler might fetch without rendering HTML.
    if (isPrivate) base.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' });
    return [{ source: '/:path*', headers: base }];
  },
};

export default nextConfig;
