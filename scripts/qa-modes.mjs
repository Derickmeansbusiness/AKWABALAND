/**
 * Presentation-mode and keyboard checks: open ?presentation=true&audience=investor,
 * press → through the acts, confirm the indicator advances, then screenshot.
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:3000/';
mkdirSync('qa/screenshots', { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(`${URL}?presentation=true&audience=investor`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(3000);
const seen = [];
for (let i = 0; i < 11; i++) {
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(2200);
  seen.push(await p.evaluate(() => document.querySelector('[role="toolbar"] span')?.textContent?.trim()));
  if (i === 4) await p.screenshot({ path: 'qa/screenshots/presentation-act05.png' });
}
await p.screenshot({ path: 'qa/screenshots/presentation-end.png' });
console.log('indicator sequence:', seen.join(' | '));
console.log('page errors:', errors.length ? errors : 'none');

// Keyboard access to the map
await p.goto(`${URL}#nations`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(2500);
await p.evaluate(() => document.querySelector('.map-country[data-interactive="true"]')?.focus());
await p.keyboard.press('ArrowRight');
await p.keyboard.press('ArrowDown');
await p.waitForTimeout(600);
console.log('focused country:', await p.evaluate(() => document.activeElement?.getAttribute('aria-label')), '| panel:', await p.evaluate(() => document.querySelector('.nations__name')?.textContent));
await p.screenshot({ path: 'qa/screenshots/map-keyboard.png' });
await b.close();
