'use client';

import { useRef, useState } from 'react';
import { Act, ActMark } from '@/components/cinematic/Act';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { RevealLines } from '@/components/typography/RevealLines';
import { partnership } from '@/data/partnership';
import { getMedia } from '@/data/mediaManifest';
import { useGsap } from '@/lib/animation/useGsap';
import { gsap, EASE } from '@/lib/animation/gsap';
import { createBeats, scrubAcross } from '@/lib/animation/beats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

/**
 * ACT 08 — THE PARTNERSHIP
 * One composition divided by space and type. Two columns of what each side
 * gains, drawn toward the centre by the scroll until they resolve into a
 * single lockup. Ceremonial pace; no handshake, no flags, no emblems.
 */
export function Act08Partnership() {
  const section = useRef<HTMLElement | null>(null);
  const media = useRef<HTMLDivElement | null>(null);
  const fromBlack = useRef<HTMLDivElement | null>(null);
  const toBlack = useRef<HTMLDivElement | null>(null);
  const left = useRef<HTMLDivElement | null>(null);
  const right = useRef<HTMLDivElement | null>(null);
  const lockupBeat = useRef<HTMLDivElement | null>(null);
  const resolveBeat = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const tier = useTier();
  const mobile = tier === 'mobile';
  const [lockupOn, setLockupOn] = useState(false);
  const [resolveOn, setResolveOn] = useState(false);
  const bg = getMedia('hospitality-terrace');

  useGsap(
    section,
    (_, el) => {
      scrubAcross(el, 0, 0.08, gsap.fromTo(fromBlack.current, { opacity: 1 }, { opacity: 0, ease: 'none' }), 0.4);
      scrubAcross(el, 0.95, 1, gsap.fromTo(toBlack.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.4);
      if (!reduced && media.current) scrubAcross(el, 0, 1, gsap.fromTo(media.current, { scale: 1.0 }, { scale: 1.1, ease: 'none' }), 1);

      // the two sides: points arrive in sequence, then both columns move to the centre and dissolve
      const lPoints = left.current!.querySelectorAll('li');
      const rPoints = right.current!.querySelectorAll('li');
      createBeats(
        el,
        [
          { el: left.current!, from: 0.06, to: 0.98, drift: 0 },
          { el: right.current!, from: 0.06, to: 0.98, drift: 0 },
          {
            el: [left.current!, right.current!],
            from: 0.1,
            drift: 0,
            onShow: () => {
              gsap.to(lPoints, { opacity: 1, y: 0, duration: reduced ? 0.01 : 1.1, stagger: reduced ? 0 : 0.12, ease: EASE.statement, overwrite: 'auto' });
              gsap.to(rPoints, { opacity: 1, y: 0, duration: reduced ? 0.01 : 1.1, stagger: reduced ? 0 : 0.12, ease: EASE.statement, delay: reduced ? 0 : 0.25, overwrite: 'auto' });
            },
            onHide: () => gsap.to([lPoints, rPoints], { opacity: 0, y: 10, duration: 0.5, overwrite: 'auto' }),
          },
          { el: lockupBeat.current!, from: 0.72, to: 0.86, onShow: () => setLockupOn(true), onHide: () => setLockupOn(false) },
          { el: resolveBeat.current!, from: 0.86, onShow: () => setResolveOn(true), onHide: () => setResolveOn(false) },
        ],
        reduced,
      );
      gsap.set([lPoints, rPoints], { opacity: 0, y: 10 });
      const converge = gsap.timeline();
      converge.to(left.current, { xPercent: mobile ? 0 : 42, opacity: 0, ease: 'none' }, 0).to(right.current, { xPercent: mobile ? 0 : -42, opacity: 0, ease: 'none' }, 0);
      scrubAcross(el, 0.5, 0.72, converge, 0.9);
    },
    [reduced, mobile],
  );

  return (
    <Act id="08" ref={section} heightVh={mobile ? 300 : 400}>
      <div className="stage" style={{ background: 'var(--obsidian)' }}>
        <div ref={media} className="stage__layer">
          <CinematicMedia asset={bg} video={false} />
        </div>
        <div className="stage__layer scrim--full" style={{ opacity: 0.86 }} />
        <div className="stage__layer vignette" />
        <ActMark id="08" />

        <div className="partner">
          <div ref={left} className="partner__col beat">
            <span className="label label--accent">{partnership.left.title}</span>
            <ul className="partner__points">
              {partnership.left.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div ref={right} className="partner__col partner__col--right beat">
            <span className="label label--accent">{partnership.right.title}</span>
            <ul className="partner__points">
              {partnership.right.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div ref={lockupBeat} className="stage__content beat">
          <RevealLines lines={[partnership.lockup]} as="p" className="display display--xl display--caps" play={lockupOn} duration={1.6} />
        </div>
        <div ref={resolveBeat} className="stage__content beat">
          <RevealLines lines={partnership.resolution} as="h2" className="display display--l display--caps" play={resolveOn} duration={1.5} />
        </div>

        <div ref={fromBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)' }} />
        <div ref={toBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)', opacity: 0 }} />
      </div>
    </Act>
  );
}
