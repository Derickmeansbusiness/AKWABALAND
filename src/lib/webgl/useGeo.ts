'use client';

import { useEffect, useState } from 'react';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { AfricaTopology } from './africaShape';

export interface LandTopology extends Topology {
  objects: { land: GeometryCollection };
}

const cache = new Map<string, Promise<unknown>>();

function load<T>(url: string): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${url}: ${r.status}`);
      return r.json() as Promise<T>;
    });
    cache.set(url, p);
  }
  return p;
}

/** Natural Earth geometry, fetched once per session and shared by every act that draws the continent. */
export function useAfricaTopology(): AfricaTopology | null {
  const [topo, setTopo] = useState<AfricaTopology | null>(null);
  useEffect(() => {
    let live = true;
    load<AfricaTopology>('/geo/africa-50m.topo.json')
      .then((t) => live && setTopo(t))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return topo;
}

export function loadLandTopology(): Promise<LandTopology> {
  return load<LandTopology>('/geo/land-110m.topo.json');
}

export function loadAfricaTopologyCached(): Promise<AfricaTopology> {
  return load<AfricaTopology>('/geo/africa-50m.topo.json');
}
