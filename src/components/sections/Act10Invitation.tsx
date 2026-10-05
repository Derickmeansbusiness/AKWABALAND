'use client';

import { useRef, useState } from 'react';
import { Act } from '@/components/cinematic/Act';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { RevealLines } from '@/components/typography/RevealLines';
import { Label } from '@/components/typography/Display';
import { Button } from '@/components/ui/Button';
import { act10 } from '@/data/siteContent';
import { getMedia } from '@/data/mediaManifest';
import { useGsap } from '@/lib/animation/useGsap';
import { gsap } from '@/lib/animation/gsap';
import { createBeats, scrubAcross } from '@/lib/animation/beats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';
import { usePresentationMode } from '@/hooks/usePresentationMode';

/**
 * ACT 10 — THE INVITATION
 * The destination at the end of the day, on a push so slow it is felt rather
 * than seen. Three statements, a breath each. The lockup. Three lines that
 * say what it is. Then, and only then, the actions.
 */
export function Act10Invitation() {
  const section = useRef<HTMLElement | null>(null);
  const media = useRef<HTMLDivElement | null>(null);
  const fromBlack = useRef<HTMLDivElement | null>(null);
  const stages = useRef<(HTMLDivElement | null)[]>([]);
  const lockupBeat = useRef<HTMLDivElement | null>(null);
  const triadBeat = useRef<HTMLDivElement | null>(null);
  const actionsBeat = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const tier = useTier();
  const mobile = tier === 'mobile';
  const { enabled: presenting } = usePresentationMode();
  const [stageOn, setStageOn] = useState(-1);
  const [lockupOn, setLockupOn] = useState(false);
  const [triadOn, setTriadOn] = useState(false);
  const asset = getMedia('aerial-sunset');

  useGsap(
    section,
    (_, el) => {
      scrubAcross(el, 0, 0.14, gsap.fromTo(fromBlack.current, { opacity: 1 }, { opacity: 0, ease: 'none' }), 0.5);
      if (!reduced && media.current) scrubAcross(el, 0, 1, gsap.fromTo(media.current, { scale: 1.0, yPercent: 1 }, { scale: 1.14, yPercent: -1, ease: 'none' }), 1.2);
      const windows: [number, number][] = [
        [0.1, 0.27],
        [0.29, 0.46],
        [0.48, 0.63],
      ];
      createBeats(
        el,
        [
          ...windows.map(([from, to], i) => ({ el: stages.current[i]!, from, to, onShow: () => setStageOn(i), onHide: () => setStageOn((c) => (c === i ? -1 : c)) })),
          { el: lockupBeat.current!, from: 0.67, onShow: () => setLockupOn(true), onHide: () => setLockupOn(false) },
          { el: triadBeat.current!, from: 0.76, onShow: () => setTriadOn(true), onHide: () => setTriadOn(false) },
          { el: actionsBeat.current!, from: 0.86 },
        ],
        reduced,
      );
    },
    [reduced],
  );

  return (
    <Act id="10" ref={section} heightVh={mobile ? 340 : 460}>
      <div className="stage">
        <div ref={media} className="stage__layer" style={{ transformOrigin: '50% 55%' }}>
          <CinematicMedia asset={asset} />
        </div>
        <div className="stage__layer vignette" />
        <div className="stage__layer scrim--bottom" style={{ opacity: 0.8 }} />
        <div className="stage__layer scrim--top" style={{ opacity: 0.5 }} />

        {act10.stages.map((lines, i) => (
          <div
            key={i}
            ref={(el) => {
              stages.current[i] = el;
            }}
            className="stage__content beat"
          >
            <RevealLines lines={lines} as="p" className="display display--l display--caps" play={stageOn === i} duration={1.6} stagger={0.18} />
          </div>
        ))}

        <div className="stage__content" style={{ alignContent: 'center', gridAutoRows: 'min-content', gap: 'clamp(1.5rem, 4vh, 3rem)' }}>
          <div ref={lockupBeat} className="beat" style={{ display: 'grid', gap: '1rem', justifyItems: 'center' }}>
            <RevealLines lines={[act10.lockup.name]} as="h2" className="display display--xl display--caps" play={lockupOn} duration={1.8} />
            <span className="rule rule--accent" />
            <Label as="p" wide>
              {act10.lockup.tagline}
            </Label>
          </div>
          <div ref={triadBeat} className="beat">
            <RevealLines lines={act10.triad} as="p" className="display display--s display--caps" play={triadOn} duration={1.2} stagger={0.25} />
          </div>
          <div ref={actionsBeat} className="beat" style={{ display: 'grid', gap: 'clamp(1.5rem, 4vh, 2.5rem)', justifyItems: 'center' }}>
            {!presenting && (
              <div className="invite-actions">
                {act10.actions.map((a) => (
                  <Button key={a.href} href={a.href} variant={a.primary ? 'primary' : 'ghost'}>
                    {a.label}
                  </Button>
                ))}
              </div>
            )}
            <div className="invite-footer">
              {act10.footer.map((line) => (
                <span key={line} className="label label--faint">
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div ref={fromBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)' }} />
      </div>
    </Act>
  );
}
