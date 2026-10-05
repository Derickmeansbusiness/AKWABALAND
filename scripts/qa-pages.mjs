import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [name, vp] of [['desktop', { width: 1600, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: name === 'mobile' ? 2 : 1 });
  for (const route of ['development', 'briefing', 'downloads']) {
    await p.goto(`http://localhost:3000/${route}`, { waitUntil: 'load', timeout: 60000 });
    await p.waitForTimeout(800);
    await p.screenshot({ path: `qa/screenshots/page-${route}-${name}.png`, fullPage: route !== 'briefing' });
  }
  await p.close();
}
await b.close();
