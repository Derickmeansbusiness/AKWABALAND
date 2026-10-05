'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/animation/gsap';
import { useReducedMotion } from './useReducedMotion';

interface SmoothScrollApi {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, opts?: { immediate?: boolean; offset?: number }) => void;
}

const Ctx = createContext<SmoothScrollApi>({ lenis: null, scrollTo: () => {} });

/**
 * Lenis drives the scroll; GSAP's ticker drives Lenis; ScrollTrigger listens
 * to Lenis. One clock, no fighting. Reduced-motion users get native scroll
 * and every ScrollTrigger still works because it reads window scroll.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false, // native touch scrolling on phones; smoothing there feels wrong
      anchors: true,
    });
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the instance only exists after mount; this is the subscription
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  const scrollTo = useCallback<SmoothScrollApi['scrollTo']>(
    (target, opts) => {
      if (lenis) {
        lenis.scrollTo(target, { immediate: opts?.immediate, offset: opts?.offset ?? 0, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
        return;
      }
      const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target instanceof HTMLElement ? target : null;
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
      else if (typeof target === 'number') window.scrollTo({ top: target });
    },
    [lenis],
  );

  const api = useMemo(() => ({ lenis, scrollTo }), [lenis, scrollTo]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSmoothScroll(): SmoothScrollApi {
  return useContext(Ctx);
}
