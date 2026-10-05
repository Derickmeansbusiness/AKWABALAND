'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

export type Audience = 'royal' | 'government' | 'investor' | 'culture' | 'general';

export interface PresentationState {
  /** ?presentation=true */
  enabled: boolean;
  /** ?audience=royal|government|investor|culture */
  audience: Audience;
}

const PresentationContext = createContext<PresentationState>({ enabled: false, audience: 'general' });

const AUDIENCES: Audience[] = ['royal', 'government', 'investor', 'culture'];

/**
 * Reads presentation flags from the URL once and shares them. Content ordering
 * per audience lives in siteContent.actOrderFor(); today every audience gets
 * the same order, but the plumbing is here so that can change without touching
 * sections.
 */
export function PresentationProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const value = useMemo<PresentationState>(() => {
    const p = params.get('presentation');
    const a = params.get('audience') as Audience | null;
    return {
      enabled: p === 'true' || p === '1',
      audience: a && AUDIENCES.includes(a) ? a : 'general',
    };
  }, [params]);
  return <PresentationContext.Provider value={value}>{children}</PresentationContext.Provider>;
}

export function usePresentationMode(): PresentationState {
  return useContext(PresentationContext);
}
