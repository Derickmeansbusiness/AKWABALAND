# AKWABA-LAND UAE — Asset Audit

Date: 2026-10-05
Scope: every Akwaba-Land image, clip and audio file the project owns.

## Where the assets actually live

The repository was empty when this audit started. There is no `/assets`, `/public` or "AKWABA LAND" folder on disk, and nothing under that name in Canva.

What exists is the Higgsfield workspace (`ddf09831-…`, Ultra plan). The approved Akwaba-Land material is the generation history from **4 October 17:47 UTC to 5 October 08:26 UTC**. Everything before that (2 October) is a different project — a Burkina Faso biography and children's comic — and is excluded here.

Both Higgsfield CDNs (`d8j0ntlcm91z4.cloudfront.net`, `d2ol7oe51mr4n9.cloudfront.net`) are **denied by this cloud environment's network policy**. That has two consequences you should know about:

1. I could not open a single image. Classification below is by generation lineage and the shot brief each render was made from, plus the motion prompt written for it (which describes the frame literally). Where a judgement needs eyes, the manifest carries `reviewStatus: 'needs-visual-review'` and this document lists the exact question to answer.
2. Nothing is bundled in the repo yet. `npm run media:fetch` downloads, converts and sizes everything into `public/media/akwaba/` from a machine that can reach the CDN. Until then the site resolves media from the CDN when `NEXT_PUBLIC_MEDIA_SOURCE=remote`.

To unblock downloads from this environment, add those two hosts under Allowed domains in the environment's network settings.

## The pipeline that produced the set

Reading the history, the workflow was disciplined and it shows:

