import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
p.on('response', (r) => r.status() >= 400 && console.log(r.status(), r.url()));
await p.goto(process.argv[2] ?? 'http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(4000);
await b.close();
