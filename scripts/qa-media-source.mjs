import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
await p.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(3000);
const srcs = await p.evaluate(() => [...document.querySelectorAll('img.cm__img')].map((i) => i.getAttribute('src')));
const hosts = {};
for (const s of srcs) { const k = s.startsWith('http') ? new URL(s).host : s.split('/').slice(0, 3).join('/'); hosts[k] = (hosts[k] ?? 0) + 1; }
console.log(srcs.length, 'images by source:', hosts);
await b.close();
