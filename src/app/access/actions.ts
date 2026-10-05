'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_COOKIE } from '@/lib/visibility';
import { tokenFor } from '@/proxy';

export async function grantAccess(formData: FormData) {
  const code = String(formData.get('code') ?? '');
  const next = String(formData.get('next') ?? '/');
  const expected = process.env.SITE_ACCESS_CODE ?? '';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  if (!expected || code !== expected) {
    redirect(`/access?e=1&next=${encodeURIComponent(safeNext)}`);
  }
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokenFor(expected), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect(safeNext);
}
