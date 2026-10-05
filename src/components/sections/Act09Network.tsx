'use client';

import { useRef, useState } from 'react';
import { Act, ActMark } from '@/components/cinematic/Act';
import { NetworkMap } from '@/components/maps/NetworkMap';
import { RevealLines } from '@/components/typography/RevealLines';
import { act09 } from '@/data/siteContent';
import { useGsap } from '@/lib/animation/useGsap';
import { gsap, EASE } from '@/lib/animation/gsap';
import { createBeats, scrubAcross } from '@/lib/animation/beats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

/**
 * ACT 09 — THE FUTURE NETWORK
 * The flagship first, alone. Then five regions, reached by thin lines, each a
 * dashed ring because none is a site. The model proves itself in the Gulf
 * and Africa builds the rest.
 */
export function Act09Network() {
  const section = useRef<HTMLElement | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  const fromBlack = useRef<HTMLDivElement | null>(null);
  const toBlack = useRef<HTMLDivElement | null>(null);
  const stmtBeat = useRef<HTMLDivElement | null>(null);
  const bodyBeat = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const tier = useTier();
  const [stmtOn, setStmtOn] = useState(false);

  useGsap(
    section,
    (_, el) => {
      scrubAcross(el, 0, 0.08, gsap.fromTo(fromBlack.current, { opacity: 1 }, { opacity: 0, ease: 'none' }), 0.4);
      scrubAcross(el, 0.95, 1, gsap.fromTo(toBlack.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.4);

      // The SVG mounts after the topology loads; poll briefly for its parts, then wire the beats.
      let tries = 0;
      const wire = () => {
        const s = svg.current;
        const flag = s?.querySelector<SVGGElement>('[data-net-flag]');
        if (!s || !flag) {
          if (tries++ < 40) setTimeout(wire, 100);
          return;
        }
        const ring = flag.querySelector<SVGCircleElement>('[data-ring]');
        const lines = Array.from(s.querySelectorAll<SVGPathElement>('[data-net-line]'));
        const regions = Array.from(s.querySelectorAll<SVGGElement>('[data-net-region]'));
        createBeats(
          el,
          [
            { el: flag, from: 0.06, drift: 0 },
            ...regions.map((r, i) => ({ el: r, from: 0.22 + i * 0.07, drift: 0 })),
          ],
          reduced,
        );
        lines.forEach((line, i) => {
          scrubAcross(el, 0.2 + i * 0.07, 0.3 + i * 0.07, gsap.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none' }), 0.6);
        });
        if (ring && !reduced) {
          gsap.fromTo(ring, { attr: { r: 8 }, opacity: 0.8 }, { attr: { r: 30 }, opacity: 0, duration: 3.2, ease: EASE.statement, repeat: -1, repeatDelay: 1.2 });
        }
      };
      wire();

      createBeats(
        el,
        [
          { el: stmtBeat.current!, from: 0.56, to: 0.8, onShow: () => setStmtOn(true), onHide: () => setStmtOn(false) },
          { el: bodyBeat.current!, from: 0.8 },
        ],
        reduced,
      );
    },
    [reduced],
  );

  return (
    <Act id="09" ref={section} heightVh={tier === 'mobile' ? 260 : 360}>
      <div className="stage" style={{ background: 'var(--obsidian)' }}>
        <div className="stage__layer" style={{ padding: 'clamp(4rem, 10vh, 7rem) var(--gutter) clamp(2rem, 6vh, 4rem)' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <NetworkMap ref={svg} flagshipLabel={act09.flagship.label} flagshipPlace={act09.flagship.place} />
          </div>
        </div>
        <div className="stage__layer scrim--bottom" style={{ opacity: 0.5, pointerEvents: 'none' }} />
        <ActMark id="09" />

        <div ref={stmtBeat} className="stage__content stage__content--start beat">
          <RevealLines lines={act09.statement} as="h2" className="display display--m display--caps" play={stmtOn} duration={1.4} stagger={0.3} />
        </div>
        <div ref={bodyBeat} className="stage__content stage__content--start beat">
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <p className="lead" style={{ maxWidth: '40ch', color: 'var(--fg-muted)' }}>
              {act09.body}
            </p>
            <p className="chapter-caption">{act09.note}</p>
          </div>
        </div>

        <div ref={fromBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)' }} />
        <div ref={toBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)', opacity: 0 }} />
      </div>
    </Act>
  );
}
