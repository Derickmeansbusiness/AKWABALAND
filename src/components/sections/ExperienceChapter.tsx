'use client';

import { useRef, useState } from 'react';
import { CinematicMedia } from '@/components/media/CinematicMedia';
import { RevealLines } from '@/components/typography/RevealLines';
import type { ExperienceZone } from '@/data/experienceZones';
import { getMedia } from '@/data/mediaManifest';
import { useGsap } from '@/lib/animation/useGsap';
import { gsap } from '@/lib/animation/gsap';
import { createBeats, scrubAcross } from '@/lib/animation/beats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

type Layout = 'stacked-left' | 'column-right' | 'centered' | 'split';

interface Recipe {
  layout: Layout;
  heightVh: number;
  opensFromBlack: boolean;
  closesToBlack: boolean;
  /** camera on the primary frame */
  camera?: (media: HTMLElement, mobile: boolean) => gsap.core.Tween;
  /** light treatment class and its opacity range */
  light?: { className: string; from: number; to: number };
  /** second frame crossfades in at this progress */
  secondAt?: number;
  /** the words beat window */
  wordsAt: [number, number];
  titleAt: [number, number];
  /** display size for the words */
  wordsSize: 'xl' | 'l' | 'm';
}

/** Each experience moves differently. Same component, different cinematography. */
const RECIPES: Record<ExperienceZone['motion'], Recipe> = {
  'push-facade': {
    layout: 'stacked-left',
    heightVh: 260,
    opensFromBlack: true,
    closesToBlack: false,
    camera: (m) => gsap.fromTo(m, { scale: 1.16, yPercent: 1.5 }, { scale: 1.0, yPercent: 0, ease: 'none' }),
    light: { className: 'light--shadow-drift', from: 0.9, to: 0.2 },
    wordsAt: [0.1, 0.5],
    titleAt: [0.3, 0.9],
    wordsSize: 'l',
  },
  'interior-drift': {
    layout: 'column-right',
    heightVh: 260,
    opensFromBlack: false,
    closesToBlack: true,
    camera: (m) => gsap.fromTo(m, { scale: 1.1, xPercent: 2.5 }, { scale: 1.06, xPercent: -2.5, ease: 'none' }),
    light: { className: 'scrim--full', from: 0.7, to: 0.1 },
    wordsAt: [0.08, 0.5],
    titleAt: [0.32, 0.9],
    wordsSize: 'l',
  },
  'horizontal-promenade': {
    layout: 'split',
    heightVh: 280,
    opensFromBlack: true,
    closesToBlack: false,
    camera: (m, mobile) => gsap.fromTo(m, { scale: mobile ? 1.3 : 1.22, xPercent: mobile ? 10 : 7 }, { scale: mobile ? 1.3 : 1.22, xPercent: mobile ? -10 : -7, ease: 'none' }),
    wordsAt: [0.12, 0.5],
    titleAt: [0.42, 0.9],
    wordsSize: 'xl',
  },
  'architectural-glide': {
    layout: 'column-right',
    heightVh: 280,
    opensFromBlack: false,
    closesToBlack: false,
    camera: (m) => gsap.fromTo(m, { scale: 1.0, yPercent: 0 }, { scale: 1.12, yPercent: 3, ease: 'none' }),
    secondAt: 0.58,
    wordsAt: [0.08, 0.45],
    titleAt: [0.3, 0.9],
    wordsSize: 'l',
  },
  'warm-light': {
    layout: 'stacked-left',
    heightVh: 300,
    opensFromBlack: false,
    closesToBlack: true,
    camera: (m) => gsap.fromTo(m, { scale: 1.08, xPercent: -2 }, { scale: 1.02, xPercent: 2, ease: 'none' }),
    light: { className: 'light--warm', from: 0.2, to: 0.55 },
    secondAt: 0.6,
    wordsAt: [0.62, 0.92],
    titleAt: [0.14, 0.5],
    wordsSize: 'l',
  },
  'hands-and-fabric': {
    layout: 'stacked-left',
    heightVh: 260,
    opensFromBlack: true,
    closesToBlack: false,
    camera: (m) => gsap.fromTo(m, { scale: 1.14, xPercent: -4 }, { scale: 1.1, xPercent: 4, ease: 'none' }),
    light: { className: 'light--forest', from: 0.3, to: 0.7 },
    wordsAt: [0.1, 0.5],
    titleAt: [0.34, 0.9],
    wordsSize: 'm',
  },
  'day-to-evening': {
    layout: 'centered',
    heightVh: 280,
    opensFromBlack: false,
    closesToBlack: true,
    camera: (m) => gsap.fromTo(m, { scale: 1.0 }, { scale: 1.06, ease: 'none' }),
    light: { className: 'light--evening', from: 0, to: 0.5 },
    wordsAt: [0.2, 0.6],
    titleAt: [0.55, 0.92],
    wordsSize: 'l',
  },
  'emotional-peak': {
    layout: 'centered',
    heightVh: 340,
    opensFromBlack: true,
    closesToBlack: true,
    camera: (m) => gsap.fromTo(m, { scale: 1.08 }, { scale: 1.0, ease: 'none' }),
    wordsAt: [0.22, 0.86],
    titleAt: [0.5, 0.88],
    wordsSize: 'xl',
  },
};

