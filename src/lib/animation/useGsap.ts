'use client';

import { useLayoutEffect, type DependencyList, type RefObject } from 'react';
import { gsap } from './gsap';

/**
 * gsap.context scoped to a ref, cleaned up on unmount or when deps change.
 * Every section animation goes through this so ScrollTriggers never leak
 * between route changes or presentation re-orders.
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: (ctx: gsap.Context, el: HTMLElement) => void, deps: DependencyList = []) {
  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    // gsap.context runs the function synchronously inside the constructor, so the
    // context arrives as the callback's argument rather than the outer binding.
    const ctx = gsap.context((self) => setup(self, el), el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
