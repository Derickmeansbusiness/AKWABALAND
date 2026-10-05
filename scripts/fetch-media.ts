/**
 * Download every curated asset from the Higgsfield CDN and produce the files
 * the manifest expects under public/media/akwaba/<id>/.
 *
 *   npm run media:fetch            → everything not yet present
 *   npm run media:fetch -- --force → re-download and re-encode
 *   npm run media:fetch -- --only aerial-reveal,entrance-gateway
 *
 * Images: WebP + AVIF at 640 / 960 / 1280 / 1920 / 2560 widths, plus a 24px
 * blur placeholder written to public/media/akwaba/placeholders.json.
 * Videos: if ffmpeg is on PATH, 1080p and 720p H.264 MP4 with audio stripped;
 * otherwise the original 4K MP4 is copied as the 1080 variant (muted at play).
 *
 * Runs with Node ≥ 22.18 type stripping: `node --experimental-strip-types`.
 */
import { createWriteStream, existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';
import { fetchableAssets, sourceFor, type MediaAsset } from '../src/data/mediaManifest.ts';
import { mediaSourceById } from '../src/data/mediaSources.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'media', 'akwaba');
const WIDTHS = [640, 960, 1280, 1920, 2560];

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1]?.split(',') ?? []) : null;

const hasFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
if (!hasFfmpeg) console.warn('ffmpeg not found — videos will be copied at source resolution and muted at playback.');

async function download(url: string, dest: string): Promise<void> {
  if (existsSync(dest) && !force) return;
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`${res.status} ${url}`);
  mkdirSync(path.dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(dest));
}

async function processImage(asset: MediaAsset, placeholders: Record<string, string>): Promise<void> {
  const source = sourceFor(asset);
  const dir = path.join(OUT, asset.id);
  const original = path.join(dir, `${asset.id}-source.png`);
  await download(source.remote, original);

  const img = sharp(original);
  const meta = await img.metadata();
  for (const w of WIDTHS) {
    if (meta.width && w > meta.width) continue;
    const webp = path.join(dir, `${asset.id}-${w}.webp`);
    const avif = path.join(dir, `${asset.id}-${w}.avif`);
    if (!existsSync(webp) || force) await img.clone().resize({ width: w }).webp({ quality: 82, effort: 5 }).toFile(webp);
    if (!existsSync(avif) || force) await img.clone().resize({ width: w }).avif({ quality: 58, effort: 6 }).toFile(avif);
  }
  // Largest source may be < 2560 wide (upscaled crops are 2752, fine; sheets are excluded).
  const largest = path.join(dir, `${asset.id}-2560.webp`);
  if (!existsSync(largest)) await img.clone().resize({ width: Math.min(2560, meta.width ?? 2560) }).webp({ quality: 82 }).toFile(largest);

  const tiny = await img.clone().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  placeholders[asset.id] = `data:image/webp;base64,${tiny.toString('base64')}`;
}

async function processVideo(asset: MediaAsset): Promise<void> {
  if (!asset.optionalVideo) return;
  const { desktop, mobile } = asset.optionalVideo;
  const source = mediaSourceById[desktop.sourceId];
  if (!source) throw new Error(`no source for video ${desktop.sourceId}`);
  const dir = path.join(OUT, asset.id);
  const original = path.join(dir, `${asset.id}-source.mp4`);
  await download(source.remote, original);

  const out1080 = path.join(ROOT, 'public', desktop.src);
  const out720 = mobile ? path.join(ROOT, 'public', mobile.src) : null;

  if (!hasFfmpeg) {
    if (!existsSync(out1080) || force) writeFileSync(out1080, readFileSync(original));
    return;
  }
  const encode = (outFile: string, height: number) => {
    if (existsSync(outFile) && !force) return;
    const r = spawnSync(
      'ffmpeg',
      ['-y', '-i', original, '-an', '-vf', `scale=-2:${height}`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile],
      { stdio: 'inherit' },
    );
    if (r.status !== 0) throw new Error(`ffmpeg failed for ${outFile}`);
  };
  encode(out1080, 1080);
  if (out720) encode(out720, 720);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const placeholderFile = path.join(OUT, 'placeholders.json');
  const placeholders: Record<string, string> = existsSync(placeholderFile) ? JSON.parse(readFileSync(placeholderFile, 'utf8')) : {};

  const todo = fetchableAssets.filter((a) => !only || only.has(a.id));
  let failures = 0;
  for (const asset of todo) {
    try {
      process.stdout.write(`▸ ${asset.id} `);
      await processImage(asset, placeholders);
      await processVideo(asset);
      console.log('ok');
    } catch (err) {
      failures++;
      console.log(`FAILED: ${(err as Error).message}`);
    }
  }
  writeFileSync(placeholderFile, JSON.stringify(placeholders, null, 0));
  console.log(`\n${todo.length - failures}/${todo.length} assets ready in public/media/akwaba`);
  if (failures) process.exitCode = 1;
}

main();
