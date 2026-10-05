import type { MediaAsset, OptionalVideo } from '@/data/mediaManifest';
import { sourceFor } from '@/data/mediaManifest';
import { mediaSourceById } from '@/data/mediaSources';

export type MediaSourceMode = 'local' | 'remote';

export function mediaMode(): MediaSourceMode {
  return process.env.NEXT_PUBLIC_MEDIA_SOURCE === 'remote' ? 'remote' : 'local';
}

export const IMAGE_WIDTHS = [640, 960, 1280, 1920, 2560] as const;

export interface ResolvedImage {
  /** fallback src for <img> */
  src: string;
  /** srcset strings per format; empty in remote mode */
  avifSrcSet: string;
  webpSrcSet: string;
  width: number;
  height: number;
}

function ladder(asset: MediaAsset, ext: 'avif' | 'webp'): string {
  const dir = `/media/akwaba/${asset.id}`;
  const maxW = Math.min(2560, asset.width);
  return IMAGE_WIDTHS.filter((w) => w <= maxW)
    .map((w) => `${dir}/${asset.id}-${w}.${ext} ${w}w`)
    .join(', ');
}

/**
 * @param preview  true on phones: in remote mode use Higgsfield's reduced
 *                 `_min.webp` rather than the 3840px PNG. A phone cannot hold
 *                 fifteen 33 MB decoded frames; the compositor gives up and
 *                 every animation appears frozen.
 */
export function resolveImage(asset: MediaAsset, preview = false): ResolvedImage {
  if (mediaMode() === 'remote') {
    const source = sourceFor(asset);
    const src = preview && source.remotePreview ? source.remotePreview : source.remote;
    return { src, avifSrcSet: '', webpSrcSet: '', width: asset.width, height: asset.height };
  }
  return {
    src: asset.src,
    avifSrcSet: ladder(asset, 'avif'),
    webpSrcSet: ladder(asset, 'webp'),
    width: asset.width,
    height: asset.height,
  };
}

export interface ResolvedVideo {
  desktop: string;
  mobile: string;
  durationSeconds: number;
}

export function resolveVideo(video: OptionalVideo): ResolvedVideo {
  if (mediaMode() === 'remote') {
    const remote = mediaSourceById[video.desktop.sourceId]?.remote ?? '';
    return { desktop: remote, mobile: remote, durationSeconds: video.durationSeconds };
  }
  return {
    desktop: video.desktop.src,
    mobile: video.mobile?.src ?? video.desktop.src,
    durationSeconds: video.durationSeconds,
  };
}

/** Placeholder colour while a frame loads — chosen from the image's tone, never grey. */
export const toneColour: Record<MediaAsset['visualTone'], string> = {
  'dawn-warm': '#2a2118',
  'day-neutral': '#23221f',
  'golden-hour': '#2c2214',
  sunset: '#2a1a12',
  night: '#0c0c10',
  'interior-dark': '#15120e',
  'interior-light': '#2b2823',
  'interior-warm': '#2a1f14',
};
