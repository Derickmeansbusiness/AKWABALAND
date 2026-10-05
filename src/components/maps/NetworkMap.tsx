'use client';

import { forwardRef, useMemo } from 'react';
import { geoAzimuthalEqualArea, geoPath } from 'd3-geo';
import { feature, merge } from 'topojson-client';
import type { FeatureCollection, MultiPolygon } from 'geojson';
import { useAfricaTopology } from '@/lib/webgl/useGeo';
import { regionAnchors, regionLabels, type Region } from '@/data/nationPavilionModel';

const UAE: [number, number] = [54.4, 24.4];
const REGIONS: Region[] = ['north', 'west', 'central', 'east', 'southern'];

/**
 * The flagship in the Gulf and five conceptual regions, over the real
 * silhouette of the continent. Regions are dashed: nothing is sited.
 */
export const NetworkMap = forwardRef<SVGSVGElement, { flagshipLabel: string; flagshipPlace: string }>(function NetworkMap({ flagshipLabel, flagshipPlace }, ref) {
  const topo = useAfricaTopology();

  const model = useMemo(() => {
    if (!topo) return null;
    const fc = feature(topo, topo.objects.africa) as FeatureCollection;
    const outline = merge(topo, topo.objects.africa.geometries as Parameters<typeof merge>[1]) as MultiPolygon;
    const projection = geoAzimuthalEqualArea().rotate([-28, -6, 0]).fitExtent(
      [
        [60, 120],
        [900, 940],
      ],
      fc,
    );
    const path = geoPath(projection);
    const uae = projection(UAE) ?? [0, 0];
    const regions = REGIONS.map((r) => ({ id: r, label: regionLabels[r], xy: projection(regionAnchors[r]) ?? [0, 0] }));
    const maxX = Math.max(uae[0] + 140, 1000);
    return { d: path(outline) ?? '', uae, regions, viewBox: `0 0 ${Math.ceil(maxX)} 1000` };
  }, [topo]);

  if (!model) return <svg ref={ref} className="network-svg" aria-busy="true" />;

  return (
    <svg ref={ref} viewBox={model.viewBox} preserveAspectRatio="xMidYMid meet" className="network-svg" role="img" aria-label="Conceptual network: a flagship in the UAE and five African regions">
      <path className="net-outline" d={model.d} />
      {model.regions.map((r) => {
        const [x1, y1] = model.uae;
        const [x2, y2] = r.xy;
        const mx = (x1 + x2) / 2 + (y2 - y1) * 0.18;
        const my = (y1 + y2) / 2 - (x2 - x1) * 0.18;
        return <path key={r.id} data-net-line={r.id} className="net-line" d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1} />;
      })}
      {/* Outer <g> carries the position; the inner one is what GSAP animates, since GSAP owns the transform attribute of anything it touches. */}
      {model.regions.map((r) => (
        <g key={r.id} transform={`translate(${r.xy[0]} ${r.xy[1]})`}>
          <g data-net-region={r.id} className="net-region" style={{ opacity: 0 }}>
            <circle r={18} />
            <circle r={2.5} style={{ fill: 'var(--stone)', stroke: 'none' }} />
            <text y={38} textAnchor="middle">
              {r.label}
            </text>
          </g>
        </g>
      ))}
      <g transform={`translate(${model.uae[0]} ${model.uae[1]})`}>
        <g data-net-flag className="net-flag" style={{ opacity: 0 }}>
          <circle className="ring" r={26} data-ring />
          <circle className="core" r={5} />
          <text y={-40} textAnchor="middle">
            {flagshipLabel}
          </text>
          <text y={-22} textAnchor="middle" style={{ fill: 'var(--gold)' }}>
            {flagshipPlace}
          </text>
        </g>
      </g>
    </svg>
  );
});
