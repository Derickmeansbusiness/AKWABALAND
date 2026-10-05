'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { Act, ActMark } from '@/components/cinematic/Act';
import { RevealLines } from '@/components/typography/RevealLines';
import { act06 } from '@/data/siteContent';
import { useGsap } from '@/lib/animation/useGsap';
import { gsap } from '@/lib/animation/gsap';
import { createBeats, onProgress, scrubAcross } from '@/lib/animation/beats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

const Globe = dynamic(() => import('@/components/three/Globe').then((m) => m.Globe), { ssr: false });

/**
 * ACT 06 — WHY THE UAE
 * From the flat continent to the sphere. Three statements as the globe turns
 * from Africa to the Gulf and the arcs gather; then the title and the two
 * sentences that carry the argument.
 */
export function Act06WhyUAE() {
  const section = useRef<HTMLElement | null>(null);
  const globeWrap = useRef<HTMLDivElement | null>(null);
  const fromBlack = useRef<HTMLDivElement | null>(null);
  const toBlack = useRef<HTMLDivElement | null>(null);
  const seq = useRef<(HTMLDivElement | null)[]>([]);
  const titleBeat = useRef<HTMLDivElement | null>(null);
  const progress = useRef(0);
  const reduced = useReducedMotion();
  const tier = useTier();
  const mobile = tier === 'mobile';
  const [seqOn, setSeqOn] = useState<number>(-1);

  useGsap(
    section,
    (_, el) => {
      onProgress(el, (p) => {
        progress.current = p;
      });
      scrubAcross(el, 0, 0.08, gsap.fromTo(fromBlack.current, { opacity: 1 }, { opacity: 0, ease: 'none' }), 0.4);
      scrubAcross(el, 0.95, 1, gsap.fromTo(toBlack.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.4);
      if (!reduced && globeWrap.current && !mobile) {
        // the sphere eases from centre to the right as the argument needs room on the left
        scrubAcross(el, 0.55, 0.75, gsap.fromTo(globeWrap.current, { xPercent: 0 }, { xPercent: 18, ease: 'none' }), 0.8);
      }
      const windows: [number, number][] = [
        [0.08, 0.26],
        [0.28, 0.46],
        [0.48, 0.64],
      ];
      createBeats(
        el,
        [
          ...windows.map(([from, to], i) => ({ el: seq.current[i]!, from, to, onShow: () => setSeqOn(i), onHide: () => setSeqOn((cur) => (cur === i ? -1 : cur)) })),
          { el: titleBeat.current!, from: 0.68, to: 0.95 },
        ],
        reduced,
      );
    },
    [reduced, mobile],
  );

  return (
    <Act id="06" ref={section} heightVh={mobile ? 300 : 420}>
      <div className="stage" style={{ background: 'var(--obsidian)' }}>
        <div ref={globeWrap} className="stage__layer" style={{ transform: mobile ? 'translateY(-14%)' : undefined }}>
          <Globe progressRef={progress} />
        </div>
        <div className="stage__layer scrim--bottom" style={{ opacity: 0.6, pointerEvents: 'none' }} />
        <ActMark id="06" />

        {act06.sequence.map((line, i) => (
          <div
            key={line}
            ref={(el) => {
              seq.current[i] = el;
            }}
            className="stage__content stage__content--low beat"
          >
            <RevealLines lines={[line]} as="p" className="display display--l display--caps" play={seqOn === i} duration={1.5} />
          </div>
        ))}

        <div ref={titleBeat} className="stage__content stage__content--start beat">
          <div style={{ display: 'grid', gap: 'var(--space-6)', maxWidth: '40rem' }}>
            <h2 className="display display--l">{act06.title}</h2>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {act06.body.map((p) => (
                <p key={p} className="lead" style={{ maxWidth: '40ch', color: 'var(--fg-muted)' }}>
                  {p}
                </p>
              ))}
            </div>
            <p className="label label--faint">{act06.arcs.join(' · ')} — symbolic connections, not routes.</p>
          </div>
        </div>

        <div ref={fromBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)' }} />
        <div ref={toBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)', opacity: 0 }} />
      </div>
    </Act>
  );
}
