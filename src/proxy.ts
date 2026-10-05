import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE, requiresAccessCode } from '@/lib/visibility';

/**
 * Access gate for PASSWORD_PROTECTED deployments. Everything else passes.
 * The cookie value is an HMAC-free opaque token compared against the code
 * itself hashed at request time — adequate for a shared presentation code,
 * not an authentication system. Do not put confidential documents behind
 * this alone; keep them off the public bucket.
 */
export function proxy(request: NextRequest) {
  if (!requiresAccessCode()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/access') || pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname.startsWith('/geo/')) {
    return NextResponse.next();
  }

  const expected = process.env.SITE_ACCESS_CODE ?? '';
  const provided = request.cookies.get(ACCESS_COOKIE)?.value ?? '';
  if (expected && provided === tokenFor(expected)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/access';
  url.searchParams.set('next', pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

/** Simple deterministic token so the raw code never sits in the cookie. */
export function tokenFor(code: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < code.length; i++) {
    h ^= code.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `v1.${h.toString(16)}.${code.length}`;
}

export const config = {
  matcher: ['/((?!api/health).*)'],
};
