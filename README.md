# AKWABA-LAND UAE — the digital unveiling

A private, cinematic presentation of a proposed Pan-African cultural heritage destination in the United Arab Emirates. One scroll, ten acts. Built for royal family offices, government leadership, sovereign investors, developers and African ministries — people who will judge the proposition partly by how it is presented.

Concept development. Confidential. Subject to feasibility, approvals and development.

## Start here

```bash
npm install
cp .env.example .env.local        # set SITE_VISIBILITY, optional access code and briefing webhook
npm run media:fetch               # pulls the approved renders and clips from Higgsfield, encodes the ladders
npm run dev
```

`media:fetch` needs network access to the two Higgsfield CDN hosts and, ideally, `ffmpeg` on PATH for the muted 1080/720 clip transcodes. Without ffmpeg the 4K originals are copied and played muted. Until the fetch has run, the build streams straight from the CDN on its own (it checks for `public/media/akwaba/placeholders.json`); set `NEXT_PUBLIC_MEDIA_SOURCE` only to force one or the other.

Before shipping:

```bash
npm run typecheck && npm run lint && npm run build
```

## The structure

```
src/
  app/                      layout (fonts, robots), the experience, /development, /briefing, /downloads, /access
  components/
    cinematic/              stage pattern, act registry, Experience shell, ecosystem diagram
    sections/               the acts: Opening (00–02), Act03Axis, Act04Experiences + ExperienceChapter, Act05–Act10
    three/                  AfricaSculpture (Act 00), Globe (Act 06)
    maps/                   AfricaMap (Act 05, SVG, keyboard-accessible), NetworkMap (Act 09)
    media/                  CinematicMedia — still + optional muted clip
    typography/ navigation/ presentation/ ui/ pages/
  data/                     every word and every asset: siteContent, experienceZones, mediaManifest, mediaSources,
                            nationPavilionModel, partnership, development, sources
  lib/animation             gsap registration, easing vocabulary, beats (threshold-triggered text), useGsap
  lib/webgl                 Natural Earth → THREE.Shape / SVG, shared topology loader
  lib/media                 local vs remote resolution, tone placeholders
  hooks/                    useReducedMotion, useMediaQuery (+ device tier), usePresentationMode, useSmoothScroll
scripts/                    build-geo, fetch-media, qa-* (Playwright screenshots, probes, presentation checks)
docs/                       ASSET_AUDIT, CREATIVE_DIRECTION, HIGGSFIELD_MOTION_BRIEF
public/geo                  Africa 1:50m and world land 1:110m TopoJSON, generated
```

## How motion is organised

Every act is a tall section with a sticky 100vh **stage** inside it. Scroll distance is time. Two kinds of motion live on a stage:

- **Scrub** — the camera. `scrubAcross(section, from, to, tween)` ties a GSAP tween to a progress range (0..1 of the stage's scrollable distance). Images push, drift, dissolve; veils open and close.
- **Beats** — the words. `createBeats(section, [...])` creates threshold triggers: a statement enters when a progress is crossed and plays out on its own clock, which is what keeps typography from feeling mechanical. `RevealLines` does the clipped line reveal; the beat's `onShow` flips its `play` prop.

All of it is created inside `useGsap`, a `gsap.context` scoped to the section, so nothing leaks between acts or route changes. Reduced motion collapses durations and skips camera scrub; the narrative and every image remain.

The three WebGL scenes render only while their act is near the viewport and dispose on unmount.

## Modes

| URL | effect |
|---|---|
| `/?presentation=true` | minimal nav, act indicator, ← → / space / PageUp / PageDown to move between acts, F for fullscreen, public CTAs hidden |
| `/?presentation=true&audience=royal` (`government`, `investor`, `culture`) | same content today; `actOrderFor()` in `siteContent.ts` is where an audience-specific sequence would go |

## Visibility

`SITE_VISIBILITY` = `PUBLIC` · `UNLISTED` · `PRIVATE` (default) · `PASSWORD_PROTECTED`. Anything but PUBLIC sets `noindex, nofollow` in metadata and an `X-Robots-Tag` header. `PASSWORD_PROTECTED` routes every request through `src/proxy.ts` and the `/access` page; the code lives in `SITE_ACCESS_CODE`. This is a shared-code gate for a presentation, not an authentication system — keep genuinely confidential documents off the public bucket.

## Media

Nothing is hard-coded. `src/data/mediaManifest.ts` is the curated selection; `src/data/mediaSources.ts` is the generated registry of everything the project owns on Higgsfield. Every entry carries alt text, focal point, desktop and mobile crops, tonal placeholder, review status and, where one exists, the clip. `docs/ASSET_AUDIT.md` explains the picks and the gaps; `docs/HIGGSFIELD_MOTION_BRIEF.md` is the brief for anything new.

The site is silent by default. No sound assets ship; the sound control appears only once ambient layers exist in the manifest.

## QA

```bash
npm run build && NEXT_PUBLIC_MEDIA_SOURCE=remote npx next start -p 3000
node scripts/qa-screens.mjs      # 61 frames × desktop / tablet / mobile / reduced-motion → qa/screenshots
node scripts/qa-pages.mjs        # the auxiliary pages
node scripts/qa-modes.mjs        # presentation keyboard flow + map keyboard access
node scripts/qa-errors.mjs URL   # unminified page errors from a dev server
```

Chromium is expected at `/opt/pw-browsers` (the cloud environment) or `CHROMIUM_PATH`.
