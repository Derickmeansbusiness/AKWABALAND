'use server';

import { redirect } from 'next/navigation';

/**
 * Briefing requests are forwarded to BRIEFING_WEBHOOK_URL as JSON (a Slack
 * incoming webhook, Zapier, Make, or an internal endpoint). Without one, the
 * request is logged on the server so nothing is silently lost during the
 * concept phase. Set the variable before sharing the link.
 */
export async function requestBriefing(formData: FormData) {
  if (String(formData.get('website') ?? '')) redirect('/briefing?sent=1'); // honeypot: pretend success

  const payload = {
    name: String(formData.get('name') ?? '').slice(0, 200),
    organisation: String(formData.get('organisation') ?? '').slice(0, 200),
    role: String(formData.get('role') ?? '').slice(0, 200),
    email: String(formData.get('email') ?? '').slice(0, 200),
    interest: String(formData.get('interest') ?? '').slice(0, 200),
    message: String(formData.get('message') ?? '').slice(0, 2000),
    receivedAt: new Date().toISOString(),
  };
  if (!payload.name || !payload.email || !payload.organisation) redirect('/briefing?error=1');

  const url = process.env.BRIEFING_WEBHOOK_URL;
  if (url) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: `Briefing request from ${payload.name} (${payload.organisation})`, ...payload }) });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      redirect('/briefing?error=1');
    }
  } else {
    console.info('[briefing] request received (no BRIEFING_WEBHOOK_URL configured)', payload);
  }
  redirect('/briefing?sent=1');
}
