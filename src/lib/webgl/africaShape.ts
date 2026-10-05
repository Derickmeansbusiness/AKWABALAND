import * as THREE from 'three';
import { geoAzimuthalEqualArea } from 'd3-geo';
import { feature, merge } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';

export interface AfricaTopology extends Topology {
  objects: { africa: GeometryCollection<{ name: string; iso3: string; region: string | null; interactive: boolean }> };
}

export interface AfricaGeometry {
  /** merged continent + islands, projected and normalised to a ~2.4 unit width */
  shapes: THREE.Shape[];
  /** per-country shapes for the interactive map */
  countries: { id: string; name: string; interactive: boolean; shapes: THREE.Shape[] }[];
  /** lon/lat → normalised plane coords, same transform as the shapes */
  project: (lonLat: [number, number]) => [number, number];
  features: FeatureCollection;
}

/**
 * Natural Earth → projected plane → THREE.Shape. One projection for everything
 * so the sculpture, the interactive map and the light's path to the Gulf agree
 * on where places are. Azimuthal equal-area centred on the continent keeps the
 * silhouette honest; Mercator would bloat the north.
 */
export function buildAfricaGeometry(topo: AfricaTopology, targetWidth = 2.4): AfricaGeometry {
  const fc = feature(topo, topo.objects.africa) as FeatureCollection;
  const merged = merge(topo, topo.objects.africa.geometries as Parameters<typeof merge>[1]) as MultiPolygon;

  const projection = geoAzimuthalEqualArea().rotate([-18, -3, 0]).scale(1).translate([0, 0]);

  // Bounding box of the projected continent to normalise scale.
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const raw = (p: Position): [number, number] => {
    const r = projection([p[0], p[1]]) ?? [0, 0];
    return [r[0], r[1]];
  };
  for (const poly of merged.coordinates) for (const ring of poly) for (const p of ring) {
    const [x, y] = raw(p);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const scale = targetWidth / (maxX - minX);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const project = (lonLat: [number, number]): [number, number] => {
    const [x, y] = raw(lonLat);
    return [(x - cx) * scale, -(y - cy) * scale]; // flip Y: screen down → world up
  };

  const ringToPath = (ring: Position[]): THREE.Path => {
    const path = new THREE.Path();
    ring.forEach((p, i) => {
      const [x, y] = project([p[0], p[1]]);
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    path.closePath();
    return path;
  };
  const polygonToShape = (rings: Position[][]): THREE.Shape | null => {
    if (!rings.length || rings[0].length < 4) return null;
    const shape = new THREE.Shape(ringToPath(rings[0]).getPoints());
    for (let i = 1; i < rings.length; i++) {
      if (rings[i].length >= 4) shape.holes.push(ringToPath(rings[i]));
    }
    return shape;
  };

  const shapes = merged.coordinates.map(polygonToShape).filter((s): s is THREE.Shape => s !== null);

  const countries = (fc.features as Feature<Polygon | MultiPolygon, { name: string; interactive: boolean }>[]).map((f) => {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    return {
      id: String(f.id),
      name: f.properties.name,
      interactive: f.properties.interactive,
      shapes: polys.map(polygonToShape).filter((s): s is THREE.Shape => s !== null),
    };
  });

  return { shapes, countries, project, features: fc };
}

/** SVG path for a feature collection in the same normalised space, for the no-WebGL fallback. */
export function africaSvgPath(geo: AfricaGeometry, viewScale = 100): string {
  const d: string[] = [];
  for (const shape of geo.shapes) {
    const pts = shape.getPoints();
    d.push(pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(p.x * viewScale).toFixed(1)} ${(-p.y * viewScale).toFixed(1)}`).join('') + 'Z');
  }
  return d.join('');
}

export async function loadAfricaTopology(url = '/geo/africa-50m.topo.json'): Promise<AfricaTopology> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`geo: ${res.status}`);
  return (await res.json()) as AfricaTopology;
}
