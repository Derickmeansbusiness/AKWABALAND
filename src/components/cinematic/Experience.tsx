'use client';

import { Suspense, type ReactNode } from 'react';
import { PresentationProvider, usePresentationMode } from '@/hooks/usePresentationMode';
import { SmoothScrollProvider } from '@/hooks/useSmoothScroll';
import { ActProvider } from './ActRegistry';
import { SiteNav } from '@/components/navigation/SiteNav';
import { PresentationBar } from '@/components/presentation/PresentationBar';
import { Cursor } from '@/components/ui/Cursor';
import { SoundControl } from '@/components/ui/SoundControl';
import { actOrderFor } from '@/data/siteContent';
import './cinematic.css';

function Shell({ children }: { children: ReactNode }) {
  const { audience } = usePresentationMode();
  return (
    <SmoothScrollProvider>
      <ActProvider order={actOrderFor(audience)}>
        <SiteNav />
        <main id="unveiling">{children}</main>
        <PresentationBar />
        <SoundControl />
        <Cursor />
      </ActProvider>
    </SmoothScrollProvider>
  );
}

/** Providers and chrome around the acts. The acts themselves are passed in so the page decides the order. */
export function Experience({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PresentationProvider>
        <Shell>{children}</Shell>
      </PresentationProvider>
    </Suspense>
  );
}
