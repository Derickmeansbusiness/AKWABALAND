/**
 * The participation model for the National Pavilion platform, as a concept.
 * Nothing here names a confirmed participant. Country geometry and names come
 * from Natural Earth via public/geo/africa-50m.topo.json and africaCountries.json.
 */
import africaCountries from './africaCountries.json';

export type Region = 'north' | 'west' | 'central' | 'east' | 'southern';

export interface CountryRecord {
  name: string;
  iso3: string;
  region: Region | null;
  /** false for territories kept only to complete the continent silhouette */
  interactive: boolean;
}

export const countries = africaCountries as Record<string, CountryRecord>;

export const regionLabels: Record<Region, string> = {
  north: 'North Africa',
  west: 'West Africa',
  central: 'Central Africa',
  east: 'East Africa',
  southern: 'Southern Africa',
};

/** Approximate anchor points (lon, lat) for the five regions, used by the network act. Conceptual, not sites. */
export const regionAnchors: Record<Region, [number, number]> = {
  north: [10, 29],
  west: [-4, 11],
  central: [20, 2],
  east: [38, 4],
  southern: [25, -22],
};

export const pavilionModel = {
  headline: 'One permanent platform. Every African nation invited.',
  principle: 'Each participating nation would present its own culture, tourism offer, craft and identity through a dedicated pavilion, programmed by that nation with Akwaba-Land’s curatorial and operational support.',
  demonstrationCategories: [
    { id: 'culture', label: 'Culture', line: 'Art, music, language, contemporary creativity.' },
    { id: 'tourism', label: 'Tourism', line: 'Destinations, routes and seasons presented to a global visitor base.' },
    { id: 'heritage', label: 'Heritage', line: 'Kingdoms, sites, archives and living memory.' },
    { id: 'craft', label: 'Craft', line: 'Makers, materials and techniques, demonstrated and sold.' },
    { id: 'cuisine', label: 'Cuisine', line: 'National kitchens within the culinary district.' },
    { id: 'exhibitions', label: 'Rotating exhibitions', line: 'Seasonal programmes curated with national institutions.' },
    { id: 'promotion', label: 'Destination promotion', line: 'Tourism boards, investment agencies and airlines in one place.' },
  ],
  participation: [
    'Nations participate by agreement; the model is designed to be inclusive and to grow over time.',
    'An initial cluster of pavilions is envisioned, with development space reserved for future participants.',
    'Pavilion content, programming and representation remain the prerogative of each participating nation.',
  ],
  totalNations: 54,
} as const;
