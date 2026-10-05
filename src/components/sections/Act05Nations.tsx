'use client';

import { useRef, useState } from 'react';
import { Act, ActMark } from '@/components/cinematic/Act';
import { AfricaMap } from '@/components/maps/AfricaMap';
import { RevealLines } from '@/components/typography/RevealLines';
import { act05 } from '@/data/siteContent';
import { countries, regionLabels, pavilionModel } from '@/data/nationPavilionModel';
import { useGsap } from '@/lib/animation/useGsap';
import { gsap } from '@/lib/animation/gsap';
import { createBeats, scrubAcross } from '@/lib/animation/beats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

/**
 * ACT 05 — ONE CONTINENT. MANY NATIONS.
 * A dark room with the continent in bronze. The statement arrives, then the
 * map is handed to the viewer: every nation lights in gold under the hand or
 * the keyboard, and a slim panel says what a pavilion can hold.
 */
export function Act05Nations() {
  const section = useRef<HTMLElement | null>(null);
  const mapWrap = useRef<HTMLDivElement | null>(null);
  const fromBlack = useRef<HTMLDivElement | null>(null);
  const toBlack = useRef<HTMLDivElement | null>(null);
  const stmtBeat = useRef<HTMLDivElement | null>(null);
  const bodyBeat = useRef<HTMLDivElement | null>(null);
  const panelBeat = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const tier = useTier();
  const [active, setActive] = useState<string | null>(null);
  const [stmtOn, setStmtOn] = useState(false);
  const country = active ? countries[active] : null;

  useGsap(
    section,
    (_, el) => {
      scrubAcross(el, 0, 0.08, gsap.fromTo(fromBlack.current, { opacity: 1 }, { opacity: 0, ease: 'none' }), 0.4);
      scrubAcross(el, 0.94, 1, gsap.fromTo(toBlack.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.4);
      scrubAcross(el, 0.02, 0.22, gsap.fromTo(mapWrap.current, { opacity: 0, scale: reduced ? 1 : 0.96 }, { opacity: 1, scale: 1, ease: 'none' }), 0.6);
      createBeats(
        el,
        [
          { el: stmtBeat.current!, from: 0.08, to: 0.3, onShow: () => setStmtOn(true), onHide: () => setStmtOn(false) },
          { el: bodyBeat.current!, from: 0.3 },
          { el: panelBeat.current!, from: 0.36 },
        ],
        reduced,
      );
    },
    [reduced],
  );

  return (
    <Act id="05" ref={section} heightVh={tier === 'mobile' ? 260 : 360}>
      <div className="stage" style={{ background: 'var(--obsidian)' }}>
        <ActMark id="05" />
        <div className="nations">
          <div className="nations__text">
            <div ref={stmtBeat} className="beat">
              <RevealLines lines={act05.statement} as="h2" className="display display--m display--caps" play={stmtOn} duration={1.4} stagger={0.2} />
            </div>
            <div ref={bodyBeat} className="beat" style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <p className="lead" style={{ maxWidth: '34ch' }}>
                {act05.body}
              </p>
              <p className="label label--faint">{act05.instructions}</p>
            </div>
            <div ref={panelBeat} className="nations__panel beat" aria-live="polite">
              {country ? (
                <>
                  <span className="label label--accent">{country.region ? regionLabels[country.region] : 'Africa'}</span>
                  <p className="nations__name">{country.name}</p>
                  <p className="label label--faint">A pavilion could present</p>
                </>
              ) : (
                <>
                  <span className="label label--accent">{pavilionModel.totalNations} nations invited</span>
                  <p className="nations__name">{pavilionModel.headline}</p>
                  <p className="label label--faint">Every pavilion can present</p>
                </>
              )}
              <ul className="nations__cats">
                {act05.categories.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="chapter-caption">{act05.note}</p>
            </div>
          </div>
          <div ref={mapWrap} className="nations__map" style={{ opacity: 0 }}>
            <AfricaMap active={active} onActive={setActive} />
          </div>
        </div>
        <div ref={fromBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)' }} />
        <div ref={toBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)', opacity: 0 }} />
      </div>
    </Act>
  );
}
