'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { resolveImage } from '@/lib/media/resolve';
import { ActMarker, ActMark } from '@/components/cinematic/Act';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { RevealLines } from '@/components/typography/RevealLines';
import { Label } from '@/components/typography/Display';
import { act00, act01, act02 } from '@/data/siteContent';
import { getMedia } from '@/data/mediaManifest';
import { useGsap } from '@/lib/animation/useGsap';
import { gsap } from '@/lib/animation/gsap';
import { createBeats, onProgress, scrubAcross } from '@/lib/animation/beats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

const AfricaSculpture = dynamic(() => import('@/components/three/AfricaSculpture').then((m) => m.AfricaSculpture), { ssr: false });

/**
 * THE OPENING — Acts 00, 01 and 02 on one uncut stage.
 *
 * 00 Awakening  (0.00–0.33)  near-black; the bronze continent surfaces; three
 *                            lines on their own clock; scroll sends the camera
 *                            back and a point of light toward the Gulf; the
 *                            dark lifts off the aerial.
 * 01 Reveal     (0.33–0.66)  the aerial on a slow push; name, descriptor,
 *                            statement.
 * 02 Arrival    (0.66–1.00)  the aerial grows toward the gateway in its lower
 *                            field; the entrance frame rises through it already
 *                            mid-dolly; the steadicam clip walks us in; the
 *                            stage closes through black.
 *
 * One stage means no seams: every transition is opacity or scale on layers
 * that never leave the viewport.
 */
