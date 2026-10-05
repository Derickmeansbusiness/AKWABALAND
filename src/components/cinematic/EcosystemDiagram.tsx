'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '@/lib/animation/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  centre: string;
  nodes: readonly string[];
  /** how far the lines have drawn, 0..1 — set by the section's scrub */
  drawRef: React.MutableRefObject<number>;
  onHover?: (label: string | null, group: 'destination' | 'ip' | null) => void;
}

const SIZE = 1000;
const C = SIZE / 2;
const INNER = 215;
const OUTER = 405;

/**
 * The cultural economy as an orrery. Seven destination streams on the inner
 * ring, seven IP streams on the outer, each tied to the centre by a hairline.
 * The rings drift in opposite directions, slowly enough to read as alive, not
 * animated. Labels stay upright; nothing spins.
 */
export function EcosystemDiagram({ centre, nodes, drawRef, onHover }: Props) {
  const reduced = useReducedMotion();
  const groupRef = useRef<SVGGElement | null>(null);
  const [hot, setHot] = useState<number | null>(null);
  const angles = useRef<number[]>([]);

  const layout = useMemo(
    () =>
      nodes.map((label, i) => {
        const inner = i < 7;
        const idx = inner ? i : i - 7;
        const count = inner ? 7 : nodes.length - 7;
        const base = -Math.PI / 2 + (idx / count) * Math.PI * 2 + (inner ? 0 : Math.PI / count);
        return { label, inner, r: inner ? INNER : OUTER, base };
      }),
    [nodes],
  );

  useEffect(() => {
    angles.current = layout.map((n) => n.base);
    const g = groupRef.current;
    if (!g) return;
    const nodeEls = Array.from(g.querySelectorAll<SVGGElement>('[data-node]'));
    const lineEls = Array.from(g.querySelectorAll<SVGLineElement>('[data-line]'));
    const place = () => {
      layout.forEach((n, i) => {
        const a = angles.current[i];
        const x = C + Math.cos(a) * n.r;
        const y = C + Math.sin(a) * n.r;
        const node = nodeEls[i];
        const line = lineEls[i];
        if (node) {
          node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
          const text = node.querySelector('text');
          if (text) {
            const right = Math.cos(a) >= 0;
            text.setAttribute('text-anchor', right ? 'start' : 'end');
            text.setAttribute('x', right ? '14' : '-14');
          }
        }
        if (line) {
          line.setAttribute('x2', x.toFixed(2));
          line.setAttribute('y2', y.toFixed(2));
          const d = drawRef.current;
          line.style.strokeDashoffset = String(1 - Math.min(1, Math.max(0, (d - (i / layout.length) * 0.5) / 0.5)));
        }
      });
    };
    place();
    if (reduced) return;
    const tick = (_t: number, dt: number) => {
      const s = dt / 1000;
      layout.forEach((n, i) => {
        angles.current[i] += (n.inner ? 0.018 : -0.011) * s;
      });
      place();
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [layout, reduced, drawRef]);

  const setHover = (i: number | null) => {
    setHot(i);
    onHover?.(i === null ? null : layout[i].label, i === null ? null : layout[i].inner ? 'destination' : 'ip');
  };

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="eco-svg" role="img" aria-label={`${centre} at the centre of ${nodes.length} connected revenue and intellectual-property streams`}>
      <g ref={groupRef}>
        <circle className="eco-ring" cx={C} cy={C} r={INNER} />
        <circle className="eco-ring" cx={C} cy={C} r={OUTER} />
        {layout.map((n, i) => (
          <line key={`l-${n.label}`} data-line className={['eco-line', hot === i ? 'is-hot' : ''].join(' ')} x1={C} y1={C} x2={C} y2={C} pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
        ))}
        <g className="eco-centre">
          <circle cx={C} cy={C} r={62} />
          <text x={C} y={C + 10} textAnchor="middle">
            {centre}
          </text>
        </g>
        {layout.map((n, i) => (
          <g
            key={n.label}
            data-node
            className={['eco-node', hot === i ? 'is-hot' : ''].join(' ')}
            tabIndex={0}
            role="listitem"
            aria-label={`${n.label} — ${n.inner ? 'destination revenue' : 'cultural IP'}`}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          >
            <circle r={n.inner ? 4 : 3.2} />
            <text y={4.5}>{n.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
