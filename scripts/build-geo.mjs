/**
 * Build the African geography the experience needs from Natural Earth data
 * (via the world-atlas package, 1:50m). Nothing is drawn by hand.
 *
 * Outputs
 *   public/geo/africa-50m.topo.json  — TopoJSON subset: the 54 states plus
 *                                      Western Sahara as a non-interactive
 *                                      territory, so the continent silhouette
 *                                      is complete.
 *   src/data/africaCountries.json    — id → { name, iso3, region } lookup used
 *                                      by the interactive map and the network act.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as topojson from 'topojson-client';
import { filter as pruneArcs } from 'topojson-simplify';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const world = JSON.parse(readFileSync(path.join(ROOT, 'node_modules/world-atlas/countries-50m.json'), 'utf8'));

// ISO 3166-1 numeric → [name as we display it, ISO3, region used in Act 09]
const AFRICA = {
  '012': ['Algeria', 'DZA', 'north'],
  '024': ['Angola', 'AGO', 'southern'],
  '204': ['Benin', 'BEN', 'west'],
  '072': ['Botswana', 'BWA', 'southern'],
  '854': ['Burkina Faso', 'BFA', 'west'],
  '108': ['Burundi', 'BDI', 'east'],
  '120': ['Cameroon', 'CMR', 'central'],
  '132': ['Cabo Verde', 'CPV', 'west'],
  '140': ['Central African Republic', 'CAF', 'central'],
  '148': ['Chad', 'TCD', 'central'],
  '174': ['Comoros', 'COM', 'east'],
  '178': ['Republic of the Congo', 'COG', 'central'],
  '180': ['Democratic Republic of the Congo', 'COD', 'central'],
  '384': ["Côte d'Ivoire", 'CIV', 'west'],
  '262': ['Djibouti', 'DJI', 'east'],
  '818': ['Egypt', 'EGY', 'north'],
  '226': ['Equatorial Guinea', 'GNQ', 'central'],
  '232': ['Eritrea', 'ERI', 'east'],
  '748': ['Eswatini', 'SWZ', 'southern'],
  '231': ['Ethiopia', 'ETH', 'east'],
  '266': ['Gabon', 'GAB', 'central'],
  '270': ['The Gambia', 'GMB', 'west'],
  '288': ['Ghana', 'GHA', 'west'],
  '324': ['Guinea', 'GIN', 'west'],
  '624': ['Guinea-Bissau', 'GNB', 'west'],
  '404': ['Kenya', 'KEN', 'east'],
  '426': ['Lesotho', 'LSO', 'southern'],
  '430': ['Liberia', 'LBR', 'west'],
  '434': ['Libya', 'LBY', 'north'],
  '450': ['Madagascar', 'MDG', 'east'],
  '454': ['Malawi', 'MWI', 'southern'],
  '466': ['Mali', 'MLI', 'west'],
  '478': ['Mauritania', 'MRT', 'west'],
  '480': ['Mauritius', 'MUS', 'east'],
  '504': ['Morocco', 'MAR', 'north'],
  '508': ['Mozambique', 'MOZ', 'southern'],
  '516': ['Namibia', 'NAM', 'southern'],
  '562': ['Niger', 'NER', 'west'],
  '566': ['Nigeria', 'NGA', 'west'],
  '646': ['Rwanda', 'RWA', 'east'],
  '678': ['São Tomé and Príncipe', 'STP', 'central'],
  '686': ['Senegal', 'SEN', 'west'],
  '690': ['Seychelles', 'SYC', 'east'],
  '694': ['Sierra Leone', 'SLE', 'west'],
  '706': ['Somalia', 'SOM', 'east'],
  '710': ['South Africa', 'ZAF', 'southern'],
  '728': ['South Sudan', 'SSD', 'east'],
  '729': ['Sudan', 'SDN', 'north'],
  '834': ['Tanzania', 'TZA', 'east'],
  '768': ['Togo', 'TGO', 'west'],
  '788': ['Tunisia', 'TUN', 'north'],
  '800': ['Uganda', 'UGA', 'east'],
  '894': ['Zambia', 'ZMB', 'southern'],
  '716': ['Zimbabwe', 'ZWE', 'southern'],
};
// Territory kept for silhouette completeness only. Rendered in the base tone,
// not addressable, no label — the brief forbids unsupported geopolitical language.
const TERRITORIES = { '732': ['Western Sahara', 'ESH', null] };

const keep = new Set([...Object.keys(AFRICA), ...Object.keys(TERRITORIES)]);
const countries = world.objects.countries;
const geometries = countries.geometries.filter((g) => keep.has(String(g.id)));
const found = new Set(geometries.map((g) => String(g.id)));
const missing = [...keep].filter((id) => !found.has(id));
if (missing.length) {
  console.warn('Not present at 1:50m (small island states can be absent):', missing.map((m) => (AFRICA[m] ?? TERRITORIES[m])[0]).join(', '));
}

for (const g of geometries) {
  const meta = AFRICA[String(g.id)] ?? TERRITORIES[String(g.id)];
  g.properties = { name: meta[0], iso3: meta[1], region: meta[2], interactive: meta[2] !== null };
}

const subset = { type: 'Topology', transform: world.transform, arcs: world.arcs, objects: { africa: { type: 'GeometryCollection', geometries } } };
// Drop every arc the African geometries do not reference; the world file is ~700 KB, Africa alone is far smaller.
const pruned = pruneArcs(subset, () => true);
mkdirSync(path.join(ROOT, 'public/geo'), { recursive: true });
writeFileSync(path.join(ROOT, 'public/geo/africa-50m.topo.json'), JSON.stringify(pruned));

const lookup = Object.fromEntries(
  Object.entries(AFRICA).map(([id, [name, iso3, region]]) => [id, { name, iso3, region, interactive: true }]),
);
for (const [id, [name, iso3]] of Object.entries(TERRITORIES)) lookup[id] = { name, iso3, region: null, interactive: false };
writeFileSync(path.join(ROOT, 'src/data/africaCountries.json'), JSON.stringify(lookup, null, 2));

// Sanity: the merged outline must be a single valid multipolygon.
const merged = topojson.merge(subset, geometries);
console.log(`Africa: ${geometries.length} geometries, outline has ${merged.coordinates.length} rings; wrote public/geo/africa-50m.topo.json`);