export function Opening() {
  const section = useRef<HTMLDivElement | null>(null);
  const dark = useRef<HTMLDivElement | null>(null);
  const aerial = useRef<HTMLDivElement | null>(null);
  const entrance = useRef<HTMLDivElement | null>(null);
  const toBlack = useRef<HTMLDivElement | null>(null);
  const titleBeat = useRef<HTMLDivElement | null>(null);
  const descBeat = useRef<HTMLDivElement | null>(null);
  const stmtBeat = useRef<HTMLDivElement | null>(null);
  const welcomeBeat = useRef<HTMLDivElement | null>(null);
  const lineBeat = useRef<HTMLDivElement | null>(null);
  const mark01 = useRef<HTMLDivElement | null>(null);
  const mark02 = useRef<HTMLDivElement | null>(null);
  const hint01 = useRef<HTMLDivElement | null>(null);

  const progress = useRef(0);
  const reduced = useReducedMotion();
  const tier = useTier();
  const mobile = tier === 'mobile';

  const [line, setLine] = useState(-1);
  const [scrolledAway, setScrolledAway] = useState(false);
  const [titleOn, setTitleOn] = useState(false);
  const [stmtOn, setStmtOn] = useState(false);
  const [welcomeOn, setWelcomeOn] = useState(false);

  const hero = getMedia('aerial-reveal');
  const gate = getMedia('entrance-gateway');

  // The only two images worth preloading: the frame under the Awakening and the one that follows it.
  preload(resolveImage(hero).src, { as: 'image', fetchPriority: 'high' });
  preload(resolveImage(gate).src, { as: 'image' });

  // The three lines arrive on their own clock, one replacing the last.
  useEffect(() => {
    const times = reduced ? [0, 0, 0] : [2400, 6400, 10400];
    const ids = times.map((t, i) => window.setTimeout(() => setLine(i), t));
    return () => ids.forEach(clearTimeout);
  }, [reduced]);

  useGsap(
    section,
    (_, el) => {
      onProgress(el, (p) => {
        progress.current = Math.min(1, p / 0.33); // the sculpture reads its own 0..1
        setScrolledAway(p > 0.03);
      });

      // ── 00 → 01: the dark lifts off the aerial ─────────────────────────
      scrubAcross(el, 0.24, 0.33, gsap.fromTo(dark.current, { opacity: 1 }, { opacity: 0, ease: 'none' }), 0.6);

      // ── the aerial's camera, one continuous path ──────────────────────
      if (!reduced) {
        const cam = gsap.timeline();
        cam
          .fromTo(aerial.current, { scale: 1.18, filter: 'brightness(0.5)' }, { scale: 1.1, filter: 'brightness(1)', ease: 'none', duration: 0.33 }, 0)
          .to(aerial.current, { scale: 1.0, ease: 'none', duration: 0.33 }, 0.33)
          .to(aerial.current, { scale: mobile ? 1.22 : 1.38, yPercent: -6, ease: 'none', duration: 0.3 }, 0.66);
        scrubAcross(el, 0, 0.96, cam, 0.9);
        scrubAcross(el, 0.74, 1, gsap.fromTo(entrance.current, { scale: 1.14 }, { scale: 1.0, ease: 'none' }), 1.1);
      } else {
        gsap.set(aerial.current, { filter: 'brightness(1)' });
      }
      // ── 01 → 02: the entrance rises through the aerial ────────────────
      scrubAcross(el, 0.74, 0.84, gsap.fromTo(entrance.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.6);
      // ── close through black ───────────────────────────────────────────
      scrubAcross(el, 0.955, 1, gsap.fromTo(toBlack.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.4);

      createBeats(
        el,
        [
          { el: mark01.current!, from: 0.33, to: 0.66, drift: 0 },
          { el: mark02.current!, from: 0.66, to: 0.955, drift: 0 },
          { el: hint01.current!, from: 0.33, to: 0.38, drift: 0 },
          { el: titleBeat.current!, from: 0.345, to: 0.47, onShow: () => setTitleOn(true), onHide: () => setTitleOn(false) },
          { el: descBeat.current!, from: 0.485, to: 0.575 },
          { el: stmtBeat.current!, from: 0.59, to: 0.70, onShow: () => setStmtOn(true), onHide: () => setStmtOn(false) },
          { el: welcomeBeat.current!, from: 0.84, to: 0.935, onShow: () => setWelcomeOn(true), onHide: () => setWelcomeOn(false) },
          { el: lineBeat.current!, from: 0.89, to: 0.95 },
        ],
        reduced,
      );
    },
    [reduced, mobile],
  );

  const height = mobile ? 680 : 900;

  return (
    <div ref={section} className="act-group" style={{ height: `${height}vh` }}>
      <ActMarker id="00" from={0} to={0.33} />
      <ActMarker id="01" from={0.33} to={0.66} />
      <ActMarker id="02" from={0.66} to={1} />

      <div className="stage" style={{ background: 'var(--obsidian)' }}>
        {/* aerial: the ground truth under everything */}
        <div ref={aerial} className="stage__layer" style={{ transformOrigin: '50% 82%' }}>
          <CinematicMedia asset={hero} priority />
        </div>

        {/* entrance: rises through the aerial */}
        <div ref={entrance} className="stage__layer" style={{ transformOrigin: '50% 58%', opacity: 0 }}>
          <CinematicMedia asset={gate} priority />
        </div>

        <div className="stage__layer vignette" />
        <div className="stage__layer scrim--bottom" style={{ opacity: 0.6 }} />

        {/* 00: the dark and the bronze */}
        <div ref={dark} className="stage__layer" style={{ background: 'var(--obsidian)' }}>
          <AfricaSculpture progressRef={progress} />
          <div className="stage__content stage__content--low" aria-live="polite">
            <div className="stack">
              {act00.lines.map((text, i) => (
                <RevealLines key={text} lines={[text]} as="p" className="display display--m display--caps" play={line === i && !scrolledAway} duration={1.8} />
              ))}
            </div>
          </div>
          {!scrolledAway && line >= 2 && (
            <div className="scroll-hint" aria-hidden="true">
              <span className="scroll-hint__line" />
            </div>
          )}
        </div>

        {/* 01 */}
        <div ref={mark01} className="beat">
          <ActMark id="01" />
        </div>
        <div ref={titleBeat} className="stage__content beat">
          <div style={{ display: 'grid', gap: 'clamp(1rem, 2.4vh, 1.75rem)', justifyItems: 'center' }}>
            <RevealLines lines={[act01.title]} as="h1" className="display display--xl display--caps" play={titleOn} duration={1.6} />
            <div style={{ display: 'grid', gap: '0.9rem', justifyItems: 'center' }}>
              <span className="rule rule--accent" />
              <Label as="p" wide>
                {act01.subtitle}
              </Label>
            </div>
          </div>
        </div>
        <div ref={descBeat} className="stage__content stage__content--start beat">
          <p className="lead" style={{ maxWidth: '38ch' }}>
            {act01.descriptor}
          </p>
        </div>
        <div ref={stmtBeat} className="stage__content beat">
          <RevealLines lines={act01.statement} as="p" className="display display--l display--caps" play={stmtOn} duration={1.5} />
        </div>
        <div ref={hint01} className="scroll-hint beat" aria-hidden="true">
          <span className="scroll-hint__line" />
          <span className="label label--faint">{act01.scrollHint}</span>
        </div>

        {/* 02 */}
        <div ref={mark02} className="beat">
          <ActMark id="02" />
        </div>
        <div ref={welcomeBeat} className="stage__content beat">
          <div style={{ display: 'grid', gap: '0.5rem', justifyItems: 'center' }}>
            <RevealLines lines={[act02.welcome[0]]} as="p" className="label label--wide" play={welcomeOn} duration={1} />
            <RevealLines lines={[act02.welcome[1]]} as="h2" className="display display--xl display--caps" play={welcomeOn} duration={1.6} delay={0.15} />
          </div>
        </div>
        <div ref={lineBeat} className="stage__content stage__content--start beat">
          <p className="display display--s" style={{ fontStyle: 'italic', color: 'var(--stone)' }}>
            {act02.line}
          </p>
        </div>

        <div ref={toBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)', opacity: 0 }} />
      </div>
    </div>
  );
}
