# Handoff: finish the DigiLease v2 frontend

You are picking up a half-finished frontend redesign under a hard deadline. Read this file
completely before touching anything, then read `AGENTS.md`, `.claude/CHECKPOINT.md` and
`docs/SPEC.md`.

## The situation in one paragraph

This repo is a working hackathon project, formerly **PataCard**, now renamed **DigiLease**. It turns
an India Post DIGIPIN into an address card you share as one revocable link per person. The backend,
the receiver view and the offline map all work and are deployed. The v1 frontend was a plain grey
utility UI. Branch `v2-redesign` is a visual overhaul of the owner-facing surface. The landing page,
signed-in routes and receiver offline regression are now browser-verified locally.

## Non-negotiables

- **`main` is the fallback and must stay untouched at `5f7817f`.** With `Desktop\pata-card-dist.zip`
  it is the submittable v1. All work goes on `v2-redesign`. If v2 is not verified in time, v1 ships.
- **Deadline: 18:00 IST on 2026-09-20** for video and submission. Go/no-go on v2 at 17:30.
- **Never edit `frontend/src/lib/digipin.js` or `backend/src/digipin.js`.** They are India Post's
  file. A test asserts the frontend copy equals the backend copy plus one appended export line.
- **Do not touch**: anything under `backend/`, `template.yaml`, the `api` object in
  `frontend/src/lib/api.js`, `frontend/src/pages/SharedView.jsx`,
  `frontend/src/components/OfflineMap.jsx`, `frontend/src/lib/offline.js`,
  `frontend/public/sw.js`. The receiver and offline flow is the demo centrepiece and any regression
  there loses the hackathon.
- **Infrastructure belongs to the user.** Never run `sam deploy`, `aws` commands or anything that
  spends money without asking. The user uploads the built zip to Amplify themselves.

## The honesty rule (the hardest constraint, read twice)

Earlier design comps invented an entire fake technical apparatus. None of it may appear on screen,
ever. **Banned from every visible string:**

> EPSG codes · WGS84 · NavIC · RTK · cadastre · tenure · lease registry · statute references ·
> hashes · token strings · barcodes · serial numbers · plot numbers · azimuth or bearing · latency
> figures · SLA · on-chain · ISO standards · "verified" / "photo verified" / "ground verified"
> badges · any accuracy tighter than 5 m · invented counters or statistics

Two are worse than filler and must never come back: **"photo verified"** claims a verification step
that does not exist (the owner uploads a photo, nobody checks it), and **a barcode encodes nothing**
(the QR code is the real artifact).

**The only material allowed on screen** is what the app actually has:

| Real thing | Source |
|---|---|
| A 10-character DIGIPIN, displayed `4T3 96F4 2L7` (3-4-3) | `lib/digipin.js`, computed server-side |
| A DIGIPIN cell is *about* 3.8 m, never a stated 3.82 m spec | India Post |
| `card.lat`, `card.lon` | the card record |
| Real GPS accuracy in metres | the browser's `coords.accuracy` |
| `card.landmark`, up to 200 characters | typed by the owner |
| `card.photoUrl` behind a 5-minute signed URL | S3 |
| `share.label`, up to 40 characters | e.g. "Ambulance" |
| `share.status`: live / expired / revoked | the share record |
| Expiry presets 2 h, 24 h, 72 h, no expiry, custom 1 to 168 | `CardDetail.jsx` |
| `timeLeft(share.expiresAt)` countdown | `lib/format.js` |
| The access log: a label and `openedAt` | `api.listAccess` |
| A QR code of the share URL | the `qrcode` package |
| A printable A6 card | `pages/PrintCard.jsx` |
| Offline streets, route, own-position dot, distance | the service worker plus S3 |
| Email sign-in | Cognito |

The landing page also states the product's limits out loud, on purpose, and that line must stay: a
receiver can screenshot what they saw, and an offline copy keeps working until their phone next goes
online.

Also: **no em-dashes anywhere in visible copy.** Use a plain hyphen or restructure.

## The design direction

