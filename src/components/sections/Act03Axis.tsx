'use client';

import { useRef, useState } from 'react';
import { Act, ActMark } from '@/components/cinematic/Act';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { RevealLines } from '@/components/typography/RevealLines';
import { act03 } from '@/data/siteContent';
import { getMedia } from '@/data/mediaManifest';
import { useGsap } from '@/lib/animation/useGsap';
import { gsap, EASE } from '@/lib/animation/gsap';
import { createBeats, scrubAcross } from '@/lib/animation/beats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

/** Where each experience is "located" in the plaza — perspective positions, nearest last. Layout, not content. */
const WAYMARK_POSITIONS: { x: number; y: number; side: 'l' | 'r' }[] = [
  { x: 50, y: 40, side: 'r' },
  { x: 39, y: 48, side: 'l' },
  { x: 61, y: 50, side: 'r' },
  { x: 31, y: 58, side: 'l' },
  { x: 69, y: 60, side: 'r' },
  { x: 25, y: 70, side: 'l' },
  { x: 75, y: 72, side: 'r' },
  { x: 50, y: 84, side: 'r' },
];

/**
 * ACT 03 — THE CEREMONIAL AXIS
 * Opens from black onto the Heritage Hall forecourt. A slow push along the
 * water toward the hall; then the experiences are located in the plaza one by
 * one, as architectural wayfinding rather than UI.
 */
export function Act03Axis() {
  const section = useRef<HTMLElement | null>(null);
  const media = useRef<HTMLDivElement | null>(null);
  const fromBlack = useRef<HTMLDivElement | null>(null);
  const toBlack = useRef<HTMLDivElement | null>(null);
  const stmtBeat = useRef<HTMLDivElement | null>(null);
  const marks = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();
  const tier = useTier();
  const mobile = tier === 'mobile';
  const [stmtOn, setStmtOn] = useState(false);
  const asset = getMedia('heritage-hall-facade');

  useGsap(
    section,
    (_, el) => {
      scrubAcross(el, 0, 0.1, gsap.fromTo(fromBlack.current, { opacity: 1 }, { opacity: 0, ease: 'none' }), 0.4);
      scrubAcross(el, 0.94, 1, gsap.fromTo(toBlack.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.4);
      if (!reduced) {
        scrubAcross(el, 0, 0.9, gsap.fromTo(media.current, { scale: 1.14, yPercent: 2 }, { scale: 1.0, yPercent: 0, ease: 'none' }), 1);
      }
      createBeats(el, [{ el: stmtBeat.current!, from: 0.1, to: 0.4, onShow: () => setStmtOn(true), onHide: () => setStmtOn(false) }], reduced);

      // Waymarks: tick grows, dot lands, label fades — in sequence as the plaza is read.
      const n = WAYMARK_POSITIONS.length;
      marks.current.forEach((m, i) => {
        if (!m) return;
        const tick = m.querySelector('.waymark__tick');
        const label = m.querySelector('.waymark__label');
        const dot = m.querySelector('.waymark__dot');
        gsap.set(m, { opacity: 0 });
        gsap.set(tick, { scaleX: 0 });
        gsap.set([label, dot], { opacity: 0 });
        const from = 0.42 + (i / n) * 0.42;
        createBeats(
          el,
          [
            {
              el: m,
              from,
              to: 0.93,
              drift: 0,
              onShow: () => {
                gsap.to(tick, { scaleX: 1, duration: reduced ? 0.01 : 0.9, ease: EASE.reveal });
                gsap.to([dot, label], { opacity: 1, duration: reduced ? 0.01 : 0.8, ease: EASE.ui, delay: reduced ? 0 : 0.35 });
              },
            },
          ],
          reduced,
        );
      });
    },
    [reduced],
  );

  return (
    <Act id="03" ref={section} heightVh={mobile ? 260 : 340}>
      <div className="stage">
        <div ref={media} className="stage__layer" style={{ transformOrigin: '50% 45%' }}>
          <CinematicMedia asset={asset} />
        </div>
        <div className="stage__layer vignette" />
        <div className="stage__layer scrim--bottom" style={{ opacity: 0.5 }} />

        <ActMark id="03" />

        <div ref={stmtBeat} className="stage__content beat">
          <RevealLines lines={[act03.statement]} as="h2" className="display display--l display--caps" play={stmtOn} duration={1.5} />
        </div>

        {act03.wayfinding.map((label, i) => {
          const pos = WAYMARK_POSITIONS[i] ?? WAYMARK_POSITIONS[WAYMARK_POSITIONS.length - 1];
          const flip = pos.side === 'l';
          return (
            // outer div holds the position (CSS transform); inner div is what GSAP fades
            <div key={label} className="waymark" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: flip ? 'translate(-100%, -50%)' : 'translate(0, -50%)', opacity: 1 }} aria-hidden="true">
              <div
                ref={(el) => {
                  marks.current[i] = el;
                }}
                className="waymark__inner"
                style={{ direction: flip ? 'rtl' : 'ltr' }}
              >
                <span className="waymark__dot" />
                <span className="waymark__tick" style={{ transformOrigin: flip ? 'right' : 'left' }} />
                <span className="waymark__label label label--wide" style={{ direction: 'ltr' }}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
        <ul className="sr-only">
          {act03.wayfinding.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>

        <div ref={fromBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)' }} />
        <div ref={toBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)', opacity: 0 }} />
      </div>
    </Act>
  );
}
