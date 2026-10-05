# Build status — 2026-10-05

What exists, what was checked, and what I could not check from here.

## Done

All ten acts, the three auxiliary pages, the access gate, presentation mode, the media pipeline, the geodata pipeline, and the QA scripts. `typecheck`, `lint` and `build` are clean. Playwright captured 61 frames per device (desktop, tablet, mobile, reduced-motion desktop) with no page errors; the only console errors are the Higgsfield CDN being blocked from the build container.

## Checked by eye (screenshots in `qa/screenshots` after running the QA scripts)

- Opening: bronze continent surfaces, three lines on their own clock, scroll hint, hand-off to the aerial, AKWABA-LAND lockup, descriptor, "Africa, experienced differently", welcome, arrival line, close through black.
- Axis: statement, eight waymarks landing in sequence.
- Experiences: eight chapters with distinct layouts and words; disclaimers present on the pavilions chapter.
- Nations: continent in bronze, keyboard walk across countries works (Zimbabwe reached via → ↓ from the first country), panel updates.
- Why the UAE: globe with land and a lighter Africa, arcs converging on the Gulf, three statements, title.
- Economy: orrery with fourteen labelled streams, two statements, body.
- Partnership: two columns, convergence, lockup, resolution.
- Network: flagship, five regions, drawn lines, statement.
- Invitation: three stages, lockup, triad, three actions, status footer; actions hidden in presentation mode.
- Presentation mode: indicator, ← → stepping through all eleven stops, fullscreen button present.
- Auxiliary pages on desktop and mobile.
- Reduced motion: text present, no scrubbing, sculpture static.

## Not checked, and why

**The photographs.** Every frame above was captured with the CDN blocked, so the images render as their tonal placeholders. The compositions, focal points and scrims were designed from the shot briefs and the motion prompts, not from the pixels. Run `npm run media:fetch` on a machine that can reach `d8j0ntlcm91z4.cloudfront.net`, then re-run `node scripts/qa-screens.mjs` and look at: hero crop at 16:9 and 9:16, the gateway's wordmark surface under the arrival text, legibility of white type over the brighter chapters (library, children's fortress, pavilions), and the sunset aerial under the finale lockup. Adjust `focalPoint`, `mobileCrop.position` and scrim opacities in the manifest and sections accordingly. Budget twenty minutes.

**Clip behaviour.** Videos were never loaded. Confirm each clip's first frame matches its still (they were generated from those stills, so it should) and that the last second does not drift; trim in `fetch-media.ts` if it does.

**Real devices.** Only Chromium headless with software GL. Check Safari for the sticky stage + Lenis combination and iOS for the video autoplay.

## Known small things

- The act indicator can lag a beat behind a keyboard jump into the globe act while the texture is being drawn; it catches up. Stepping itself is correct.
- `media:fetch` without ffmpeg copies the 4K originals as the "1080" variant; install ffmpeg before the public deploy.
- No ambient sound ships; the control appears only when `soundLayers` has entries.
- Act 10 uses the sunset aerial; the brief wants a true night aerial. The Higgsfield brief for it is priority 1.