**The address card is a physical pass.** Paper stock, a lanyard badge, a perforated tear stub per
receiver, an A6 you can print and tape to a gate. The metaphor is the product: you hand a stub over,
and you tear it back. Every new surface should extend that, not decorate around it.

Mode for the signed-in pages is **Operate**: scanability, consistency and the real usage scene beat
expression. The landing page is **Persuade**.

### Tokens (`frontend/src/index.css`, the `:root` block)

```
--paper   #FBF7E4   page background        --surface #FFFFFF  panels and the pass
--ink     #26301C   all text               --muted   #6B7360
--line    #D9CFA8   hairlines and grid     --accent  #B05A28  the only accent (press #8E4720)
--live    #4A7A3A   --expired #A8761F      --void    #9B2F22  destructive and errors
--hero-bg #191D14
--display "Space Grotesk"  --font "Inter"  --mono "JetBrains Mono"
```

`--post` and `--post-press` are **aliases** pointing at `--accent`. That is deliberate: roughly
twenty pre-existing rules still say `--post`, and the alias rethemed all of them at once. Do not
"clean this up" by find-replacing; it is load-bearing and harmless.

**One hard type rule: JetBrains Mono is for machine facts only** — the DIGIPIN, timestamps, time
remaining, GPS accuracy. A landmark is a sentence a person typed, so it gets Inter. Putting mono on
every label is exactly what made the rejected comps read as fake-technical.

Only one accent. Green, amber and red appear only as real status. Destructive stays a *text* button
in `--void`; only the confirmation step is a filled `--void` button.

## What is already built and working

The current `v2-redesign` tree passes `npm test` 10/10 and `npm run lint`; `npm run build` is green.

- **Rename** PataCard to DigiLease across UI, README and `docs/*.md`. Stack names, bucket names and
  the GitHub repo stay `pata-card`; infrastructure is unchanged.
- **`/` landing (`pages/Hero.jsx`, `hero.css`)** — verified at 1440x900 and 390x844. React Bits
  ShapeGrid as the DIGIPIN grid (the squares *are* 3.8 m cells; hovering lights one). BlurText gives
  the headline one short word reveal; BorderGlow responds only near the physical pass edge. The pass
  has a countdown that really ticks (`components/LanyardPass.jsx`). Sections:
  hero, who we are, what it is, an eight-cell MagicBento of real features, how it works, closer.
  Two bento cells carry real screenshots from `public/shots/`.
- **Sign-in** — still Amplify's `<Authenticator>`, logic untouched, restyled only through its own
  CSS variables, sitting on the same grid as the landing (`components/OwnerArea.jsx`, and the
  `[data-amplify-authenticator]` block in `cards.css`).
- **`/cards` (`pages/MyCards.jsx`, `cards.css`)** — React Bits DepthCarousel on the left, the opened
  card on the right. One card sits still, two to six ride the depth rail, seven or more fall back to
  a scroll-snap rail. Confirmed at 1440x900 and 390x844 with three real cards; arrows, dots, drag,
  keyboard and autoplay all keep the opened detail in sync.
- **`components/CardDetail.jsx`** — the opened card, shared by `/cards` and `/card/:id`. Share rows
  are tear stubs with a dashed perforation between them; a revoked stub stays visible and struck
  through, because seeing the dead link is the pitch.
- **Nav (`components/SiteNav.jsx` + `reactbits/CardNav.jsx`)** — destinations are inline on desktop
  and behind the hamburger only under 768px. This was a real bug: the links were hidden behind the
  hamburger, the user could not reach `/cards`, and the expanding menu sometimes opened empty.
- **Fixed on the way:** the print stylesheet hid the old `.topbar`, so the new pill nav would have
  printed on every A6 card.

### React Bits components, and the edits made to them

All live in `frontend/src/components/reactbits/`. The edits are the risk surface; do not revert them.

