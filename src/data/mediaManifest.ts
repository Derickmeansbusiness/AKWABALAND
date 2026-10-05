/**
 * Curated media manifest.
 *
 * Every image and clip the experience renders is referenced through here —
 * never by a hard-coded path inside a section. The raw registry of what the
 * project owns lives in ./mediaSources.ts (generated); this file is the
 * creative selection from it, with framing and intent attached.
 *
 * `src` paths point at files produced by `npm run media:fetch`
 * (public/media/akwaba/<id>/…). `resolveImage()` / `resolveVideo()` in
 * src/lib/media/resolve.ts decide between local files and the remote CDN.
 */
import { mediaSourceById, type MediaSource } from './mediaSources.ts';

export type MediaCategory =
  | 'master-aerial'
  | 'entrance'
  | 'arrival'
  | 'promenade'
  | 'heritage-hall'
  | 'heroes'
  | 'national-pavilions'
  | 'library'
  | 'childrens-fortress'
  | 'mythology'
  | 'living-traditions'
  | 'culinary'
  | 'performance'
  | 'hospitality'
  | 'night'
  | 'landscape'
  | 'details'
  | 'people'
  | 'reference';

export type MediaPriority = 'hero' | 'primary' | 'secondary' | 'reserve' | 'excluded';

export type ReviewStatus = 'approved' | 'needs-visual-review' | 'reserve' | 'excluded';

/** Visual tone drives the pre-load placeholder colour and overlay strength. */
export type VisualTone =
  | 'dawn-warm'
  | 'day-neutral'
  | 'golden-hour'
  | 'sunset'
  | 'night'
  | 'interior-dark'
  | 'interior-light'
  | 'interior-warm';

export interface Crop {
  /** CSS aspect-ratio string, e.g. "16 / 9" */
  aspect: string;
  /** object-position override; defaults to focalPoint */
  position?: string;
}

export interface FocalPoint {
  /** 0..1 from left */
  x: number;
  /** 0..1 from top */
  y: number;
}

export interface VideoVariant {
  /** local path produced by media:fetch */
  src: string;
  /** Higgsfield job id, for remote resolution and provenance */
  sourceId: string;
  width: number;
  height: number;
}

export interface OptionalVideo {
  desktop: VideoVariant;
  /** 720p transcode of the same clip; falls back to desktop if missing */
  mobile?: VideoVariant;
  /** poster is always the still of the same asset */
  durationSeconds: number;
  /** All Kling clips were generated with sound. We never play it. media:fetch strips it. */
  embeddedAudioStripped: boolean;
  /** How the clip moves — used to pick which scenes may scrub vs. autoplay */
  cameraMovement: string;
}

export interface MediaAsset {
  id: string;
  category: MediaCategory;
  /** Higgsfield job id of the still */
  sourceId: string;
  /** local still, full resolution WebP (media:fetch also emits AVIF + size ladder) */
  src: string;
  width: number;
  height: number;
  alt: string;
  priority: MediaPriority;
  desktopCrop: Crop;
  mobileCrop: Crop;
  focalPoint: FocalPoint;
  motionEligible: boolean;
  caption?: string;
  visualTone: VisualTone;
  optionalVideo?: OptionalVideo;
  /** reserved for 2.5D treatment; nothing generated yet */
  optionalDepthMap?: string;
  /** Which act(s) use it; empty means held in reserve */
  acts: string[];
  reviewStatus: ReviewStatus;
  /** Why it was chosen or held — read by the audit, not the UI */
  notes?: string;
}

const CDN_LOCAL_ROOT = '/media/akwaba';

function still(id: string): string {
  return `${CDN_LOCAL_ROOT}/${id}/${id}-2560.webp`;
}

function video(id: string, sourceId: string, durationSeconds: number, cameraMovement: string): OptionalVideo {
  return {
    desktop: { src: `${CDN_LOCAL_ROOT}/${id}/${id}-1080.mp4`, sourceId, width: 1920, height: 1080 },
    mobile: { src: `${CDN_LOCAL_ROOT}/${id}/${id}-720.mp4`, sourceId, width: 1280, height: 720 },
    durationSeconds,
    embeddedAudioStripped: true,
    cameraMovement,
  };
}

