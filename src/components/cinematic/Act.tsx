'use client';

import { forwardRef, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { acts, type ActId } from '@/data/siteContent';
import { useActRegistry } from './ActRegistry';

interface ActProps {
  id: ActId;
  /** scroll distance as a multiple of the viewport (desktop) */
  heightVh?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** A standalone act: one section, one sticky stage. Its stage must open and close through black. */
export const Act = forwardRef<HTMLElement, ActProps>(function Act({ id, heightVh = 100, className, style, children }, ref) {
  const meta = acts.find((a) => a.id === id)!;
  const { register } = useActRegistry();
  const local = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = local.current;
    if (!el) return;
    return register(id, el);
  }, [id, register]);

  return (
    <section
      ref={(el) => {
        local.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      id={meta.anchor}
      data-act={id}
      aria-label={`Act ${id}: ${meta.title}`}
      className={['act', className].filter(Boolean).join(' ')}
      style={{ minHeight: `${heightVh}vh`, ...style }}
    >
      {children}
    </section>
  );
});

/**
 * An invisible span of an act-group's scroll distance that carries the act's
 * anchor and registry entry, so several acts can share one uncut stage.
 * `from`/`to` are fractions of the group's height.
 */
export function ActMarker({ id, from, to }: { id: ActId; from: number; to: number }) {
  const meta = acts.find((a) => a.id === id)!;
  const { register } = useActRegistry();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return register(id, el);
  }, [id, register]);

  return (
    <div
      ref={ref}
      id={meta.anchor}
      data-act={id}
      aria-hidden="true"
      className="act-marker"
      style={{ top: `${from * 100}%`, height: `${(to - from) * 100}%` }}
    />
  );
}

/** Small corner mark: "02 — Arrival". */
export function ActMark({ id }: { id: ActId }) {
  const meta = acts.find((a) => a.id === id)!;
  return (
    <div className="act-mark" aria-hidden="true">
      <span className="label label--faint">{id}</span>
      <span className="rule" style={{ width: '1.25rem' }} />
      <span className="label label--faint">{meta.short}</span>
    </div>
  );
}
