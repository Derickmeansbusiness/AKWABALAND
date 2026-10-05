'use client';

import { useLayoutEffect, useRef, type ElementType } from 'react';
import { gsap, EASE } from '@/lib/animation/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface RevealLinesProps {
  lines: readonly string[];
  as?: ElementType;
  className?: string;
  /** controlled: true reveals, false hides */
  play: boolean;
  stagger?: number;
  duration?: number;
  delay?: number;
}

/**
 * Lines of a statement, each clipped and lifted into view. Controlled by the
 * parent's beat so timing lives with the scene, not the text. GSAP owns the
 * transform from before first paint; CSS never touches it.
 */
export function RevealLines({ lines, as: Tag = 'p', className, play, stagger = 0.11, duration = 1.3, delay = 0 }: RevealLinesProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const primed = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll<HTMLElement>('.line-mask > span');
    if (!primed.current) {
      gsap.set(spans, { yPercent: play && reduced ? 0 : 110 });
      primed.current = true;
    }
    if (reduced) {
      gsap.set(spans, { yPercent: play ? 0 : 110 });
      return;
    }
    if (play) {
      gsap.to(spans, { yPercent: 0, duration, ease: EASE.reveal, stagger, delay, overwrite: true });
    } else {
      gsap.to(spans, {
        yPercent: -110,
        duration: 0.7,
        ease: EASE.statement,
        stagger: stagger * 0.5,
        overwrite: true,
        onComplete: () => gsap.set(spans, { yPercent: 110 }),
      });
    }
  }, [play, reduced, stagger, duration, delay]);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