| File | What was changed and why |
|---|---|
| `ShapeGrid.jsx` | Square variant only; the hexagon/circle/triangle branches were dropped. Honours `prefers-reduced-motion` by painting once. Self-pauses off-screen and on tab blur. |
| `CardNav.jsx` | `react-icons` swapped for Phosphor's `ArrowUpRight`. Hardcoded "Get Started" now takes label and handler from props. New `links` prop renders inline destinations on desktop. `brand` accepts a node. |
| `MagicBento.jsx` | Takes real children instead of the demo `cardData`. Star particles, cursor magnetism and the click ripple were removed: twelve looping DOM nodes per card say nothing about the feature on the card. The cursor spotlight and border glow stay. |
| `MagicBento.css` | The upstream global `:root` block (which sets `color-scheme`) is **scoped to `.bento-section`**; unscoped it fights this project's tokens. Shot captions sit *under* the image, not over it. |
| `DepthCarousel.jsx` | Takes a `renderItem` callback so the rail carries real DigiLease pass faces instead of demo images. Stable card keys and card-specific accessible labels were added. Narrow-screen scaling reserves less empty fan space so the DIGIPIN stays readable. Autoplay pauses on hover or focus, reduced motion disables autoplay and animated transitions, and the control arrows use Phosphor. |
| `BlurText.jsx` | Keeps the supplied word/letter API, adds a semantic `as` prop and an accessible whole-text label, and renders the final state immediately for reduced motion. It is used once, on the hero headline. |
| `BorderGlow.jsx` | Keeps the supplied pointer-edge response, uses the paper/brick/olive palette, ignores touch pointers, resets on pointer leave and removes the effect for touch or reduced motion. It wraps only the hero pass. |

New dependencies, all free and MIT: `gsap@3.15` (four React Bits components need it),
`@phosphor-icons/react@2.1`, and `motion@13.4` (BlurText).

## What is left to do, in priority order

The release gate is complete: `/new`, `/card/:id`, `/card/:id/print/:token` and `/cards` were checked
at 1440x900 and 390x844. A fresh live `/s/{token}` link reached "Saved for offline", then rendered
the saved map, marker, DIGIPIN and OpenStreetMap credit after a forced offline reload.

1. **Retake `docs/screenshots/*`.** Both bento shots were taken before the rename: one still contains
   the old PataCard wordmark and the other a dev preview banner. They are currently cropped past the
   offending area with `object-position: center 42%` in `MagicBento.css`. Once retaken, copy the two
   phone shots to `frontend/public/shots/` and set that back to `top center`.
2. **`docs/DESIGN.md` is stale.** It still documents the v1 world (Post Red `#C3272B`, Satoshi,
   survey-paper `#F4F6F8`) and now contradicts the code. Rewrite sections 2, 3 and 4 to the tokens
   above and the pass direction.
3. **A door photograph.** The repo has none, so the hero pass deliberately shows no photo and the
   "Landmark and door photo" bento cell is text only. One JPEG in `frontend/public/` would close the
   biggest visual gap. Do not substitute a stock or generated photo without asking the user.
4. **Ship:** `npm run build`, zip the `dist` with a Python script using forward-slash paths (**not**
   PowerShell `Compress-Archive`, which writes backslash paths Amplify rejects), then the user
   uploads it in Amplify under Deploy updates.

## Known rough edges, honestly stated

- On narrow phones the carousel scales the pass to leave room for its arrows and depth edge. The
  DIGIPIN remains readable, while the full-size detail directly below is the primary reading view.
- App pages ship **light only**. There is no dark variant; that time went into the deck instead.
- `CardNav`'s expanding-card menu recalculates its height on resize and has been seen to open empty
  after a browser zoom change. It is now phone-only, so it is off the main path, but it is not fixed.
- The hero headline runs to three lines at desktop. The usual rule is two, but this is a two-column
  hero with a half-width text column, so it was accepted deliberately.

## Commands

```
cd frontend && npm install          # React Bits dependencies are already in package.json
cd frontend && npm run dev          # port 5173, fixed: CORS and the map key allow only this origin
cd frontend && npm test             # 10 tests, node:test, no framework
cd frontend && npm run lint         # oxlint
cd frontend && npm run build
cd backend  && npm test             # 13 tests
```

## How to work

Announce what you will change and which files before editing. Anything touching three or more files
gets a short plan and the user's approval first. Ask one question at a time, and only when the
answer changes the work. Report failures plainly, with the output. Do not add files, features or
abstractions that were not asked for. Keep every file under 500 lines.