export function ExperienceChapter({ zone, index }: { zone: ExperienceZone; index: number }) {
  const recipe = RECIPES[zone.motion];
  const section = useRef<HTMLElement | null>(null);
  const media = useRef<HTMLDivElement | null>(null);
  const second = useRef<HTMLDivElement | null>(null);
  const light = useRef<HTMLDivElement | null>(null);
  const fromBlack = useRef<HTMLDivElement | null>(null);
  const toBlack = useRef<HTMLDivElement | null>(null);
  const wordsBeat = useRef<HTMLDivElement | null>(null);
  const titleBeat = useRef<HTMLDivElement | null>(null);
  const markBeat = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const tier = useTier();
  const mobile = tier === 'mobile';
  const [wordsOn, setWordsOn] = useState(false);

  const primary = getMedia(zone.media[0]);
  const secondary = recipe.secondAt && zone.media[1] ? getMedia(zone.media[1]) : null;

  useGsap(
    section,
    (_, el) => {
      if (recipe.opensFromBlack && fromBlack.current) scrubAcross(el, 0, 0.1, gsap.fromTo(fromBlack.current, { opacity: 1 }, { opacity: 0, ease: 'none' }), 0.4);
      if (recipe.closesToBlack && toBlack.current) scrubAcross(el, 0.93, 1, gsap.fromTo(toBlack.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.4);
      if (!reduced && recipe.camera && media.current) scrubAcross(el, 0, 1, recipe.camera(media.current, mobile), 1);
      if (recipe.light && light.current) scrubAcross(el, 0.05, 0.9, gsap.fromTo(light.current, { opacity: recipe.light.from }, { opacity: recipe.light.to, ease: 'none' }), 0.8);
      if (recipe.secondAt && second.current) scrubAcross(el, recipe.secondAt - 0.08, recipe.secondAt + 0.08, gsap.fromTo(second.current, { opacity: 0 }, { opacity: 1, ease: 'none' }), 0.6);
      createBeats(
        el,
        [
          { el: markBeat.current!, from: 0.04, to: 0.93, drift: 0 },
          { el: wordsBeat.current!, from: recipe.wordsAt[0], to: recipe.wordsAt[1], onShow: () => setWordsOn(true), onHide: () => setWordsOn(false) },
          { el: titleBeat.current!, from: recipe.titleAt[0], to: recipe.titleAt[1] },
        ],
        reduced,
      );
    },
    [reduced, mobile, zone.id],
  );

  const wordsClass = ['words', recipe.layout === 'column-right' ? 'words--right words--top' : '', recipe.layout === 'split' || recipe.layout === 'centered' ? 'chapter-title--span' : ''].join(' ');
  const titleClass = ['chapter-title', recipe.layout === 'stacked-left' ? 'chapter-title--right' : '', recipe.layout === 'column-right' ? 'chapter-title--left' : ''].join(' ');

  return (
    <section ref={section} className="act" id={`experience-${zone.id}`} aria-label={`${zone.number} ${zone.title}`} style={{ minHeight: `${mobile ? Math.round(recipe.heightVh * 0.7) : recipe.heightVh}vh` }}>
      <div className="stage">
        <div ref={media} className="stage__layer" style={{ transformOrigin: zone.motion === 'architectural-glide' ? '50% 20%' : '50% 50%' }}>
          <CinematicMedia asset={primary} />
        </div>
        {secondary && (
          <div ref={second} className="stage__layer" style={{ opacity: 0 }}>
            <CinematicMedia asset={secondary} />
          </div>
        )}
        {recipe.light && <div ref={light} className={`stage__layer ${recipe.light.className}`} style={{ opacity: recipe.light.from }} />}
        <div className="stage__layer vignette" />
        <div className="stage__layer scrim--bottom" style={{ opacity: recipe.layout === 'centered' ? 0.45 : 0.65 }} />

        <div ref={markBeat} className="act-mark beat" aria-hidden="true">
          <span className="label label--faint">04</span>
          <span className="rule" style={{ width: '1.25rem' }} />
          <span className="label label--faint">
            {zone.number} · {zone.title}
          </span>
        </div>

        <div className="chapter-grid">
          <div ref={wordsBeat} className={`${wordsClass} beat`} style={recipe.layout === 'centered' || recipe.layout === 'split' ? { alignSelf: 'center', textAlign: 'center' } : undefined}>
            <RevealLines lines={zone.words} as="h3" className={`display display--${recipe.wordsSize} display--caps`} play={wordsOn} stagger={0.22} duration={1.4} />
          </div>
          <div ref={titleBeat} className={`${titleClass} beat`} style={recipe.layout === 'centered' || recipe.layout === 'split' ? { gridColumn: '1 / -1', justifySelf: 'start', textAlign: 'left' } : undefined}>
            <span className="label label--accent">
              {zone.number} — Experience {index + 1} of 8
            </span>
            <h2 className="chapter-title__name">{zone.title}</h2>
            {zone.description && <p className="chapter-title__desc">{zone.description}</p>}
            {zone.caption && <p className="chapter-caption">{zone.caption}</p>}
          </div>
        </div>

        {recipe.opensFromBlack && <div ref={fromBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)' }} />}
        {recipe.closesToBlack && <div ref={toBlack} className="stage__layer veil" style={{ background: 'var(--obsidian)', opacity: 0 }} />}
      </div>
    </section>
  );
}
