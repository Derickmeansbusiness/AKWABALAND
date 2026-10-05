'use client';

import { useRef, useState } from 'react';
import { Act, ActMark } from '@/components/cinematic/Act';
import { EcosystemDiagram } from '@/components/cinematic/EcosystemDiagram';
import { RevealLines } from '@/components/typography/RevealLines';
import { act07 } from '@/data/siteContent';
import { useGsap } from '@/lib/animation/useGsap';
import { gsap } from '@/lib/animation/gsap';
import { createBeats, onProgress, scrubAcross } from '@/lib/animation/beats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

/**
 * ACT 07 — THE CULTURAL ECONOMY
 * The investor shift. The room stays dark and the type stays serif; only the
 * subject becomes structural. An orrery of fourteen streams around the
 * destination, drawn in as the two statements land.
 */
export function Act07Economy() {
  const section = useRef<HTMLElement | null>(null);
  const diagram = useRef<HTMLDivElement | null>(null);
  const fromBlack = useRef<HTMLDivElement | null>(null);
  const toBlack = useRef<HTMLDivElement | null>(null);
  const aBeat = useRef<HTMLDivElement | null>(null);
  const bBeat = useRef<HTMLDivElement | null>(null);
  const bodyBeat = useRef<HTMLDivElement | null>(null);
  const draw = useRef(0);
  const reduced = useReducedMotion();
  const tier = useTier();
  const [aOn, setAOn] = useState(false);
  const [bOn, setBOn] = useState(false);
  const [note, setNote] = useState<string>('');

  useGsap(
    section,
    (_, el) => {
      onProgress(el, (p) => {
        draw.current = reduced ? 1 : Math.min(1, Math.max(0, (p - 0.04) / 0.4));
      });
      scrubAcross(el, 0, 0.08, gsap.fromTo(fromBlack.current, { opacity: 1 }, { opacity: 0, ease: 'none' }), 0.4);
      scrubAcross(el, 0.95, 1, gsap.fromTo(toBlack.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.4);
      scrubAcross(el, 0.02, 0.18, gsap.fromTo(diagram.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.6);
      createBeats(
        el,
        [
          { el: aBeat.current!, from: 0.12, to: 0.44, onShow: () => setAOn(true), onHide: () => setAOn(false) },
          { el: bBeat.current!, from: 0.46, to: 0.74, onShow: () => setBOn(true), onHide: () => setBOn(false) },
          { el: bodyBeat.current!, from: 0.76 },
        ],
        reduced,
      );
    },
    [reduced],
  );

  return (
    <Act id="07" ref={section} heightVh={tier === 'mobile' ? 260 : 360}>
      <div className="stage" style={{ background: 'var(--obsidian)' }}>
        <ActMark id="07" />
        <div className="economy">
          <div ref={diagram} style={{ opacity: 0, display: 'grid', gap: 'var(--space-3)' }}>
            <EcosystemDiagram centre={act07.centre} nodes={act07.nodes} drawRef={draw} onHover={(label, group) => setNote(label ? `${label} — ${group === 'destination' ? 'destination revenue' : 'cultural IP ecosystem'}` : '')} />
            <p className="eco-note" aria-live="polite">
              {note || 'Inner ring: destination revenue. Outer ring: the cultural IP ecosystem.'}
            </p>
          </div>
          <div className="economy__text">
            <div ref={aBeat} className="beat">
              <RevealLines lines={act07.statementA} as="h2" className="display display--m display--caps" play={aOn} duration={1.4} />
            </div>
            <div ref={bBeat} className="beat">
              <RevealLines lines={act07.statementB} as="p" className="display display--m display--caps" play={bOn} duration={1.4} />
            </div>
            <div ref={bodyBeat} className="beat">
              <p className="lead" style={{ maxWidth: '36ch', color: 'var(--fg-muted)' }}>
                {act07.body}
              </p>
            </div>
          </div>
        </div>
        <div ref={fromBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)' }} />
        <div ref={toBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)', opacity: 0 }} />
      </div>
    </Act>
  );
}