const WIDE: Crop = { aspect: '16 / 9' };
const PORTRAIT: Crop = { aspect: '9 / 16' };
const CENTER: FocalPoint = { x: 0.5, y: 0.5 };

export const mediaManifest: readonly MediaAsset[] = [
  // ───────────────────────── Master aerials ─────────────────────────
  {
    id: 'aerial-reveal',
    category: 'master-aerial',
    sourceId: 'd496f8b7-7803-4065-a0c0-a89c6dbf3b92',
    src: still('aerial-reveal'),
    width: 3840,
    height: 2160,
    alt: 'Aerial view at sunrise over the proposed Akwaba-Land masterplan: the monumental entrance gateway in the foreground, the domed Pan-African Heritage Hall at the centre of a ceremonial axis, pavilion districts and landscaped courtyards, with the Dubai skyline on the horizon.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: { aspect: '9 / 16', position: '50% 55%' },
    focalPoint: { x: 0.5, y: 0.55 },
    motionEligible: true,
    visualTone: 'dawn-warm',
    optionalVideo: video('aerial-reveal', 'd19ee403-6126-435c-9031-1d1be20908fe', 5, 'drone rises slowly and pushes forward toward the great hall'),
    acts: ['01'],
    reviewStatus: 'needs-visual-review',
    notes: 'Briefed as Shot 01, the Grand Aerial Reveal. Has the only forward-pushing aerial clip. Compare against aerial-master-day for colour cast before locking as hero.',
  },
  {
    id: 'aerial-sunset',
    category: 'master-aerial',
    sourceId: 'cd0b0f3f-4ec3-4e1b-884c-d1fabed22d0e',
    src: still('aerial-sunset'),
    width: 3840,
    height: 2160,
    alt: 'Aerial view at sunset over the proposed Akwaba-Land destination, the entrance gateway in the foreground and the Dubai skyline glowing on the horizon.',
    priority: 'primary',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: { x: 0.5, y: 0.5 },
    motionEligible: true,
    visualTone: 'sunset',
    optionalVideo: video('aerial-sunset', '37c12ea8-5323-40f4-aa20-3ec98765fbee', 6, 'slow aerial rise, drifting back'),
    acts: ['10'],
    reviewStatus: 'approved',
    notes: 'Nearest thing to a blue-hour aerial. Act 10 should receive a true night aerial — see HIGGSFIELD_MOTION_BRIEF.',
  },
  {
    id: 'aerial-master-day',
    category: 'master-aerial',
    sourceId: '66e8a7dc-82e3-4e47-876e-4df536a26b15',
    src: still('aerial-master-day'),
    width: 3840,
    height: 2160,
    alt: 'Three-quarter aerial of the proposed Akwaba-Land masterplan in neutral daylight, showing the hierarchy of buildings, pedestrian routes and landscape.',
    priority: 'secondary',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: CENTER,
    motionEligible: true,
    visualTone: 'day-neutral',
    acts: ['development'],
    reviewStatus: 'needs-visual-review',
    notes: 'The V3 master. Neutral light suits the Development Framework page.',
  },
  {
    id: 'aerial-master-day-alt',
    category: 'master-aerial',
    sourceId: 'dc1a9c75-c35e-497d-b283-0b052a06355f',
    src: still('aerial-master-day-alt'),
    width: 3840,
    height: 2160,
    alt: 'Alternate aerial of the proposed Akwaba-Land masterplan in daylight.',
    priority: 'reserve',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: CENTER,
    motionEligible: false,
    visualTone: 'day-neutral',
    acts: [],
    reviewStatus: 'reserve',
  },

  // ───────────────────────── Entrance ─────────────────────────
  {
    id: 'entrance-gateway',
    category: 'entrance',
    sourceId: 'f94769f9-d12d-480f-ad54-ffddc31c3f1f',
    src: still('entrance-gateway'),
    width: 3840,
    height: 2160,
    alt: 'The proposed Akwaba-Land entrance gateway at ground level in morning light: sculptural sandstone walls, bronze detailing, a shaded arrival sequence with reflecting pools and visitors arriving.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: { aspect: '9 / 16', position: '50% 45%' },
    focalPoint: { x: 0.5, y: 0.45 },
    motionEligible: true,
    visualTone: 'golden-hour',
    optionalVideo: video('entrance-gateway', '4bbc4ff1-de73-438d-8e5a-7a8f6e82c929', 5, 'steadicam dolly forward through the gateway, following a couple toward the fountains'),
    acts: ['02'],
    reviewStatus: 'approved',
  },
  ...(['a74fccc4-7dd0-4b6f-90dd-3b15d30e3523', '1a22bba9-925c-4494-a15a-c3357e3567be', 'a85ec289-1685-4c11-aac2-3a9d4920f640'] as const).map(
    (sourceId, i): MediaAsset => ({
      id: `entrance-alt-${'abc'[i]}`,
      category: 'entrance',
      sourceId,
      src: still(`entrance-alt-${'abc'[i]}`),
      width: 2752,
      height: 1536,
      alt: 'Alternate angle of the proposed Akwaba-Land entrance gateway.',
      priority: 'reserve',
      desktopCrop: WIDE,
      mobileCrop: PORTRAIT,
      focalPoint: CENTER,
      motionEligible: false,
      visualTone: 'golden-hour',
      acts: [],
      reviewStatus: 'needs-visual-review',
      notes: 'Upscaled crop from the gateway angle sheet. Candidate for the mobile hero if more vertical.',
    }),
  ),

  // ───────────────────────── Heritage Hall / promenade ─────────────────────────
  {
    id: 'heritage-hall-facade',
    category: 'heritage-hall',
    sourceId: 'd4f1c358-0014-4785-b697-347ed392743c',
    src: still('heritage-hall-facade'),
    width: 3840,
    height: 2160,
    alt: 'The proposed Pan-African Heritage Hall seen from the ceremonial plaza at golden hour: a reflecting pool and bronze globe fountain in the foreground, a monumental bronze face visible through the glass façade.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: { aspect: '9 / 16', position: '50% 40%' },
    focalPoint: { x: 0.5, y: 0.42 },
    motionEligible: true,
    visualTone: 'golden-hour',
    optionalVideo: video('heritage-hall-facade', '42df2bf8-99de-400d-b543-9c236f2e3754', 5, 'slow tilt upward from the reflecting pool to the bronze face in the glass façade'),
    acts: ['03'],
    reviewStatus: 'approved',
    notes: 'Doing double duty as the ceremonial-axis image until a dedicated promenade render exists.',
  },
  ...(['13b233e9-47f5-4798-87e0-ad50da245deb', '2d067035-9867-4cbf-acdf-9d0d5f107046', 'a203328f-3406-42d0-9fbf-55e6d140d878'] as const).map(
    (sourceId, i): MediaAsset => ({
      id: `heritage-hall-alt-${'abc'[i]}`,
      category: 'heritage-hall',
      sourceId,
      src: still(`heritage-hall-alt-${'abc'[i]}`),
      width: 2752,
      height: 1536,
      alt: 'Alternate view of the proposed Pan-African Heritage Hall.',
      priority: i === 0 ? 'primary' : 'reserve',
      desktopCrop: WIDE,
      mobileCrop: PORTRAIT,
      focalPoint: CENTER,
      motionEligible: false,
      visualTone: 'golden-hour',
      acts: i === 0 ? ['04-01'] : [],
      reviewStatus: 'needs-visual-review',
      notes: i === 0 ? 'Provisionally the Act 04-01 frame so Act 03 and 04-01 do not repeat. Confirm by eye.' : undefined,
    }),
  ),

  // ───────────────────────── Heroes ─────────────────────────
  {
    id: 'heroes-hall-wide',
    category: 'heroes',
    sourceId: '2a45096c-b9b6-46c3-adc8-e363856f00ea',
    src: still('heroes-hall-wide'),
    width: 3840,
    height: 2160,
    alt: 'Interior of the proposed Hall of Heroes and Kingdoms: a monumental gallery with stone floors, tall columns, bronze detailing and museum lighting over sculptures of African historical figures.',
    priority: 'primary',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: CENTER,
    motionEligible: true,
    visualTone: 'interior-dark',
    acts: ['04-02'],
    reviewStatus: 'approved',
  },
  {
    id: 'heroes-hall-statue',
    category: 'heroes',
    sourceId: '1dd19854-2aa5-4271-a22c-42b5c0dc1753',
    src: still('heroes-hall-statue'),
    width: 2752,
    height: 1536,
    alt: 'Inside the proposed Hall of Heroes: a visitor in an orange dress looks up at a towering bronze statue beneath an illuminated map of Africa.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: { aspect: '9 / 16', position: '55% 50%' },
    focalPoint: { x: 0.55, y: 0.5 },
    motionEligible: true,
    visualTone: 'interior-warm',
    optionalVideo: video('heroes-hall-statue', 'bc40b7eb-1d13-4134-a8ac-ce12290b2ff8', 5, 'slow push past the visitor toward the statue and the map'),
    acts: ['04-02'],
    reviewStatus: 'approved',
    notes: 'The strongest interior in the set. The crop the client chose to animate.',
  },
  ...(['e1d9cfd8-685c-4594-b3bd-db14ed4b6911', '3b323d89-7526-42fe-adc8-45d4a0aba203'] as const).map(
    (sourceId, i): MediaAsset => ({
      id: `heroes-hall-alt-${'ab'[i]}`,
      category: 'heroes',
      sourceId,
      src: still(`heroes-hall-alt-${'ab'[i]}`),
      width: 2752,
      height: 1536,
      alt: 'Alternate view inside the proposed Hall of Heroes and Kingdoms.',
      priority: 'reserve',
      desktopCrop: WIDE,
      mobileCrop: PORTRAIT,
      focalPoint: CENTER,
      motionEligible: false,
      visualTone: 'interior-dark',
      acts: [],
      reviewStatus: 'reserve',
    }),
  ),

  // ───────────────────────── National pavilions ─────────────────────────
  {
    id: 'nations-boulevard',
    category: 'national-pavilions',
    sourceId: 'f3a0e144-88dd-4845-9c50-721c194eba4f',
    src: still('nations-boulevard'),
    width: 3840,
    height: 2160,
    alt: 'A landscaped pedestrian boulevard through the proposed African Nations Pavilion District, lined with illustrative national pavilions and leading toward the domed Heritage Hall.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: { x: 0.5, y: 0.5 },
    motionEligible: true,
    visualTone: 'day-neutral',
    optionalVideo: video('nations-boulevard', '93581d9d-8750-4137-82bc-85417465b71b', 5, 'smooth glide forward along the boulevard toward the domed hall'),
    caption: 'Pavilion identities shown are illustrative. No nation has been confirmed as a participant.',
    acts: ['04-03'],
    reviewStatus: 'approved',
  },
  ...(['ac0cf1fb-ec47-42af-8f2d-9972869cd0c5', '442ac59e-5a64-42f9-916f-5f6ad1616d67'] as const).map(
    (sourceId, i): MediaAsset => ({
      id: `nations-alt-${'ab'[i]}`,
      category: 'national-pavilions',
      sourceId,
      src: still(`nations-alt-${'ab'[i]}`),
      width: 2752,
      height: 1536,
      alt: 'Alternate view of the proposed African Nations Pavilion District.',
      priority: 'reserve',
      desktopCrop: WIDE,
      mobileCrop: PORTRAIT,
      focalPoint: CENTER,
      motionEligible: false,
      visualTone: 'day-neutral',
      acts: [],
      reviewStatus: 'reserve',
    }),
  ),

  // ───────────────────────── Library ─────────────────────────
  {
    id: 'library-interior',
    category: 'library',
    sourceId: '5d36d379-eba6-4f0f-9319-37a3ed811579',
    src: still('library-interior'),
    width: 3840,
    height: 2160,
    alt: 'Interior of the proposed African Literature and Comics Library: ivory limestone, warm timber shelving, bronze accents and a tall daylit reading hall.',
    priority: 'primary',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: CENTER,
    motionEligible: true,
    visualTone: 'interior-light',
    acts: ['04-04'],
    reviewStatus: 'needs-visual-review',
  },
  {
    id: 'library-atrium-boy',
    category: 'library',
    sourceId: 'e88e53bf-a340-4744-a96c-9c4a40ffefce',
    src: still('library-atrium-boy'),
    width: 2752,
    height: 1536,
    alt: 'A boy looks up at a suspended sculpture of Africa made of golden books and panels, hanging in the circular atrium of the proposed library.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: { aspect: '9 / 16', position: '50% 35%' },
    focalPoint: { x: 0.5, y: 0.38 },
    motionEligible: true,
    visualTone: 'interior-light',
    optionalVideo: video('library-atrium-boy', 'd0c94a24-4ecc-4d9b-804a-70705bd20280', 5, 'slow tilt up following the boy’s eyes as the hanging pieces turn'),
    acts: ['04-04'],
    reviewStatus: 'approved',
  },
  ...(['2399e2df-66cb-4e36-b076-98b6fd983c89', '5a502dd2-0ee0-4660-8b6f-1f3a34c4f992', 'f95bee2d-6e78-48cc-a968-e4598c4ad8cb', 'f1b7f7fd-dae9-4852-b6de-1057f3c49e9c'] as const).map(
    (sourceId, i): MediaAsset => ({
      id: `library-alt-${'abcd'[i]}`,
      category: 'library',
      sourceId,
      src: still(`library-alt-${'abcd'[i]}`),
      width: 2752,
      height: 1536,
      alt: 'Alternate view inside the proposed African Literature and Comics Library.',
      priority: 'reserve',
      desktopCrop: WIDE,
      mobileCrop: PORTRAIT,
      focalPoint: CENTER,
      motionEligible: false,
      visualTone: 'interior-light',
      acts: [],
      reviewStatus: 'needs-visual-review',
    }),
  ),

  // ───────────────────────── Children's Fortress ─────────────────────────
  {
    id: 'childrens-fortress',
    category: 'childrens-fortress',
    sourceId: '27147c2a-24b0-4b70-b7ab-9f67b70d1b94',
    src: still('childrens-fortress'),
    width: 3840,
    height: 2160,
    alt: 'The proposed Children’s Fortress discovery district in soft afternoon light: children and families among dancing fountains, shade sails and storytelling courtyards.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: { x: 0.5, y: 0.55 },
    motionEligible: true,
    visualTone: 'day-neutral',
    optionalVideo: video('childrens-fortress', '6003739a-5647-4980-8799-c0160ea1b0c6', 5, 'low lateral tracking shot with children running through the fountains'),
    acts: ['04-05'],
    reviewStatus: 'approved',
  },
  {
    id: 'child-eyes',
    category: 'people',
    sourceId: '706b43f9-e57c-4763-a4fa-cb31a1c3e5de',
    src: still('child-eyes'),
    width: 2752,
    height: 1536,
    alt: 'Close-up of a child’s eyes in soft blue light, a warm golden reflection crossing them.',
    priority: 'primary',
    desktopCrop: WIDE,
    mobileCrop: { aspect: '9 / 16', position: '50% 50%' },
    focalPoint: CENTER,
    motionEligible: true,
    visualTone: 'interior-dark',
    optionalVideo: video('child-eyes', '2fa7c778-061c-49a6-aa8b-6e5bbc0634d2', 5, 'near-static, very slow push; one blink'),
    acts: ['04-05'],
    reviewStatus: 'approved',
    notes: 'The only portrait-scale human image. Use once, as the quiet beat inside the Children’s chapter.',
  },

  // ───────────────────────── Mythology (reserve chapter) ─────────────────────────
  {
    id: 'mythology-hall',
    category: 'mythology',
    sourceId: '66cfd5f3-c73b-4644-b493-d445ff09ff70',
    src: still('mythology-hall'),
    width: 3840,
    height: 2160,
    alt: 'The proposed mythology and oral traditions hall: an indoor space built around a great baobab, spiral screens carrying African legends, lanterns and a constellation of Anansi on the wall.',
    priority: 'secondary',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: { x: 0.5, y: 0.45 },
    motionEligible: true,
    visualTone: 'interior-dark',
    optionalVideo: video('mythology-hall', '31251c64-6a38-41ee-96e8-10cee1329327', 5, 'slow crane rise through the hall'),
    acts: [],
    reviewStatus: 'reserve',
    notes: 'Not one of the eight briefed experiences but strong. Recommended as a dark interlude between the Children’s Fortress and Living Traditions, or as the bridge into the map act.',
  },
  ...(['8eba6c01-1398-414a-89d6-71bbf049ee36', '3fdcd93f-2c31-4b4f-83b2-fe83c3b1e669', '8e94bd1f-adb7-4204-aac0-567151b69f5b', '5cddd837-d156-446b-b721-c96eb67a3cc9', '5052bb4b-8b2f-4268-af0e-5c739d905717'] as const).map(
    (sourceId, i): MediaAsset => ({
      id: `mythology-alt-${'abcde'[i]}`,
      category: 'mythology',
      sourceId,
      src: still(`mythology-alt-${'abcde'[i]}`),
      width: 2752,
      height: 1536,
      alt: 'Detail from the proposed mythology and oral traditions hall.',
      priority: 'reserve',
      desktopCrop: WIDE,
      mobileCrop: PORTRAIT,
      focalPoint: CENTER,
      motionEligible: false,
      visualTone: 'interior-dark',
      acts: [],
      reviewStatus: 'needs-visual-review',
    }),
  ),

  // ───────────────────────── Living traditions ─────────────────────────
  {
    id: 'living-traditions',
    category: 'living-traditions',
    sourceId: '7ef76f06-1589-4f81-be5c-438b0bebb9f7',
    src: still('living-traditions'),
    width: 3840,
    height: 2160,
    alt: 'Artisan courtyards in the proposed Living Traditions district: a woman weaving indigo cloth on a wooden loom, pottery workshops, a drummer and visitors under shaded walkways.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: { aspect: '9 / 16', position: '35% 50%' },
    focalPoint: { x: 0.35, y: 0.5 },
    motionEligible: true,
    visualTone: 'golden-hour',
    optionalVideo: video('living-traditions', '3a16fbf5-2d3e-4134-9525-5fb4bf5576a8', 5, 'slow pan from the loom across the pottery stalls to the street'),
    acts: ['04-06'],
    reviewStatus: 'approved',
  },

  // ───────────────────────── Culinary ─────────────────────────
  {
    id: 'culinary-district',
    category: 'culinary',
    sourceId: '3fd18780-ea4f-45fe-a7f6-13f317cc14d9',
    src: still('culinary-district'),
    width: 3840,
    height: 2160,
    alt: 'The proposed Afro-Culinary District at sunset: shaded dining terraces, warm lighting and visitors at restaurants and cafés along a landscaped street.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: { x: 0.5, y: 0.5 },
    motionEligible: true,
    visualTone: 'sunset',
    acts: ['04-07'],
    reviewStatus: 'approved',
    notes: 'No clip yet. The chapter’s day-to-evening shift is done in CSS (colour temperature + vignette) until a Higgsfield clip exists.',
  },

  // ───────────────────────── Performance ─────────────────────────
  {
    id: 'arena-night',
    category: 'performance',
    sourceId: 'd686b2cb-e862-41ae-987d-cd611db926ca',
    src: still('arena-night'),
    width: 3840,
    height: 2160,
    alt: 'Night at the proposed Grand Cultural Performance Arena: an open-air amphitheatre with a golden mask stage, dancers and drummers under stage light, a full audience and the city skyline beyond.',
    priority: 'hero',
    desktopCrop: WIDE,
    mobileCrop: { aspect: '9 / 16', position: '50% 50%' },
    focalPoint: CENTER,
    motionEligible: true,
    visualTone: 'night',
    optionalVideo: video('arena-night', '17c01f26-cb67-4106-bb2c-76bb1c24b56e', 7, 'slow pull back and rise over the audience, revealing the whole arena and skyline'),
    acts: ['04-08'],
    reviewStatus: 'approved',
    notes: 'The only true night frame and the emotional peak of Act 04.',
  },
  ...(['6903c93a-2af0-4810-bb73-a5e8f0731d38', 'b8c1e496-f789-40f4-9eda-3b56b298b613', 'f9fd7c2c-65dc-4682-ab7d-72b02b7889b1'] as const).map(
    (sourceId, i): MediaAsset => ({
      id: `arena-alt-${'abc'[i]}`,
      category: 'performance',
      sourceId,
      src: still(`arena-alt-${'abc'[i]}`),
      width: 2752,
      height: 1536,
      alt: 'Alternate view of the proposed performance arena at night.',
      priority: 'reserve',
      desktopCrop: WIDE,
      mobileCrop: PORTRAIT,
      focalPoint: CENTER,
      motionEligible: false,
      visualTone: 'night',
      acts: [],
      reviewStatus: 'reserve',
    }),
  ),

  // ───────────────────────── Hospitality ─────────────────────────
  {
    id: 'hospitality-terrace',
    category: 'hospitality',
    sourceId: 'd28f1ab1-f2bc-4d08-ba67-46f96d7fb623',
    src: still('hospitality-terrace'),
    width: 3840,
    height: 2160,
    alt: 'A private reception terrace in the proposed hospitality wing at sunset: contemporary African-inspired interiors, stone and bronze finishes, and a panoramic view toward the Heritage Hall.',
    priority: 'primary',
    desktopCrop: WIDE,
    mobileCrop: PORTRAIT,
    focalPoint: { x: 0.5, y: 0.5 },
    motionEligible: true,
    visualTone: 'sunset',
    acts: ['08', 'briefing'],
    reviewStatus: 'approved',
    notes: 'The diplomatic / investor image. No emblems, no handshake.',
  },

  // ───────────────────────── Reference sheets (never rendered) ─────────────────────────
  ...([
    ['entrance-sheet', 'acd5d229-bf79-48e7-b89a-8f9604ef05f7'],
    ['heritage-hall-sheet', '936a92a5-a1c5-4bb0-9118-36d8bd1df22f'],
    ['heroes-sheet', 'ee6aa95a-1e82-4571-961a-83b5709c2a18'],
    ['nations-sheet', '26917ccf-97ac-430d-b2f8-eda70ac9efb2'],
    ['library-sheet', '589713ff-db16-47cc-bb34-bba5f2196906'],
    ['mythology-sheet', 'f22babc9-5206-4014-9e0f-b95333f410c1'],
    ['arena-sheet', 'f7bff95a-71fe-4fdd-9f2a-d6b59a083550'],
  ] as const).map(
    ([id, sourceId]): MediaAsset => ({
      id,
      category: 'reference',
      sourceId,
      src: still(id),
      width: 5504,
      height: 3072,
      alt: 'Multi-angle reference sheet (internal).',
      priority: 'excluded',
      desktopCrop: WIDE,
      mobileCrop: WIDE,
      focalPoint: CENTER,
      motionEligible: false,
      visualTone: 'day-neutral',
      acts: [],
      reviewStatus: 'excluded',
      notes: 'Contact sheet. Reference only; never displayed.',
    }),
  ),
];

