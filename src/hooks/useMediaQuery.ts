'use client';

import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string, serverDefault = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}

export const BREAKPOINTS = {
  tablet: '(min-width: 768px)',
  desktop: '(min-width: 1100px)',
  finePointer: '(pointer: fine) and (hover: hover)',
} as const;

/** Three tiers decide how much cinema a device gets. */
export type Tier = 'mobile' | 'tablet' | 'desktop';

export function useTier(): Tier {
  const tablet = useMediaQuery(BREAKPOINTS.tablet, true);
  const desktop = useMediaQuery(BREAKPOINTS.desktop, true);
  if (desktop) return 'desktop';
  if (tablet) return 'tablet';
  return 'mobile';
}
