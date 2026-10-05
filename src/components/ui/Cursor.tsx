'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/animation/gsap';
import { useMediaQuery, BREAKPOINTS } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './Cursor.module.css';

/**
 * A fine dot and a hairline ring. The ring opens slightly over anything
 * interactive. Desktop with a real pointer only; it is not a feature.
 */
export function Cursor() {
  const fine = useMediaQuery(BREAKPOINTS.finePointer, false);
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement | null>(null);
  const ring = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!fine || reduced || !dot.current || !ring.current) return;
    document.documentElement.classList.add('has-cursor-dot');

    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3.out' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3.out' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.42, ease: 'power3.out' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.42, ease: 'power3.out' });

    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.4 });
        shown = true;
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const t = (e.target as HTMLElement | null)?.closest('a, button, [data-cursor]');
      gsap.to(ring.current, { scale: t ? 1.6 : 1, borderColor: t ? 'rgba(183,154,88,0.9)' : 'rgba(242,238,229,0.5)', duration: 0.5, ease: 'power2.out' });
    };
    const leave = () => {
      gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 });
      shown = false;
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove('has-cursor-dot');
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;
  return (
    <>
      <div ref={dot} className={styles.dot} aria-hidden="true" />
      <div ref={ring} className={styles.ring} aria-hidden="true" />
    </>
  );
}