export const mediaById: Record<string, MediaAsset> = Object.fromEntries(mediaManifest.map((m) => [m.id, m]));

export function getMedia(id: string): MediaAsset {
  const asset = mediaById[id];
  if (!asset) throw new Error(`mediaManifest: unknown asset "${id}"`);
  return asset;
}

export function mediaForAct(act: string): MediaAsset[] {
  return mediaManifest.filter((m) => m.acts.includes(act) && m.priority !== 'excluded');
}

export function sourceFor(asset: MediaAsset): MediaSource {
  const source = mediaSourceById[asset.sourceId];
  if (!source) throw new Error(`mediaManifest: ${asset.id} points at unknown source ${asset.sourceId}`);
  return source;
}

/** Assets that should be downloaded and processed by media:fetch. */
export const fetchableAssets = mediaManifest.filter((m) => m.priority !== 'excluded');

/** Hand-picked “strongest of” shortlist, kept here so docs and code agree. */
export const curatedPicks = {
  hero: 'aerial-reveal',
  entrance: 'entrance-gateway',
  aerial: 'aerial-reveal',
  night: 'arena-night',
  blueHour: 'aerial-sunset',
  interior: 'heroes-hall-statue',
  humanCentred: 'child-eyes',
  diplomatic: 'hospitality-terrace',
} as const;

/** Audio owned by the project but excluded from the web experience by design. */
export const excludedAudio = [
  { sourceId: 'f8f0c8b5-cf9a-4dba-9466-af32632bcc0d', reason: 'Orchestral trailer score, 30 s — the brief rules out continuous music.' },
  { sourceId: '0c07e36b-0987-4686-bc73-78b8f0b5700c', reason: 'Continuation of the same score, 20 s.' },
] as const;

/** Superseded or duplicate clips we keep registered but never ship. */
export const excludedVideo = [
  { sourceId: '60a9ed3b-f7e1-4023-9329-b42cef4e6357', reason: 'Topaz 4K upscale of the first-take child-eyes clip; the 08:22 re-take is used instead.' },
] as const;
