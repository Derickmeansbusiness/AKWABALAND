/** Does scroll-driven motion actually run on a touch device? Samples transforms at several depths under mobile emulation. */
import { chromium } from 'playwright-core';
const URL = process.argv[2] ?? 'http://localhost:3000/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(4000);
const sample = async (label) => {
  const r = await p.evaluate(() => {
    const layer = document.querySelector('.act-group .stage__layer');
    const dark = document.querySelectorAll('.act-group .stage__layer')[4];
    const vis = [...document.querySelectorAll('.beat')].filter((b) => getComputedStyle(b).opacity > 0.5).length;
    return { y: Math.round(scrollY), aerial: getComputedStyle(layer).transform.slice(0, 36), darkOpacity: getComputedStyle(dark).opacity, visibleBeats: vis, lenis: document.documentElement.className.includes('lenis'), reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  });
  console.log(label, JSON.stringify(r));
};
await sample('top   ');
for (const f of [0.03, 0.06, 0.1, 0.15]) {
  await p.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), f);
  await p.waitForTimeout(1500);
  await sample(`@${f}  `);
}
// native touch scroll gesture, as a thumb would
await p.touchscreen.tap(195, 700);
await p.mouse.wheel(0, 1200);
await p.waitForTimeout(1500);
await sample('wheel ');
await b.close();
