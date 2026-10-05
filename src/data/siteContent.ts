/**
 * Every word the experience says, in the order it says it.
 * Sections render from here; they never carry copy of their own.
 */
import type { Audience } from '@/hooks/usePresentationMode';

export const brand = {
  name: 'AKWABA-LAND',
  tagline: 'African Heritage · Global Horizons',
  taglineParts: ['African Heritage', 'Global Horizons'],
  descriptor: 'A proposed global cultural destination bringing Africa’s civilizations, stories and living heritage to the United Arab Emirates.',
  status: ['Concept Development', 'Confidential Presentation', 'Subject to feasibility, approvals and development.'],
} as const;

export type ActId = '00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10';

export interface ActMeta {
  id: ActId;
  anchor: string;
  title: string;
  /** label used by the act indicator and presentation mode */
  short: string;
  /** which nav item, if any, points here */
  nav?: string;
}

export const acts: readonly ActMeta[] = [
  { id: '00', anchor: 'awakening', title: 'The Awakening', short: 'Awakening' },
  { id: '01', anchor: 'reveal', title: 'The Reveal', short: 'Reveal', nav: 'Vision' },
  { id: '02', anchor: 'arrival', title: 'Arrival', short: 'Arrival' },
  { id: '03', anchor: 'axis', title: 'The Ceremonial Axis', short: 'Axis' },
  { id: '04', anchor: 'experience', title: 'The Experiences', short: 'Experiences', nav: 'Experience' },
  { id: '05', anchor: 'nations', title: 'One Continent. Many Nations.', short: 'Nations', nav: 'Nations' },
  { id: '06', anchor: 'why-uae', title: 'Why the UAE', short: 'Why UAE', nav: 'Why UAE' },
  { id: '07', anchor: 'economy', title: 'The Cultural Economy', short: 'Economy' },
  { id: '08', anchor: 'partnership', title: 'The Partnership', short: 'Partnership', nav: 'Partnership' },
  { id: '09', anchor: 'network', title: 'The Future Network', short: 'Network', nav: 'Development' },
  { id: '10', anchor: 'invitation', title: 'The Invitation', short: 'Invitation' },
];

/** Same order for every audience today. The hook exists so a royal or investor cut can be re-sequenced later without touching sections. */
export function actOrderFor(audience: Audience): ActId[] {
  switch (audience) {
    // Future cuts go here, e.g. an investor sequence that brings Act 07 forward.
    case 'royal':
    case 'government':
    case 'investor':
    case 'culture':
    default:
      return acts.map((a) => a.id);
  }
}

export const navigation = {
  primary: [
    { label: 'Vision', href: '#reveal' },
    { label: 'Experience', href: '#experience' },
    { label: 'Nations', href: '#nations' },
    { label: 'Why UAE', href: '#why-uae' },
    { label: 'Partnership', href: '#partnership' },
    { label: 'Development', href: '/development' },
  ],
  action: { label: 'Private Briefing', href: '/briefing' },
} as const;

export const act00 = {
  lines: ['A continent of civilizations.', 'A world of stories.', 'A legacy still being written.'],
} as const;

export const act01 = {
  title: brand.name,
  subtitle: brand.tagline,
  descriptor: brand.descriptor,
  statement: ['Africa,', 'experienced differently.'],
  scrollHint: 'Scroll',
} as const;

export const act02 = {
  welcome: ['Welcome to', brand.name],
  line: 'Where Africa opens its stories to the world.',
} as const;

export const act03 = {
  statement: 'A world within a world.',
  wayfinding: ['Heritage', 'Heroes', 'Nations', 'Literature', 'Family', 'Traditions', 'Cuisine', 'Performance'],
} as const;

export const act05 = {
  statement: ['One continent.', 'Many nations.', 'Infinite stories.'],
  body: 'A permanent international platform through which participating African nations can engage global audiences from the UAE.',
  categories: ['Culture', 'Tourism', 'Heritage', 'Craft', 'Cuisine', 'Rotating exhibitions', 'Destination promotion'],
  note: 'Participation is open to every African nation. No country shown here has been confirmed as a participant.',
  instructions: 'Hover or use the arrow keys to move across the continent.',
} as const;

export const act06 = {
  sequence: ['A global crossroads.', 'A world tourism platform.', 'A bridge between continents.'],
  title: 'Why the UAE',
  body: [
    'Akwaba-Land is envisioned as an international flagship outside Africa, positioned within one of the world’s most globally connected tourism, investment and cultural environments.',
    'A platform through which African culture can meet audiences from the Gulf, Asia, Europe, the Americas and beyond.',
  ],
  arcs: ['Africa', 'Europe', 'Asia', 'Gulf'],
} as const;

export const act07 = {
  centre: brand.name,
  nodes: [
    'Destination admissions',
    'National pavilions',
    'Hospitality',
    'Food & beverage',
    'Events',
    'Retail',
    'Sponsorship',
    'Education',
    'Publishing',
    'Comics',
    'Animation',
    'Digital content',
    'Licensing',
    'Cultural IP',
  ],
  statementA: ['The destination', 'is the platform.'],
  statementB: ['The cultural IP ecosystem', 'is the scale.'],
  body: 'Akwaba-Land is conceived as a diversified cultural enterprise combining destination revenue with hospitality, events, education, partnerships, publishing and long-term intellectual property development.',
} as const;

export const act09 = {
  flagship: { label: 'Global flagship', place: 'UAE' },
  regions: ['West Africa', 'Central Africa', 'East Africa', 'Southern Africa', 'North Africa'],
  statement: ['The UAE establishes the platform.', 'Africa builds the network.'],
  body: 'A future ecosystem of destinations, exhibitions, education, publishing, animation and African cultural intellectual property.',
  note: 'Regions indicate conceptual expansion. No site has been selected.',
} as const;

export const act10 = {
  stages: [
    ['We are not proposing', 'another attraction.'],
    ['We are proposing', 'a global home', 'for African heritage.'],
    ['In one of the world’s', 'most visible meeting places.'],
  ],
  lockup: { name: brand.name, tagline: brand.tagline },
  triad: ['A UAE flagship.', 'A global platform.', 'An African legacy.'],
  actions: [
    { label: 'Request private briefing', href: '/briefing', primary: true },
    { label: 'View development framework', href: '/development' },
    { label: 'Download concept note', href: '/downloads' },
  ],
  footer: brand.status,
} as const;

export const presentation = {
  hint: 'Use ← → or space to move between acts. F for fullscreen.',
  fullscreen: 'Fullscreen',
  exitFullscreen: 'Exit fullscreen',
} as const;

export const sound = {
  enable: 'Sound on',
  disable: 'Sound off',
  note: 'Ambient only. Nothing plays until you ask.',
} as const;
