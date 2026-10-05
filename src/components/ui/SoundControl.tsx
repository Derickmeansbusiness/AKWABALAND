'use client';

import { useEffect, useRef, useState } from 'react';
import { soundLayers } from '@/data/mediaManifest';
import { sound } from '@/data/siteContent';
import { useActRegistry } from '@/components/cinematic/ActRegistry';
import styles from './SoundControl.module.css';

/**
 * Default muted. Never autoplays. Renders nothing until ambient layers exist
 * in the manifest, because a switch that does nothing is worse than none.
 * When enabled, layers tagged for the current act fade in at their own gain;
 * silence between them is intentional.
 */
export function SoundControl() {
  const { current } = useActRegistry();
  const [on, setOn] = useState(false);
  const nodes = useRef(new Map<string, HTMLAudioElement>());

  useEffect(() => {
    if (!soundLayers.length) return;
    for (const layer of soundLayers) {
      let el = nodes.current.get(layer.id);
      if (!el) {
        el = new Audio(layer.src);
        el.loop = true;
        el.preload = 'none';
        el.volume = 0;
        nodes.current.set(layer.id, el);
      }
      const wanted = on && layer.acts.includes(current);
      const target = wanted ? layer.gain : 0;
      if (wanted && el.paused) el.play().catch(() => {});
      const from = el.volume;
      const t0 = performance.now();
      const dur = 1800;
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        el!.volume = from + (target - from) * (k * k * (3 - 2 * k));
        if (k < 1) requestAnimationFrame(tick);
        else if (target === 0) el!.pause();
      };
      requestAnimationFrame(tick);
    }
  }, [on, current]);

  useEffect(() => {
    const map = nodes.current;
    return () => {
      map.forEach((el) => {
        el.pause();
        el.src = '';
      });
      map.clear();
    };
  }, []);

  if (!soundLayers.length || current === '00') return null;

  return (
    <button className={styles.control} onClick={() => setOn((v) => !v)} aria-pressed={on} aria-label={on ? sound.disable : sound.enable} title={sound.note}>
      <span className={styles.bars} aria-hidden="true">
        <i className={on ? styles.live : ''} />
        <i className={on ? styles.live : ''} />
        <i className={on ? styles.live : ''} />
      </span>
      <span className={styles.label}>{on ? 'Sound' : 'Muted'}</span>
    </button>
  );
}
