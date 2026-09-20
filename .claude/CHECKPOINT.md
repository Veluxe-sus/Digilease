# Checkpoint: DigiLease v2

## Now
Branch `v2-redesign`. `main` remains untouched at `5f7817f` as the submittable v1 fallback.
The owner card, print pass, corrected warm light theme, dark theme and receiver are browser-verified.

## Verified on 2026-09-20
- `/new`, `/card/:id`, `/card/:id/print/:token`, `/cards`, and the receiver offline reload were
  already verified at 1440x900 and 390x844; see `docs/HANDOFF-CODEX.md` for the full gate.
- `/cards` uses the supplied React Bits DepthCarousel with real card faces. It never advances on
  its own; arrows, dots, drag and keyboard selection update the detail with a short directional
  fade/slide.
- The deck face is now a portrait address pass using only real card data: DIGIPIN, landmark and
  saved date. The desktop page uses a calmer 36/64 split, larger section rhythm, five equal expiry
  choices and a full-width secondary action. Mobile has no horizontal overflow.
- The A6 print card now shares the same pass construction. The recipient label, real QR, DIGIPIN,
  landmark and actual expiry are the only data shown; no fake barcode or credential fields were
  added. Browser-checked with and without a door photo at 1440x900 and 390x844.
- React Bits BlurText, BorderGlow and ShapeGrid polish the landing; FadeContent, AnimatedContent
  and CountUp add restrained app feedback. HoldButton guards revoke; SquishSwitch persists dark mode.
- Smoothed native anchor/button transitions without scroll hijacking. Fixed the narrow DIGIPIN
  wrap, replaced the empty em-dash plate with `Tap the map`, darkened expired amber for contrast,
  changed the revoke claim to `Online views stop immediately`, and moved carousel arrows to
  Phosphor icons.
- The receiver phone view now uses the theme-matched Amazon map, a capped door photo and in-flow
  route controls. Card deletion requires a hold and removes the card, photo, offline area, links and
  access history. Browser check passed at 390x844; tests 10/10 + 13/13, lint/build and SAM build green.
- Build still prints the existing DIGIPIN CommonJS-variable warning and large-chunk warning.
## Next
1. Retake `docs/screenshots/*` after the rename and replace `frontend/public/shots/*`.
2. Rewrite stale `docs/DESIGN.md` sections 2-4 for the v2 palette, fonts and pass direction.
3. Add a real door photograph only if the user supplies one; do not fake or generate it.
4. Deploy the updated SAM stack, then upload `Desktop\digilease-v2-dist.zip` to Amplify and hard-reload.

## Non-negotiables
- All work stays on `v2-redesign`; never edit or deploy `main`.
- Never edit either DIGIPIN source file; preserve the receiver consent and offline flow.
- Visible claims must stay within the honesty table and banned-vocabulary rules in
  `docs/HANDOFF-CODEX.md`.