1. **Master prompt** (`gpt_image_2_5`, 3840×2160): one governing brief — "Contemporary Afro-Modern Luxury", photography by Hayes Davidson/DBOX/MIR standard, Louvre Abu Dhabi / House of Wisdom as quality references, explicit negatives (no mud-brick, no sepia, no safari, no sci-fi). Four aerial masters were rendered from it.
2. **Eleven numbered shots** from the same brief (entrance, Heritage Hall, Heroes, Pavilions, Children's Fortress, Living Traditions, Mythology, Culinary, Arena, Hospitality) plus a dedicated Library interior the next morning.
3. **Multi-angle sheets** (`nano_banana_2_shots`, 5504×3072) for seven scenes, then 2752×1536 upscales of the best crops.
4. **Motion** (`kling3_0`, 3840×2160, 5–7 s, generated with embedded audio): twelve clips, run twice. The 08:22 batch is the final take; the 07:57 batch is superseded.
5. One Topaz 4K upscale of a clip, and a 30 s + 20 s orchestral score (`seedance_2_5`).

Total in scope: **47 images, 12 final clips, 1 upscaled clip, 2 audio stems.**

## Inventory by category

Ids are the first 8 characters of the Higgsfield job id. Full ids, dimensions and URLs are in `src/data/mediaSources.ts`.

### Master aerial
| id | what it is | motion | manifest id |
|---|---|---|---|
| `d496f8b7` | Shot 01 "Grand Aerial Reveal": gateway, great domed hall, Dubai skyline on horizon, sunrise light | `d19ee403` drone rises and pushes toward the hall (5 s) | `aerial-reveal` |
| `cd0b0f3f` | same brief, sunset: gateway foreground, skyline glowing | `37c12ea8` slow rise drifting back (6 s) | `aerial-sunset` |
| `66e8a7dc` | V3 master, neutral daylight (brief says "avoid sunset for the master") | — | `aerial-master-day` |
| `dc1a9c75` | V3 master re-run with a reference image attached | — | `aerial-master-day-alt` |

### Entrance / arrival
| `f94769f9` | Shot 02 monumental gateway: sandstone, bronze, wordmark surface, reflecting pools | `4bbc4ff1` steadicam dolly forward following a couple (5 s) | `entrance-gateway` |
| `acd5d229` | multi-angle sheet of the gateway | — | `entrance-sheet` (reference only) |
| `a74fccc4` `1a22bba9` `a85ec289` | three alternate gateway angles, 2752×1536 | — | `entrance-alt-a/b/c` |

### Promenade / ceremonial axis
No dedicated promenade render exists. The Heritage Hall forecourt (`d4f1c358`: reflecting pool, bronze globe fountain, glass façade) is the best water-axis image in the set and is used for Act 03. This is the first real gap — see below.

### Heritage Hall
| `d4f1c358` | Shot 03 façade from the ceremonial plaza, golden hour | `42df2bf8` tilt up from pool to the bronze face in the glass (5 s) | `heritage-hall-facade` |
| `936a92a5` | angle sheet | — | reference |
| `13b233e9` `2d067035` `a203328f` | alternate angles | — | `heritage-hall-alt-a/b/c` |

### Heroes
| `2a45096c` | Shot 04 gallery interior, museum lighting | — | `heroes-hall-wide` |
| `1dd19854` | crop: woman in orange dress, towering bronze statue, illuminated map of Africa | `bc40b7eb` slow push past her toward the statue (5 s) | `heroes-hall-statue` |
| `e1d9cfd8` `3b323d89` | alternate crops | — | `heroes-hall-alt-a/b` |
| `ee6aa95a` | angle sheet | — | reference |

### National pavilions
| `f3a0e144` | Shot 05 boulevard; Morocco, Egypt, Nigeria, Kenya façades toward the domed hall | `93581d9d` glide forward (5 s) | `nations-boulevard` |
| `ac0cf1fb` `442ac59e` | alternate crops | — | `nations-alt-a/b` |
| `26917ccf` | angle sheet | — | reference |

Caution: the render names real countries on façades. Copy anywhere near it must say "illustrative" — the brief forbids implying that any nation has joined.

### Library
| `5d36d379` | dedicated Literature & Comics Library interior, 5 Oct | — | `library-interior` |
| `e88e53bf` | crop: boy looking up at a suspended Africa sculpture of golden books in a circular atrium | `d0c94a24` tilt up following his eyes (5 s) | `library-atrium-boy` |
| `2399e2df` `5a502dd2` `f95bee2d` `f1b7f7fd` | alternate crops | — | `library-alt-a/b/c/d` |
| `589713ff` | angle sheet | — | reference |

### Children's Fortress
| `27147c2a` | Shot 06 discovery district, dancing fountains, shade sails | `6003739a` low tracking shot with running children (5 s) | `childrens-fortress` |
| `706b43f9` | extreme close-up of a child's eyes, soft blue light | `2fa7c778` near-static push, one blink (5 s); `60a9ed3b` Topaz 4K of the first take | `child-eyes` |

### Mythology (not in the ten-act brief, but strong)
| `66cfd5f3` | Shot 08 indoor hall around a giant baobab, spiral screens, Anansi constellation, lanterns | `31251c64` crane rise (5 s) | `mythology-hall` |
| `8eba6c01` `3fdcd93f` `8e94bd1f` `5cddd837` `5052bb4b` | crops from the mythology sheet | — | `mythology-alt-a..e` |
| `f22babc9` | angle sheet | — | reference |

### Living traditions
| `7ef76f06` | Shot 07 artisan courtyards: indigo loom, pottery, drummer | `3a16fbf5` pan from loom to street (5 s) | `living-traditions` |

### Culinary
| `3fd18780` | Shot 09 dining district, sunset into evening | — | `culinary-district` |

### Performance
| `d686b2cb` | Shot 10 night arena, golden mask stage, skyline behind | `17c01f26` pull back and rise over the audience (7 s) | `arena-night` |
| `6903c93a` `b8c1e496` `f9fd7c2c` | alternate crops | — | `arena-alt-a/b/c` |
| `f7bff95a` | angle sheet | — | reference |

### Hospitality / diplomatic
| `d28f1ab1` | Shot 11 private reception terrace over the destination, sunset | — | `hospitality-terrace` |

### Night
Only one true night image exists (`arena-night`). `aerial-sunset` is the closest thing to a blue-hour aerial.

### Landscape, details, people
No dedicated detail or material renders. People appear inside scenes only; `child-eyes` is the single portrait-scale human image.

### Audio
| `f8f0c8b5` | 30 s orchestral score: vocal call, djembe, strings, choir, brass crescendo |
| `0c07e36b` | 20 s continuation of the same |

Both are exactly the "endless cinematic trailer score" the brief rules out. They are registered but **excluded from the web experience**. If wanted, they belong only as an optional presentation-mode intro behind a user-initiated sound toggle.

Note that every Kling clip was generated with sound on. The web build plays all video muted; `media:fetch` strips the audio tracks so they are never downloaded.

## The curated picks

| role | pick | why |
|---|---|---|
| Hero (Act 01) | `aerial-reveal` | It was briefed as the reveal, it has the skyline for the UAE argument, and it has the only forward-pushing aerial clip |
| Entrance (Act 02) | `entrance-gateway` | Symmetrical, wordmark surface, matching dolly clip |
| Aerial alternate | `aerial-master-day` | Neutral light for the Development Framework page, where honesty beats drama |
| Night | `arena-night` | The only real night frame, and the emotional peak anyway |
| Blue-hour / finale (Act 10) | `aerial-sunset` | Nearest available; a true night aerial should be generated — see gaps |
| Interior | `heroes-hall-statue` | The client chose this crop to animate; bronze statue + map of Africa is the project in one frame |
| Human-centred | `child-eyes` | Portrait scale, quiet, no architecture to compete |
| Diplomatic / investor | `hospitality-terrace` | Reads as a reception room, no emblems, no handshake |

Deliberately held back: the four sheet images (reference only), the 07:57 first-take clips, the orchestral stems, and all 2 October material.

## Gaps worth filling with Higgsfield

Ordered by how much each would improve the presentation. Briefs for each are in `docs/HIGGSFIELD_MOTION_BRIEF.md`.

1. **True blue-hour or night aerial** for Act 10. The finale must feel stronger than the opening; a sunset re-use of the same viewpoint will not do that.
2. **A ceremonial promenade image** — water axis, people at eye level, Heritage Hall at the end. Act 03 is currently borrowing the hall façade.
3. **Culinary motion** — the brief wants day-to-evening within the chapter; the still is already at sunset so this needs a day plate or a slow lighting change clip.
4. **Hospitality terrace motion** — a slow push through the terrace for the partnership and briefing sections.
5. **Material detail loops** — bronze, limestone, indigo textile — 3–5 s, for transition masks. Small, cheap, high value.

Mobile crops are not a gap: every hero is 16:9 and the manifest carries a focal point per image so portrait framing is a CSS decision, not a new render.

## What needs eyes (20-minute checklist)

Open each image and settle these, then update `focalPoint` / `reviewStatus` in `src/data/mediaManifest.ts`:

- `aerial-reveal` vs `aerial-master-day`: which has the cleaner masterplan read and less orange cast? The master brief asked for neutral light; the shot brief asked for golden hour. Pick the hero by eye.
- Entrance alternates `a/b/c`: is any one stronger than `entrance-gateway` as a still? Keep one for the mobile hero if its composition is more vertical.
- Heritage alternates: choose one for Act 04-01 so Act 03 and Act 04-01 do not show the same frame.
- Library: confirm `library-atrium-boy` is the atrium view and that `library-interior` is a genuinely different angle.
- Mythology crops: identify which is the baobab wide, which are details.
- Check every frame for signage errors (AKWABA-LAND spelling on the gateway), flag mutations and duplicated people. Kling clips: watch to the end, the last second is where architecture usually drifts.
- Confirm no render shows a real emblem, government seal or royal insignia.
