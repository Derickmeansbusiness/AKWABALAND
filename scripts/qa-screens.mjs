/**
 * Visual QA: screenshots of the experience at several scroll depths across
 * desktop, tablet, mobile and a reduced-motion desktop. Requires a running
 * server (default http://localhost:3000) and the Playwright Chromium that the
 * cloud environment pre-installs; override with CHROMIUM_PATH.
 *
 *   npm run qa:screens -- --url http://localhost:3000 --out qa/screenshots
 */
import { chromium } from 'playwright-core';
import { mkdirSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const URL = opt('--url', 'http://localhost:3000');
const OUT = opt('--out', 'qa/screenshots');
const ONLY = opt('--only', null);

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  if (!existsSync(root)) return undefined;
  for (const dir of readdirSync(root)) {
    if (!dir.startsWith('chromium')) continue;
    for (const c of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome']) {
      const p = path.join(root, dir, c);
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

const DEVICES = {
  desktop: { viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 },
  tablet: { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'desktop-reduced': { viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' },
};

// Fractions of total scroll height to sample.
const DEPTHS = Array.from({ length: 61 }, (_, i) => i / 60);

const browser = await chromium.launch({ executablePath: findChromium(), args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
mkdirSync(OUT, { recursive: true });

for (const [name, device] of Object.entries(DEVICES)) {
  if (ONLY && name !== ONLY) continue;
  const ctx = await browser.newContext({ ...device, colorScheme: 'dark' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(11000); // let the Awakening speak its three lines
  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (const d of DEPTHS) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * d));
    await page.waitForTimeout(1400);
    await page.screenshot({ path: path.join(OUT, `${name}-${String(Math.round(d * 100)).padStart(3, '0')}.png`), timeout: 90000 });
  }
  const file = path.join(OUT, `${name}-errors.txt`);
  const { writeFileSync } = await import('node:fs');
  writeFileSync(file, errors.join('\n'));
  console.log(`${name}: ${DEPTHS.length} frames, ${errors.length} console errors`);
  await ctx.close();
}
await browser.close();
