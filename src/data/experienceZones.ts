import type { VisualTone } from './mediaManifest';

export interface ExperienceZone {
  id: string;
  number: string;
  title: string;
  /** The staccato words that open the chapter */
  words: string[];
  description: string;
  /** manifest ids: the first is the chapter frame; others are available for a second beat */
  media: string[];
  /** direction for the scene; read by the section to choose a motion recipe */
  motion: 'push-facade' | 'interior-drift' | 'horizontal-promenade' | 'architectural-glide' | 'warm-light' | 'hands-and-fabric' | 'day-to-evening' | 'emotional-peak';
  tone: VisualTone;
  /** optional caption shown small, e.g. disclaimers */
  caption?: string;
}

export const experienceZones: readonly ExperienceZone[] = [
  {
    id: 'heritage-hall',
    number: '01',
    title: 'Pan-African Heritage Hall',
    words: ['Civilizations.', 'Kingdoms.', 'Ideas.', 'Memory.'],
    description: 'A contemporary cultural landmark exploring the depth and contribution of African civilizations.',
    media: ['heritage-hall-alt-a', 'heritage-hall-facade'],
    motion: 'push-facade',
    tone: 'golden-hour',
  },
  {
    id: 'heroes',
    number: '02',
    title: 'Hall of Heroes & Kingdoms',
    words: ['Queens.', 'Kings.', 'Warriors.', 'Thinkers.', 'Builders.'],
    description: 'A journey through those who shaped African history.',
    media: ['heroes-hall-statue', 'heroes-hall-wide'],
    motion: 'interior-drift',
    tone: 'interior-warm',
  },
  {
    id: 'nations',
    number: '03',
    title: 'African Nations Pavilion District',
    words: ['54 nations.', 'One global platform.'],
    description: 'A permanent destination through which participating African countries can present culture, tourism, craftsmanship and national identity to international visitors.',
    media: ['nations-boulevard'],
    motion: 'horizontal-promenade',
    tone: 'day-neutral',
    caption: 'Pavilion identities are illustrative. Participation is open to all African nations; none is implied to have joined.',
  },
  {
    id: 'library',
    number: '04',
    title: 'African Literature & Comics Library',
    words: ['Stories.', 'Ideas.', 'Memory.', 'Imagination.'],
    description: 'A global home for African literature, philosophy, history, comics, graphic storytelling and children’s publishing.',
    media: ['library-atrium-boy', 'library-interior'],
    motion: 'architectural-glide',
    tone: 'interior-light',
  },
  {
    id: 'childrens-fortress',
    number: '05',
    title: 'Children’s Fortress',
    words: ['Discover.', 'Play.', 'Imagine.', 'Belong.'],
    description: 'A family learning world where children encounter Africa through exploration, storytelling and creativity.',
    media: ['childrens-fortress', 'child-eyes'],
    motion: 'warm-light',
    tone: 'day-neutral',
  },
  {
    id: 'living-traditions',
    number: '06',
    title: 'Living Traditions',
    words: ['Craft.', 'Textile.', 'Music.', 'Making.', 'Storytelling.'],
    description: 'African culture experienced through the people who continue to create it.',
    media: ['living-traditions'],
    motion: 'hands-and-fabric',
    tone: 'golden-hour',
  },
  {
    id: 'culinary',
    number: '07',
    title: 'Afro-Culinary District',
    words: ['A continent experienced through taste.'],
    description: '',
    media: ['culinary-district'],
    motion: 'day-to-evening',
    tone: 'sunset',
  },
  {
    id: 'arena',
    number: '08',
    title: 'Grand Cultural Performance Arena',
    words: ['Africa takes the stage.'],
    description: '',
    media: ['arena-night'],
    motion: 'emotional-peak',
    tone: 'night',
  },
];
