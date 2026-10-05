import { gsap, ScrollTrigger, EASE } from './gsap';

/**
 * Every threshold here is a fraction of the stage's *scrollable* distance —
 * the same 0..1 that onProgress() reports — so a beat at 0.5 lands exactly at
 * progress 0.5 whatever the section's height.
 */
function at(section: HTMLElement, fraction: number): () => string {
  return () => `top+=${Math.round(fraction * Math.max(1, section.offsetHeight - window.innerHeight))} top`;
}

export interface Beat {
  /** element(s) to show */
  el: gsap.TweenTarget;
  /** progress at which the beat enters */
  from: number;
  /** progress at which it leaves; omit to stay */
  to?: number;
  /** vertical drift in px while entering (default 18) */
  drift?: number;
  /** custom show/hide hooks instead of the default fade */
  onShow?: () => void;
  onHide?: () => void;
}

/**
 * Threshold-triggered beats inside a sticky stage. The camera scrubs with the
 * finger; the words do not. They enter when a threshold is crossed and play
 * out in their own time, which is what keeps the typography from feeling
 * mechanical. Create inside a gsap.context so cleanup is automatic.
 */
export function createBeats(section: HTMLElement, beats: Beat[], reduced = false) {
  for (const beat of beats) {
    // The container always fades; hooks run in addition (they drive RevealLines state).
    const show = () => {
      gsap.to(beat.el, { opacity: 1, y: 0, duration: reduced ? 0.01 : 1.4, ease: EASE.statement, overwrite: 'auto' });
      beat.onShow?.();
    };
    const hide = (up: boolean) => {
      gsap.to(beat.el, { opacity: 0, y: up ? -(beat.drift ?? 18) : (beat.drift ?? 18), duration: reduced ? 0.01 : 0.7, ease: EASE.ui, overwrite: 'auto' });
      beat.onHide?.();
    };
    gsap.set(beat.el, { opacity: 0, y: beat.drift ?? 18 });

    ScrollTrigger.create({
      trigger: section,
      start: at(section, beat.from),
      end: beat.to !== undefined ? at(section, beat.to) : 'bottom bottom',
      onEnter: show,
      onLeaveBack: () => hide(false),
      onLeave: beat.to !== undefined ? () => hide(true) : undefined,
      onEnterBack: beat.to !== undefined ? show : undefined,
      invalidateOnRefresh: true,
    });
  }
}

/** Scrub a tween across a progress range of the stage. */
export function scrubAcross(section: HTMLElement, from: number, to: number, tween: gsap.core.Tween | gsap.core.Timeline, scrub: number | boolean = 0.8) {
  return ScrollTrigger.create({
    trigger: section,
    start: at(section, from),
    end: at(section, to),
    animation: tween,
    scrub,
    invalidateOnRefresh: true,
  });
}

/** Stage progress 0..1 (top of section at top of viewport → bottom at bottom). */
export function onProgress(section: HTMLElement, cb: (p: number) => void) {
  return ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => cb(self.progress),
  });
}
