'use client';

import { useCallback, useMemo, useRef } from 'react';
import { geoAzimuthalEqualArea, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useAfricaTopology } from '@/lib/webgl/useGeo';
import { countries as lookup } from '@/data/nationPavilionModel';

interface Shape {
  id: string;
  name: string;
  interactive: boolean;
  d: string;
  cx: number;
  cy: number;
}

interface Props {
  active: string | null;
  onActive: (id: string | null) => void;
  className?: string;
}

/**
 * Every nation independently addressable, from Natural Earth. Hover, focus
 * or tap lights a country in antique gold; arrow keys walk the continent by
 * nearest neighbour in that direction. Territories kept for the silhouette
 * are drawn but not addressable.
 */
export function AfricaMap({ active, onActive, className }: Props) {
  const topo = useAfricaTopology();
  const refs = useRef(new Map<string, SVGPathElement>());

  const shapes = useMemo<Shape[]>(() => {
    if (!topo) return [];
    const fc = feature(topo, topo.objects.africa) as FeatureCollection;
    const projection = geoAzimuthalEqualArea().rotate([-18, -3, 0]).fitExtent(
      [
        [16, 16],
        [984, 984],
      ],
      fc,
    );
    const path = geoPath(projection);
    return (fc.features as Feature<Geometry, { name: string; interactive: boolean }>[])
      .map((f) => {
        const [cx, cy] = path.centroid(f);
        return { id: String(f.id), name: f.properties.name, interactive: f.properties.interactive, d: path(f) ?? '', cx, cy };
      })
      .filter((s) => s.d);
  }, [topo]);

  const move = useCallback(
    (from: Shape, key: string) => {
      const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[key];
      if (!dir) return null;
      let best: Shape | null = null;
      let bestScore = Infinity;
      for (const s of shapes) {
        if (s === from || !s.interactive) continue;
        const dx = s.cx - from.cx;
        const dy = s.cy - from.cy;
        const along = dx * dir[0] + dy * dir[1];
        if (along <= 0) continue;
        const across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]);
        const score = along + 2.2 * across;
        if (score < bestScore) {
          bestScore = score;
          best = s;
        }
      }
      return best;
    },
    [shapes],
  );

  if (!topo) return <div className={className} aria-busy="true" />;

  return (
    <svg viewBox="0 0 1000 1000" className={['map-svg', className].filter(Boolean).join(' ')} role="group" aria-label="Map of Africa. Each nation can be selected.">
      {shapes.map((s) => (
        <path
          key={s.id}
          ref={(el) => {
            if (el) refs.current.set(s.id, el);
            else refs.current.delete(s.id);
          }}
          d={s.d}
          className={['map-country', active === s.id ? 'is-active' : ''].join(' ')}
          data-interactive={s.interactive ? 'true' : 'false'}
          role={s.interactive ? 'button' : undefined}
          tabIndex={s.interactive ? 0 : -1}
          aria-label={s.interactive ? s.name : undefined}
          aria-pressed={s.interactive ? active === s.id : undefined}
          onPointerEnter={() => s.interactive && onActive(s.id)}
          onPointerLeave={() => s.interactive && onActive(null)}
          onFocus={() => s.interactive && onActive(s.id)}
          onBlur={() => onActive(null)}
          onClick={() => s.interactive && onActive(s.id)}
          onKeyDown={(e) => {
            if (!s.interactive) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onActive(s.id);
              return;
            }
            const next = move(s, e.key);
            if (next) {
              e.preventDefault();
              refs.current.get(next.id)?.focus();
            }
          }}
        >
          {s.interactive && <title>{lookup[s.id]?.name ?? s.name}</title>}
        </path>
      ))}
    </svg>
  );
}
