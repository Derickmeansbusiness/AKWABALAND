# AKWABA-LAND UAE — Higgsfield Motion Brief

For anyone generating new motion or supplementary assets for the presentation. Read the global rule first; it overrides everything below.

## Global rule

Architecture must remain geometrically stable for the full clip.

Never add buildings. Never remove buildings. Never change signage. Never deform façades. Never warp roads or water edges. Never create impossible crowd motion. No morphing, no fantasy, no theme-park effects.

Think architectural cinematography: an EMAAR launch film, not an AI showreel. If a camera move would be impossible for a real drone or dolly operator, do not ask for it.

Default negatives on every prompt: `no text changes, no new structures, no building distortion, no warping, no morphing, no flicker, no camera shake, no speed ramps, no lens flare bursts, no fisheye, no crowds appearing or disappearing, no people duplicating, no cartoon look, no sepia`.

Recommended model: Kling 3.0 at 3840×2160, 16:9, `sound: off` (the site is silent by default; existing clips carry audio we strip at build). Keep `enhance_prompt: false` so the negatives survive.

## What already exists

Twelve final clips (5 Oct, 08:22 UTC batch) animate the eleven V3 stills plus the child's-eyes portrait. They are registered in `src/data/mediaSources.ts` and attached to assets in `src/data/mediaManifest.ts`. Do not regenerate these unless a review finds drift in the last second — common with Kling at 5 s. If a clip drifts, trim to 4 s in the fetch script rather than re-rolling.

## Priority 1 — Night aerial for Act 10

| field | value |
|---|---|
| source image category | master-aerial (`aerial-reveal` d496f8b7 as reference, or a new still) |
| step one | Generate a **still** first: same camera as `aerial-reveal`, blue hour 20 minutes after sunset, deep indigo sky, architecture lit from within, warm 2700K interior glow, pools reflecting, Dubai skyline lit on the horizon, no fireworks, no lasers |
| duration | 7 s (longest available) |
| aspect ratio | 16:9, 3840×2160 |
| camera movement | very slow orbital drift: 4–6° around the Heritage Hall, holding altitude, finishing on the hall centred |
| environment movement | fountain surfaces only, faint traffic light movement on the skyline, nothing else |
| must remain fixed | every building footprint, the gateway wordmark, road geometry, the skyline silhouette |
| negative instructions | default negatives + `no sunrise, no sun in frame, no neon, no projection mapping, no searchlights, no fireworks` |

Why: the finale has to out-weigh the opening. Reusing the sunset frame cannot do that.

## Priority 2 — Ceremonial promenade for Act 03

| field | value |
|---|---|
| source image category | promenade (new still, referencing `heritage-hall-facade` and `nations-boulevard` for continuity) |
| step one | Still: eye level, 35 mm, standing on the ceremonial axis with the water channel leading to the Heritage Hall, late morning, visitors walking away from camera, trees in shade |
| duration | 5 s |
| aspect ratio | 16:9 |
| camera movement | controlled forward dolly at walking pace, perfectly level, no bob |
| environment movement | water ripples, tree canopy breathing, people walking naturally |
| must remain fixed | the hall at the vanishing point, the channel edges, paving pattern |
| negative instructions | default negatives + `no people crossing the lens, no birds, no clouds racing` |

## Priority 3 — Culinary day-to-evening

| field | value |
|---|---|
| source image | `culinary-district` (3fd18780) |
| duration | 7 s |
| aspect ratio | 16:9 |
| camera movement | static or a 2% push; this clip is about light, not camera |
| environment movement | the sky deepens half a stop, terrace lights warm up, diners move subtly, steam from a kitchen pass |
| must remain fixed | all furniture layout, canopy structures, planting |
| negative instructions | default negatives + `no day-night flip, no sudden exposure change, no flickering lights` |

If the model cannot do a lighting change cleanly, generate a **daytime still** of the same frame instead and let the site crossfade day → evening on scroll.

## Priority 4 — Hospitality terrace

| field | value |
|---|---|
| source image | `hospitality-terrace` (d28f1ab1) |
| duration | 5 s |
| aspect ratio | 16:9 |
| camera movement | slow push from the interior toward the terrace edge and the view |
| environment movement | sheer curtains, water surface outside, light moving on stone |
| must remain fixed | furniture, ceiling, the Heritage Hall silhouette in the view |
| negative instructions | default negatives + `no people, no glasses clinking, no handshake` |

## Priority 5 — Material detail loops (transition masks)

Three short loops, 4 s each, 16:9, seamless if possible. No architecture, so lower risk.

1. **Bronze** — raking light crossing a brushed bronze panel, slow, matte, no glossy highlights.
2. **Limestone** — ivory limestone with a shadow line moving one centimetre.
3. **Indigo textile** — woven cloth, a slow breath of air across it, hands absent.

Negatives: `no logos, no patterns that read as a specific ethnic textile unless accurate, no gold leaf, no glitter`.

## Depth maps (optional, for 2.5D)

If a depth-estimation step is available, produce depth maps for `aerial-reveal`, `entrance-gateway`, `heritage-hall-facade` and `arena-night` only. Register them in the manifest under `optionalDepthMap`. The site uses them for subtle parallax; if the result bends a façade on test, we do not ship it.

## Sound (only if asked for)

Default is silence. If ambient layers are commissioned: water, wind, museum hush, distant voices, a single low drum. Each ≤ 20 s loop, −24 LUFS, no melody. The existing orchestral stems are not for the web experience.

## Delivery

Drop new job ids into `src/data/mediaSources.ts` (regenerate via the same jq step documented in ASSET_AUDIT.md, or append by hand with the same shape), attach to an asset in `mediaManifest.ts`, run `npm run media:fetch`, and check the clip at 1× and 0.25× before committing.
