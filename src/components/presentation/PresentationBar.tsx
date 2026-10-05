'use client';

import { useCallback, useEffect, useState } from 'react';
import { acts, presentation } from '@/data/siteContent';
import { useActRegistry } from '@/components/cinematic/ActRegistry';
import { usePresentationMode } from '@/hooks/usePresentationMode';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import styles from './PresentationBar.module.css';

/**
 * Boardroom controls. Keyboard moves between acts and snaps to their start;
 * natural scrolling is left alone. Fullscreen is offered, never forced.
 */
export function PresentationBar() {
  const { enabled } = usePresentationMode();
  const { current, order } = useActRegistry();
  const { scrollTo } = useSmoothScroll();
  const [fs, setFs] = useState(false);

  const index = Math.max(0, order.indexOf(current));
  const meta = acts.find((a) => a.id === current);

  const goTo = useCallback(
    (i: number) => {
      const id = order[Math.min(order.length - 1, Math.max(0, i))];
      const m = acts.find((a) => a.id === id);
      if (m) scrollTo(`#${m.anchor}`);
    },
    [order, scrollTo],
  );

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          goTo(index + 1);
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          goTo(index - 1);
          break;
        case 'Home':
          goTo(0);
          break;
        case 'End':
          goTo(order.length - 1);
          break;
        case 'f':
        case 'F':
          toggleFs();
          break;
      }
    };
    const onFs = () => setFs(Boolean(document.fullscreenElement));
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [enabled, goTo, index, order.length, toggleFs]);

  if (!enabled) return null;

  return (
    <div className={styles.bar} role="toolbar" aria-label="Presentation controls">
      <div className={styles.indicator} aria-live="polite">
        <span className={styles.count}>
          {String(index + 1).padStart(2, '0')}
          <span className={styles.of}> / {String(order.length).padStart(2, '0')}</span>
        </span>
        <span className={styles.title}>{meta?.title}</span>
      </div>
      <div className={styles.controls}>
        <button className={styles.ctl} onClick={() => goTo(index - 1)} aria-label="Previous act" disabled={index === 0}>
          ←
        </button>
        <button className={styles.ctl} onClick={() => goTo(index + 1)} aria-label="Next act" disabled={index === order.length - 1}>
          →
        </button>
        <button className={styles.ctl} onClick={toggleFs} aria-label={fs ? presentation.exitFullscreen : presentation.fullscreen}>
          {fs ? '⤡' : '⤢'}
        </button>
      </div>
      <p className={styles.hint}>{presentation.hint}</p>
    </div>
  );
}
