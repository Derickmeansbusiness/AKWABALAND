'use client';

import { forwardRef, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { MediaAsset } from '@/data/mediaManifest';
import { mediaMode, resolveImage, resolveVideo, toneColour } from '@/lib/media/resolve';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

export interface CinematicMediaProps {
  asset: MediaAsset;
  /** eager + high fetch priority: hero and arrival only */
  priority?: boolean;
  /** allow the clip when one exists (default true) */
  video?: boolean;
  /** play the clip once rather than looping */
  once?: boolean;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
}

/**
 * The still is the truth; the clip is a gift. The image always renders, sized
 * by a pre-encoded AVIF/WebP ladder. When a clip exists, is allowed, and the
 * section is near the viewport, the video loads muted, fades in over the still
 * once it is actually playing, and pauses again when far away. Nothing waits
 * on the network.
 */
export const CinematicMedia = forwardRef<HTMLDivElement, CinematicMediaProps>(function CinematicMedia(
  { asset, priority = false, video = true, once = false, className, style, sizes = '100vw' },
  ref,
) {
  const reduced = useReducedMotion();
  const tier = useTier();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const mobile = tier === 'mobile';
  const img = resolveImage(asset, mobile);
  // Phones get the clip only once media:fetch has produced a 720p transcode; the
  // remote fallback is the raw 4K MP4, which is never right on a phone.
  const clipAllowed = video && !reduced && !(mobile && mediaMode() === 'remote');
  const clip = asset.optionalVideo && clipAllowed ? resolveVideo(asset.optionalVideo) : null;
  const clipSrc = clip ? (mobile ? clip.mobile : clip.desktop) : null;

  const crop = tier === 'mobile' ? asset.mobileCrop : asset.desktopCrop;
  const objectPosition = crop.position ?? `${asset.focalPoint.x * 100}% ${asset.focalPoint.y * 100}%`;

  useEffect(() => {
    const node = videoRef.current;
    const wrap = wrapRef.current;
    if (!node || !wrap || !clipSrc) return;

    let loaded = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!loaded) {
            // iOS checks the attribute, not just the property, before allowing autoplay.
            node.muted = true;
            node.defaultMuted = true;
            node.setAttribute('muted', '');
            node.src = clipSrc;
            node.load();
            loaded = true;
          }
          node.play().catch(() => {
            /* autoplay denied: the still stands in, silently */
          });
        } else if (!node.paused) {
          node.pause();
        }
      },
      { rootMargin: '60% 0px 60% 0px', threshold: 0 },
    );
    io.observe(wrap);
    const onPlaying = () => setPlaying(true);
    node.addEventListener('playing', onPlaying);
    return () => {
      io.disconnect();
      node.removeEventListener('playing', onPlaying);
      node.pause();
      node.removeAttribute('src');
      node.load();
    };
  }, [clipSrc]);

  return (
    <div
      ref={(el) => {
        wrapRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={['cm', className].filter(Boolean).join(' ')}
      style={{ background: toneColour[asset.visualTone], ...style }}
      data-media={asset.id}
    >
      <picture>
        {img.avifSrcSet && <source type="image/avif" srcSet={img.avifSrcSet} sizes={sizes} />}
        {img.webpSrcSet && <source type="image/webp" srcSet={img.webpSrcSet} sizes={sizes} />}
        {/* Plain <img> on purpose: the ladder is pre-encoded AVIF/WebP, so Next's optimizer would only re-encode 2560px frames per request. */}
        <img
          className="cm__img"
          src={img.src}
          width={img.width}
          height={img.height}
          alt={asset.alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          style={{ objectPosition }}
        />
      </picture>
      {clipSrc && (
        <video
          ref={videoRef}
          className={['cm__video', playing ? 'is-playing' : ''].join(' ')}
          muted
          playsInline
          loop={!once}
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          style={{ objectPosition }}
        />
      )}
    </div>
  );
});
