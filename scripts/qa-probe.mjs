/**
 * Debug probe: loads the experience, waits for the opening, and reports the
 * computed state of every revealed line and beat so invisible text can be
 * diagnosed without guessing.  node scripts/qa-probe.mjs [url] [scrollFraction]
 */
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:3000/';
const frac = Number(process.argv[3] ?? 0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(11000);
if (frac) {
  await p.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), frac);
  await p.waitForTimeout(2500);
}
const report = await p.evaluate(() => {
  const chain = (el) => {
    const out = [];
    let n = el;
    while (n && n !== document.body) {
      const cs = getComputedStyle(n);
      out.push(`${n.tagName.toLowerCase()}.${[...n.classList].join('.')}[op=${cs.opacity},vis=${cs.visibility},disp=${cs.display},z=${cs.zIndex},tf=${cs.transform.slice(0, 40)}]`);
      n = n.parentElement;
    }
    return out.join(' < ');
  };
  const lines = [...document.querySelectorAll('.line-mask > span')].map((s) => {
    const r = s.getBoundingClientRect();
    return { text: s.textContent.slice(0, 32), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], color: getComputedStyle(s).color, font: getComputedStyle(s).fontFamily.slice(0, 30), size: getComputedStyle(s).fontSize, chain: chain(s) };
  });
  const beats = [...document.querySelectorAll('.beat')].map((b) => ({ cls: b.className, op: getComputedStyle(b).opacity, tf: getComputedStyle(b).transform }));
  return { scrollY: window.scrollY, lines, beats, canvases: document.querySelectorAll('canvas').length };
});
console.log(JSON.stringify(report, null, 1));
await b.close();
